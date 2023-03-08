import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import * as diagnostic from '@/modules/Diagnostic'
import { handlePath, isAbsolutePath } from '@/utils'
import { promises as fs } from 'fs'
import Commands from '@/state/Commands'

let conf: TXTOptionMap | undefined = undefined
const workSpaceRoots = vscode.workspace.workspaceFolders

const updateConf = () => {
  const tmpConfs = confHandler.get().confTXTFiles
  if (!tmpConfs) return
  for (let i = 0; i < tmpConfs.length; i++) {
    if (!tmpConfs[i].path) {
      throw new Error('confTXTFiles 配置格式出现错误: path 不能为空')
    }
  }
  const newConf: TXTOptionMap = {}
  tmpConfs.forEach((tmpConf) => {
    if (!workSpaceRoots && !isAbsolutePath(tmpConf.path!)) return
    if (
      workSpaceRoots &&
      workSpaceRoots.length > 1 &&
      !isAbsolutePath(tmpConf.path!)
    )
      return
    const { path, diagnosticSeverity, message } = tmpConf
    newConf[path!] = {
      diagnosticSeverity,
      message,
    }
  })
  if (Object.keys(newConf).length > 0) conf = newConf
  else conf = undefined
}

const handleTxt = async (path: string) => {
  // read path txt
  const cont = await fs.readFile(path!, 'utf8')
  // 按照换行符分割
  const lines = cont.split(/\r?\n/)
  // 按照空格分割
  const wordsInLines = lines.map((line) => line.split(/\s+/))
  // 组合为一维数组
  const words = wordsInLines.reduce((acc, cur) => acc.concat(cur), [])
  return words
}

const loadFile = async () => {
  try {
    updateConf()
  } catch (error) {
    vscode.window.showErrorMessage((<Error>error).message)
  }
  if (!conf) return
  const confEntries = Object.entries(conf)
  for (let i = 0; i < confEntries.length; i++) {
    const [key, value] = confEntries[i]
    const paths = await handlePath(key, '.txt')
    if (!paths || paths.length == 0) continue
    const words: string[] = []
    for (let j = 0; j < paths.length; j++) {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(await handleTxt(paths[j])).forEach((word) => words.push(word))
    }
    diagnostic.addWords(words, value.message, value.diagnosticSeverity)
  }
}

export const reloadCommand = vscode.commands.registerCommand(
  Commands.ReloadTXT,
  async () => {
    diagnostic.clearWords()
    await loadFile()
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    await diagnostic.updateDiagnostics(editor.document)
  },
)
