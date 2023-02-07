import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { state } from '@/state'
import { splitStr } from '@/utils'

const formatFoo = (document: vscode.TextDocument) => {
  const conf = confHandler.get()
  const lines = document.lineCount
  const lineArr = []
  const indentionLength = conf.autoIndentSpaces
  const indention = ' '.repeat(indentionLength)
  const insertLines = conf.autoIndentLines
  const spaceLines = (() => {
    const res = []
    for (let i = 0; i < insertLines; i++) {
      res.push('')
    }
    return res
  })()
  for (let i = 0; i < lines; i++) {
    const lineText = splitStr(
      document
        .lineAt(i)
        .text.trim()
        // 将空白字符消除
        .replace(/\s/g, ''),
      conf.spaceBetweenChEn,
    )
    if (lineText.length === 0) continue
    const lineContext = `${indention}${lineText}`
    lineArr.push(lineContext)
    if (spaceLines) lineArr.push(spaceLines)
  }
  return lineArr
}

export const formatProvider = vscode.languages.registerDocumentFormattingEditProvider('plaintext', {
  provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    if (!state.isFormatting) state.isFormatting = true
    const lineArr = formatFoo(document)
    // use lineArr to replace the document
    return [vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), lineArr.join('\n'))]
  },
})
