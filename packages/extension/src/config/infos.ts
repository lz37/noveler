import * as path from 'path'
import * as vscode from 'vscode'
import * as config from '.'
import * as utils from '@common/utils'
import * as fs from 'fs/promises'
import * as csv from 'csv-parse/sync'
import * as R from 'ramda'
import { ICSVContent, ICSVData, ICSVOption } from '@common/types'

const isCompletionItemKind = (a: string) => Object.values(vscode.CompletionItemKind).includes(a)

/**
 *
 * @param p 绝对路径
 * @param csvFiles p目录下的csv文件名（无后缀）
 * @returns 键为无后缀文件名
 */
export const getCSVOptions = async (p: string, csvFiles: string[]) => {
  if (csvFiles.length === 0) return undefined
  const optMap: Record<string, ICSVOption> = {}
  csvFiles.forEach((file) => {
    optMap[file] = {
      description: file,
      mainKey: config.get().defaultHoverInfoMainKeyAlias,
      aliasKey: config.get().defaultHoverInfoAliasKeyAlias,
    }
  })
  // 遍历，读取json文件
  const jsonFiles = await utils.getFileNameInDir(p, 'json', false)
  for await (const file of jsonFiles) {
    if (!R.keys(optMap).includes(file)) continue
    const data = await fs.readFile(path.join(p, `${file}.json`), 'utf-8')
    // data解析json
    const json = <ICSVOption>JSON.parse(data)
    if (json.suggestKind && !isCompletionItemKind(json.suggestKind)) {
      json.suggestKind = undefined
    }
    if (!json) continue
    optMap[file] = { ...optMap[file], ...json }
  }
  return optMap
}

export const getInfosFromAllWorkspaces = async (roots: readonly vscode.WorkspaceFolder[]) => {
  const map: Record<string, Record<string, ICSVContent>> = {}
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
    const csvContentMap: Record<string, ICSVContent> = {}
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
  optMap: Record<string, ICSVOption>,
) => {
  if (csvFiles.length === 0) return undefined
  const csvDataMap: Record<string, ICSVData> = {}
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
const readCSV = async (root: vscode.WorkspaceFolder, p: string, csvOpt: ICSVOption) => {
  const dataString = await fs.readFile(p, 'utf-8')
  const records = <string[][]>csv.parse(dataString)
  const firstRow = records[0]
  const { mainKeyIndex, aliasKeyIndex, extraKeysMap } = findKeyPos(
    firstRow,
    csvOpt.mainKey || config.get().defaultHoverInfoMainKeyAlias,
    csvOpt.aliasKey,
  )
  if (mainKeyIndex === -1) {
    throw new Error(`配置文件 ${p} 中没有找到 mainKeyIndex: ${csvOpt.mainKey}`)
  }
  const datas = records.slice(1)
  if (datas.length === 0) return undefined
  const content: ICSVData = {}
  datas.forEach((row) => {
    const key = row[mainKeyIndex].trim()
    content[key] = {}
    if (R.keys(extraKeysMap).length > 0) {
      const extraInfosMap: Record<string, string> = Object.entries(extraKeysMap)
        .map(([k, p]) => [k, row[p]])
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
      // split by br tag
      const hover = new vscode.MarkdownString(
        `***${csvOpt.description}***<br />**${csvOpt.mainKey}**: ${row[mainKeyIndex]}<br />${R.ifElse(
          () => !!csvOpt.aliasKey && aliasKeyIndex !== -1,
          () => `**${csvOpt.aliasKey}**: ${row[aliasKeyIndex].split('|').map(R.trim)}<br />`,
          () => '',
        )()}${Object.entries(extraInfosMap).reduce((acc, [k, v]) => `${acc}**${k}**: ${v}<br />`, '')}
        `,
      )
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

const findKeyPos = (firstRow: string[], mainKey: string, aliasKey?: string) => {
  let mainKeyIndex = -1
  let aliasKeyIndex = -1
  const extraKeysMap: Record<string, number> = {}
  firstRow.forEach((element, i) =>
    R.cond<[b: string], any>([
      [R.equals(mainKey), () => (mainKeyIndex = i)],
      [R.equals(aliasKey), () => (aliasKeyIndex = i)],
      [R.T, (element) => (extraKeysMap[element] = i)],
    ])(element.trim()),
  )
  return { mainKeyIndex, aliasKeyIndex, extraKeysMap }
}
