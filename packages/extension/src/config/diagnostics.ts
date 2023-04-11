import * as defaultConfig from '../common/state/defaultConfig'
import * as vscode from 'vscode'
import * as R from 'ramda'
import * as fs from 'fs/promises'
import * as config from '.'
import * as utils from '../common/utils'
import { DiagnosticSeverityKeys, TXTContent, TXTOptions } from '../common/types'
import path from 'path'

/**
 *
 * @param txtFiles 文件名（不带后缀）
 * @returns
 */
export const getTXTOptions = (txtFiles: string[]) => {
  if (txtFiles.length === 0) return undefined
  const optMap = new Map<string, TXTOptions>()
  txtFiles.forEach((file) => {
    optMap.set(file, getSingleTXTOption(file))
  })
  return optMap
}

const isDiagnosticSeverity = (a: string) =>
  Object.values(vscode.DiagnosticSeverity).includes(a)

/**
 *
 * @param txtFile 文件名（不带后缀）
 * @returns
 */
const getSingleTXTOption = (txtFile: string): TXTOptions =>
  R.cond([
    [() => !txtFile, () => defaultConfig.txtOpt],
    [
      (split) => split.length === 1,
      (split) => ({ ...defaultConfig.txtOpt, message: split[0] }),
    ],
    [
      (split) => !isDiagnosticSeverity(split[1]),
      (split) => ({
        message: split[0],
        diagnosticSeverity: defaultConfig.txtOpt.diagnosticSeverity,
      }),
    ],
    [
      R.T,
      (split) => ({
        message: split[0],
        diagnosticSeverity: <DiagnosticSeverityKeys>split[1],
      }),
    ],
  ])(txtFile.split('.'))

/**
 *
 * @param p 绝对路径
 * @returns
 */
export const getTXTSingleData = async (p: string) => {
  const data = await fs.readFile(p, 'utf-8')
  const dealedData = handleTxtData(data)
  const dataSet = new Set(dealedData)
  return dataSet
}

const getTXTDatas = async (p: string, txtFiles: string[]) => {
  if (txtFiles.length === 0) return undefined
  const map = new Map<string, Set<string>>()
  for (let i = 0; i < txtFiles.length; i++) {
    const file = txtFiles[i]
    const data = await getTXTSingleData(path.join(p, `${file}.txt`))
    map.set(file, data)
  }
  return map
}

const handleTxtData = (data: string) =>
  data
    // 按照换行符分割
    .split(/\r?\n/)
    // 按照空格分割
    .map((line) => line.split(/\s+/))
    // 组合为一维数组
    .reduce((acc, cur) => acc.concat(cur), [])
    // 去除空字符串
    .filter((a) => a.trim())

export const getDiagnosticsFromAllWorkspaces = async (
  roots: readonly vscode.WorkspaceFolder[],
) => {
  const map = new Map<string, Map<string, TXTContent>>()
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i]
    const p = path.join(root.uri.fsPath, config.get().diagnosticDir)
    const isDir = await utils.isDirOrMkdir(p)
    if (!isDir) continue
    // 遍历，获取txt文件
    const txtFiles = await utils.getFileNameInDir(p, 'txt', false)
    const opts = getTXTOptions(txtFiles)
    if (!opts) continue
    const datas = await getTXTDatas(p, txtFiles)
    if (!datas) continue
    const txtMap = new Map<string, TXTContent>()
    txtFiles.forEach((file) => {
      const opt = opts.get(file)
      const data = datas.get(file)
      if (opt && data) {
        txtMap.set(file, { data, ...opt })
      }
    })
    map.set(root.uri.fsPath, txtMap)
  }
  return map
}
