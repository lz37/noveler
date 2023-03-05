import * as confHandler from '@/modules/ConfigHandler'
import * as vscode from 'vscode'
import { createReadStream } from 'fs'
import { isAbsolutePath, handlePath } from '@/utils'
import * as csv from 'csv'
import * as decoration from '@/modules/Decoration'
import * as completion from '@/modules/Completion'
import Commands from '@/state/Commands'

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

const handleCSV = (csvOpt: CSVOptions) => {
  let firstRow = true
  let keyIndex = -1
  let hoverKeyIndex = -1
  if (!csvOpt.path) return
  const stream = createReadStream(csvOpt.path)
  stream
    .pipe(csv.parse({ delimiter: ',', from_line: 1 }))
    .on('data', (row: string[]) => {
      if (firstRow) {
        firstRow = false
        for (let i = 0; i < row.length; i++) {
          const element = row[i]
          if (element.trim() === csvOpt.key) {
            keyIndex = i
          }
          if (element.trim() === csvOpt.hoverKey) {
            hoverKeyIndex = i
          }
        }
        if (keyIndex === -1) {
          stream.emit(
            'error',
            new Error(`配置文件 ${csvOpt.path} 中没有找到 key: ${csvOpt.key}`),
          )
        }
        completion.reset()
        return
      }
      const key = row[keyIndex].trim()
      let hoverKey: string | undefined = undefined
      if (hoverKeyIndex !== -1) {
        hoverKey = row[hoverKeyIndex].trim()
      }
      completion.setKeys(
        key,
        csvOpt.suggestPrefix,
        hoverKey,
        csvOpt.suggestKind,
      )
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      const markdownStr = hoverKey
        ? new vscode.MarkdownString(hoverKey)
        : undefined
      highlightConf![key] = {
        renderOptions: csvOpt.decorationRenderOptions ?? {},
        hoverMsg: markdownStr,
      }
    })
    .on('end', () => {
      decoration.reloadConf(highlightConf)
      completion.updateProvider()
    })
    .on('error', (error) => {
      vscode.window.showErrorMessage(
        `读取配置文件 ${csvOpt.path} 出现错误:\n ${error.message}`,
      )
    })
}

const loadFile = async () => {
  try {
    updateConf()
  } catch (error) {
    vscode.window.showErrorMessage((<Error>error).message)
  }
  if (!conf) return
  const confEntries = Object.entries(conf)
  highlightConf = {}
  for (let i = 0; i < confEntries.length; i++) {
    const [key, value] = confEntries[i]
    const paths = await handlePath(key, '.csv')
    if (!paths || paths.length == 0) continue
    for (let j = 0; j < paths.length; j++) {
      handleCSV({ ...{ path: paths[j] }, ...value })
    }
  }
}

export const reloadCommand = vscode.commands.registerCommand(
  Commands.ReloadCSV,
  () => {
    loadFile()
  },
)

export const onChangeConf = vscode.workspace.onDidChangeConfiguration(() => {
  vscode.commands.executeCommand(Commands.ReloadCSV)
})
