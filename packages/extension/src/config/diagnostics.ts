import * as defaultConfig from '../common/state/defaultConfig'
import * as vscode from 'vscode'
import * as R from 'ramda'
import * as fs from 'fs/promises'
import * as config from '.'
import * as utils from '../common/utils'
import path from 'path'
import { DiagnosticSeverityKeys, ITXTContent, ITXTOptions } from '../common/types'

/**
 *
 * @param txtFiles 文件名（不带后缀）
 * @returns
 */
export const getTXTOptions = R.ifElse(
  (txtFiles: string[]) => txtFiles.length === 0,
  () => undefined,
  (txtFiles) =>
    R.pipe(
      () => txtFiles.map((file) => ({ file, opt: getSingleTXTOption(file) })),
      (m) =>
        m.reduce(
          (acc: Record<string, ITXTOptions>, { file, opt }) => R.mergeDeepWith(R.concat, acc, { [file]: opt }),
          {},
        ),
    )(),
)

const isDiagnosticSeverity = (a: string) => Object.values(vscode.DiagnosticSeverity).includes(a)

/**
 *
 * @param txtFile 文件名（不带后缀）
 * @returns
 */
const getSingleTXTOption = (txtFile: string): ITXTOptions =>
  R.cond([
    [() => !txtFile, () => defaultConfig.txtOpt],
    [
      (split: string[]) => split.length === 1 || !isDiagnosticSeverity(split[1]),
      (split) => ({ ...defaultConfig.txtOpt, message: split[0] }),
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
export const getTXTSingleData = (p: string) =>
  fs
    .readFile(p, 'utf-8')
    .then(handleTxtData)
    .then((data) => new Set(data))

/**
 *
 * @param p 绝对路径
 * @param txtFiles 文件名（无后缀）
 * @returns
 */
const getTXTDatas = async (p: string, txtFiles: string[]) =>
  R.ifElse(
    () => txtFiles.length === 0,
    () => undefined,
    () =>
      R.pipe(
        () => (file: string) => getTXTSingleData(path.join(p, `${file}.txt`)).then((data) => ({ file, data })),
        (handle) =>
          Promise.all(txtFiles.map((file) => handle(file))).then((m) =>
            m.reduce(
              (acc: Record<string, Set<string>>, { file, data }) => R.mergeDeepWith(R.concat, acc, { [file]: data }),
              {},
            ),
          ),
      )(),
  )()

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

export const getDiagnosticsFromAllWorkspaces = async (roots: readonly vscode.WorkspaceFolder[]) => {
  const map: Record<string, Record<string, ITXTContent>> = {}
  for await (const root of roots) {
    const p = path.join(root.uri.fsPath, config.get().diagnosticDir)
    const isDir = await utils.isDirOrMkdir(p)
    if (!isDir) continue
    // 遍历，获取txt文件
    const txtFiles = await utils.getFileNameInDir(p, 'txt', false)
    const opts = getTXTOptions(txtFiles)
    if (!opts) continue
    const datas = await getTXTDatas(p, txtFiles)
    if (!datas) continue
    const txtMap: Record<string, ITXTContent> = {}
    txtFiles.forEach((file) => {
      const opt = opts[file]
      const data = datas[file]
      opt && data && (txtMap[file] = { data, ...opt })
    })
    map[root.uri.fsPath] = txtMap
  }
  return map
}
