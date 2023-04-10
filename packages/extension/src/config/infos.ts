import * as path from 'path'
import * as vscode from 'vscode'
import * as defaultConfig from '../common/state/defaultConfig'
import * as config from '.'
import { promises as fs } from 'fs'
import { getFileNameInDir } from '../common/utils'
import { CSVOption } from '../common/types'

/**
 * @param p infoDir 绝对路径
 */
export const getCSVOptions = async (p: string) => {
  // 判断是否为目录
  try {
    const stat = await fs.stat(p)
    if (!stat.isDirectory()) return undefined
  } catch (error) {
    console.error(error)
    fs.mkdir(p)
  }
  // 遍历，获取csv文件
  const csvFiles = await getFileNameInDir(p, 'csv', false)
  const csvMap: Map<string, CSVOption> = new Map()
  const isCompletionItemKind = (a: string) => {
    return Object.values(vscode.CompletionItemKind).includes(a)
  }
  csvFiles.forEach((file) => {
    csvMap.set(file, {
      suggestPrefix: file,
      key: defaultConfig.csvOpt.key,
    })
  })
  if (csvMap.size === 0) return undefined
  // 遍历，读取json文件
  const jsonFiles = await getFileNameInDir(p, 'json', false)
  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i]
    if (!csvMap.has(file)) continue
    const data = await fs.readFile(path.join(p, `${file}.json`), 'utf-8')
    // data解析json
    const json = <CSVOption>JSON.parse(data)
    if (json.suggestKind && !isCompletionItemKind(json.suggestKind)) {
      json.suggestKind = undefined
    }
    if (json) {
      csvMap.set(file, { ...csvMap.get(file), ...json })
    }
  }
  csvMap.forEach((value, key) => {
    console.log(key, value)
  })
  return csvMap
}

export const getCSVOptionsFromAllWorkspaces = async () => {
  const roots = vscode.workspace.workspaceFolders
  if (!roots) return
  const map = new Map<string, Map<string, CSVOption>>()
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i]
    const opts = await getCSVOptions(
      path.join(root.uri.fsPath, config.get().infoDir),
    )
    if (opts) {
      map.set(root.uri.fsPath, opts)
    }
  }
  map.forEach((value, key) => {
    console.log(key, value.size)
  })
  return map
}
