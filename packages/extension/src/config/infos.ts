import * as path from 'path'
import * as vscode from 'vscode'
import * as defaultConfig from '../common/state/defaultConfig'
import * as config from '.'
import * as utils from '../common/utils'
import * as fs from 'fs/promises'
import * as csv from 'csv-parse/sync'
import * as R from 'ramda'
import {
  CSVContent,
  CSVData,
  CSVOption,
  FileCSVContentMap,
  FileCSVDataMap,
  FileCSVOptionMap,
  RootCSVContentMapMap,
} from '../common/types'

const isCompletionItemKind = (a: string) => Object.values(vscode.CompletionItemKind).includes(a)

/**
 *
 * @param p 绝对路径
 * @param csvFiles p目录下的csv文件名（无后缀）
 * @returns 键为无后缀文件名
 */
export const getCSVOptions = async (p: string, csvFiles: string[]) => {
  if (csvFiles.length === 0) return undefined
  // @todo
  const optMap: FileCSVOptionMap = {}
  csvFiles.forEach((file) => {
    optMap[file] = {
      description: file,
      nameKey: defaultConfig.csvOpt.nameKey,
    }
  })
  // 遍历，读取json文件
  const jsonFiles = await utils.getFileNameInDir(p, 'json', false)
  for await (const file of jsonFiles) {
    if (!R.keys(optMap).includes(file)) continue
    const data = await fs.readFile(path.join(p, `${file}.json`), 'utf-8')
    // data解析json
    const json = <CSVOption>JSON.parse(data)
    if (json.suggestKind && !isCompletionItemKind(json.suggestKind)) {
      json.suggestKind = undefined
    }
    if (!json) continue
    optMap[file] = { ...optMap[file], ...json }
  }
  return optMap
}

export const getInfosFromAllWorkspaces = (() => {
  const io = async (roots: readonly vscode.WorkspaceFolder[]) => {
    const map: RootCSVContentMapMap = {}
    for await (const root of roots) {
      const p = path.join(root.uri.fsPath, config.get().infoDir)
      const isDir = await utils.isDirOrMkdir(p)
      if (!isDir) continue
      // 遍历，获取csv文件
      const csvFiles = await utils.getFileNameInDir(p, 'csv', false)
      const opts = await getCSVOptions(p, csvFiles)
      if (!opts) continue
      const datas = await getCSVDatas(root, p, csvFiles, opts)
      if (!datas) continue
      // @todo
      const csvContentMap: FileCSVContentMap = {}
      csvFiles.forEach((file) => {
        const opt = opts[file]
        const data = datas[file]
        if (opt && data) {
          csvContentMap[file] = { data, ...opt }
        }
      })
      map[root.uri.path] = csvContentMap
    }
    return map
  }
  let onceIO = R.once(io)
  /**
   *
   * @param fromCache 是否从缓存中读取
   * @returns
   */
  return (roots: readonly vscode.WorkspaceFolder[]) =>
    (fromCache = true) =>
      R.ifElse(
        () => fromCache,
        () => onceIO(roots),
        () => {
          onceIO = R.once(io)
          return onceIO(roots)
        },
      )()
})()

/**
 * @param root vscode.WorkspaceFolder
 * @param p 绝对路径
 * @param csvFiles p目录下的文件名（无后缀）
 * @param optMap
 * @returns 键为无后缀文件名
 */
export const getCSVDatas = async (
  root: vscode.WorkspaceFolder,
  p: string,
  csvFiles: string[],
  // @todo
  optMap: FileCSVOptionMap,
) => {
  if (csvFiles.length === 0) return undefined
  // @todo
  const csvDataMap: FileCSVDataMap = {}
  for await (const csvFile of csvFiles) {
    const csvOpt = optMap[csvFile]
    const csvPath = path.join(p, `${csvFile}.csv`)
    const csvData = await readCSV(root, csvPath, csvOpt)
    if (!csvData) continue
    csvDataMap[csvFile] = csvData
  }
  return csvDataMap
}

/**
 *
 * @param p 绝对路径
 * @throws Error `配置文件 ${p} 中没有找到 nameKey: ${csvOpt.nameKey}`
 */
const readCSV = async (root: vscode.WorkspaceFolder, p: string, csvOpt: CSVOption) => {
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
  const content: CSVData = {}
  datas.forEach((row) => {
    const key = row[nameKetIndex].trim()
    content[key] = {}
    if (csvOpt.hoverKey && hoverKeyIndex !== -1) {
      // split by br tag
      const hover = new vscode.MarkdownString(row[hoverKeyIndex].trim())
      hover.supportThemeIcons = true
      hover.isTrusted = true
      hover.supportHtml = true
      hover.baseUri = root.uri
      content[key] = { ...content[key], hover }
    }
    if (csvOpt.aliasKey && aliasKeyIndex !== -1) {
      const alias = row[aliasKeyIndex].split('|').map(R.trim)
      content[key] = { ...content[key], alias }
    }
  })
  return content
}

const findKeyPos = (firstRow: string[], nameKey: string, hoverKey?: string, aliasKey?: string) => {
  let nameKetIndex = -1
  let hoverKeyIndex = -1
  let aliasKeyIndex = -1
  firstRow.forEach((element, i) => {
    R.cond([
      [R.equals(nameKey), () => (nameKetIndex = i)],
      [R.equals(hoverKey), () => (hoverKeyIndex = i)],
      [R.equals(aliasKey), () => (aliasKeyIndex = i)],
    ])(element.trim())
  })
  return { nameKetIndex, hoverKeyIndex, aliasKeyIndex }
}
