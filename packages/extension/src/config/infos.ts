import * as path from 'path'
import * as vscode from 'vscode'
import * as defaultConfig from '../common/state/defaultConfig'
import * as config from '.'
import * as utils from '../common/utils'
import * as fs from 'fs/promises'
import * as csv from 'csv-parse/sync'
import * as R from 'ramda'
import { CSVContent, CSVData, CSVOption } from '../common/types'

const isCompletionItemKind = (a: string) =>
  Object.values(vscode.CompletionItemKind).includes(a)

/**
 *
 * @param p 绝对路径
 * @param csvFiles p目录下的csv文件名（无后缀）
 * @returns 键为无后缀文件名
 */
export const getCSVOptions = async (p: string, csvFiles: string[]) => {
  if (csvFiles.length === 0) return undefined
  const optMap = new Map<string, CSVOption>()
  csvFiles.forEach((file) => {
    optMap.set(file, {
      suggestPrefix: file,
      nameKey: defaultConfig.csvOpt.nameKey,
    })
  })
  // 遍历，读取json文件
  const jsonFiles = await utils.getFileNameInDir(p, 'json', false)
  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i]
    if (!optMap.has(file)) continue
    const data = await fs.readFile(path.join(p, `${file}.json`), 'utf-8')
    // data解析json
    const json = <CSVOption>JSON.parse(data)
    if (json.suggestKind && !isCompletionItemKind(json.suggestKind)) {
      json.suggestKind = undefined
    }
    if (!json) continue
    optMap.set(file, { ...optMap.get(file), ...json })
  }
  return optMap
}

export const getInfosFromAllWorkspaces = async (
  roots: readonly vscode.WorkspaceFolder[],
) => {
  const map = new Map<string, Map<string, CSVContent>>()
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i]
    const p = path.join(root.uri.fsPath, config.get().infoDir)
    const isDir = await utils.isDirOrMkdir(p)
    if (!isDir) continue
    // 遍历，获取csv文件
    const csvFiles = await utils.getFileNameInDir(p, 'csv', false)
    const opts = await getCSVOptions(p, csvFiles)
    if (!opts) continue
    const datas = await getCSVDatas(p, csvFiles, opts)
    if (!datas) continue
    const csvContentMap = new Map<string, CSVContent>()
    csvFiles.forEach((file) => {
      const opt = opts.get(file)
      const data = datas.get(file)
      if (opt && data) {
        csvContentMap.set(file, { data, ...opt })
      }
    })
    map.set(root.uri.path, csvContentMap)
  }
  return map
}

/**
 *
 * @param p 绝对路径
 * @param csvFiles p目录下的文件名（无后缀）
 * @param optMap
 * @returns 键为无后缀文件名
 */
export const getCSVDatas = async (
  p: string,
  csvFiles: string[],
  optMap: Map<string, CSVOption>,
) => {
  if (csvFiles.length === 0) return undefined
  const csvDataMap = new Map<string, CSVData>()
  for (let i = 0; i < csvFiles.length; i++) {
    const csvFile = csvFiles[i]
    const csvOpt = optMap.get(csvFile)!
    const csvPath = path.join(p, `${csvFile}.csv`)
    const csvData = await readCSV(csvPath, csvOpt)
    if (!csvData) continue
    csvDataMap.set(csvFile, csvData)
  }
  return csvDataMap
}

/**
 *
 * @param p 绝对路径
 * @throws Error `配置文件 ${p} 中没有找到 nameKey: ${csvOpt.nameKey}`
 */
const readCSV = async (p: string, csvOpt: CSVOption) => {
  const dataString = await fs.readFile(p, 'utf-8')
  const records = <string[][]>csv.parse(dataString)
  const firstRow = records[0]
  const { nameKetIndex, hoverKeyIndex, aliasKeyIndex } = findKeyPos(
    firstRow,
    csvOpt.nameKey,
    csvOpt.hoverKey,
    csvOpt.aliasKey,
  )
  if (nameKetIndex === -1) {
    throw new Error(`配置文件 ${p} 中没有找到 nameKey: ${csvOpt.nameKey}`)
  }
  const datas = records.slice(1)
  if (datas.length === 0) return undefined
  const content: CSVData = new Map()
  datas.forEach((row) => {
    const key = row[nameKetIndex].trim()
    content.set(key, {})
    if (csvOpt.hoverKey && hoverKeyIndex !== -1) {
      const hover = new vscode.MarkdownString(row[hoverKeyIndex].trim())
      content.set(key, { hover })
    }
    if (csvOpt.aliasKey && aliasKeyIndex !== -1) {
      const alias = <string[]>JSON.parse(row[aliasKeyIndex].trim())
      content.set(key, { ...content.get(key), alias })
    }
  })
  return content
}

const findKeyPos = (
  firstRow: string[],
  nameKey: string,
  hoverKey?: string,
  aliasKey?: string,
) => {
  let nameKetIndex = -1
  let hoverKeyIndex = -1
  let aliasKeyIndex = -1
  for (let i = 0; i < firstRow.length; i++) {
    const element = firstRow[i]
    R.cond([
      [R.equals(nameKey), () => (nameKetIndex = i)],
      [R.equals(hoverKey), () => (hoverKeyIndex = i)],
      [R.equals(aliasKey), () => (aliasKeyIndex = i)],
    ])(element.trim())
  }
  return { nameKetIndex, hoverKeyIndex, aliasKeyIndex }
}
