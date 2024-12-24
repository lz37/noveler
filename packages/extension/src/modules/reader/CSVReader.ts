import * as confHandler from '@/modules/ConfigHandler'
import * as vscode from 'vscode'
import { promises as fs } from 'fs'
import { isAbsolutePath, getAbsolutePaths } from 'common/utils'
import { parse } from 'csv-parse/sync'
import * as decoration from '@/modules/Decoration'
import * as completion from '@/modules/Completion'
import {
  CSVOptionMap,
  CSVOptions,
  Commands,
  ICustomHighlightConfMap,
} from 'common/types'
import { initing } from '@/extension'

let conf: CSVOptionMap | undefined = undefined
let highlightConf: ICustomHighlightConfMap | undefined = undefined
const workSpaceRoots = vscode.workspace.workspaceFolders

const updateConf = () => {
  const tmpConfs = confHandler.get().confCSVFiles
  if (!tmpConfs) return
  for (let i = 0; i < tmpConfs.length; i++) {
    if (!tmpConfs[i].path) {
      throw new Error('confCSVFiles 配置格式出现错误: path 不能为空')
    }
  }
  const newConf: CSVOptionMap = {}
  tmpConfs.forEach((tmpConf) => {
    if (!tmpConf.hoverKey && !tmpConf.decorationRenderOptions) return
    if (!workSpaceRoots && !isAbsolutePath(tmpConf.path!)) return
    if (
      workSpaceRoots &&
      workSpaceRoots.length > 1 &&
      !isAbsolutePath(tmpConf.path!)
    )
      return
    const {
      key,
      decorationRenderOptions,
      hoverKey,
      path,
      suggestKind,
      suggestPrefix,
    } = tmpConf
    newConf[path!] = {
      key,
      decorationRenderOptions,
      hoverKey,
      suggestKind,
      suggestPrefix,
    }
  })
  if (Object.keys(newConf).length > 0) conf = newConf
  else conf = undefined
}

const handleCSV = async (csvOpt: CSVOptions) => {
  if (!csvOpt.path) return
  // 读取
  try {
    const data = await fs.readFile(csvOpt.path, 'utf-8')
    // 添加relax_column_count属性,支持空行,每行列数不同的csv
    const records: string[][] = parse(data, { relax_column_count: true })
    const firstRow = records[0]
    let keyIndex = -1
    let hoverKeyIndex = -1
    for (let i = 0; i < firstRow.length; i++) {
      const element = firstRow[i]
      if (element.trim() === csvOpt.key) {
        keyIndex = i
      }
      if (element.trim() === csvOpt.hoverKey) {
        hoverKeyIndex = i
      }
    }

    if (keyIndex === -1) {
      throw new Error(`配置文件 ${csvOpt.path} 中没有找到 key: ${csvOpt.key}`)
    }
    const datas = records.slice(1)

    datas.forEach((row) => {
      let key = row[keyIndex]
      // 跳过空白行或未定义行
      if (key) {
        key = key.trim()
      } else {
        return
      }
      if (csvOpt.hoverKey && hoverKeyIndex !== -1) {
        let hover = row[hoverKeyIndex]
        // 解决hoverKey空白报错
        if (hover) {
          hover = hover.trim()
        } else {
          hover = key // 如果没有填信息,则设置为key
        }
        completion.setKeys(key, csvOpt.suggestPrefix, hover, csvOpt.suggestKind)
        const editor = vscode.window.activeTextEditor
        if (!editor) return
        const markdownStr = new vscode.MarkdownString(hover)
        highlightConf![key] = {
          renderOptions: csvOpt.decorationRenderOptions ?? {},
          hoverMsg: markdownStr,
        }
      } else {
        completion.setKeys(
          key,
          csvOpt.suggestPrefix,
          undefined,
          csvOpt.suggestKind,
        )
        highlightConf![key] = {
          renderOptions: csvOpt.decorationRenderOptions ?? {},
        }
      }
    })
  } catch (error) {
    console.error(error)
    vscode.window.showErrorMessage(
      `读取配置文件 ${csvOpt.path} 出现错误:\n ${(<Error>error).message}`,
    )
  }
}

export const loadFile = async () => {
  try {
    updateConf()
  } catch (error) {
    vscode.window.showErrorMessage((<Error>error).message)
  }
  highlightConf = {}
  completion.reset()
  if (conf) {
    const confEntries = Object.entries(conf)
    for (let i = 0; i < confEntries.length; i++) {
      const [key, value] = confEntries[i]
      const paths = await getAbsolutePaths(key, '.csv')
      if (!paths || paths.length == 0) continue
      for (let j = 0; j < paths.length; j++) {
        await handleCSV({ ...{ path: paths[j] }, ...value })
      }
    }
  }
  decoration.reloadConf(highlightConf)
  completion.updateProvider()
}

export const reloadCommand = vscode.commands.registerCommand(
  Commands.ReloadCSV,
  () => {
    loadFile()
  },
)

export const onChangeConf = vscode.workspace.onDidChangeConfiguration(
  (event) => {
    if (initing) return
    if (!event.affectsConfiguration('noveler')) return
    vscode.commands.executeCommand(Commands.ReloadCSV)
  },
)
