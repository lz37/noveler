import * as vscode from 'vscode'
import * as config from './Config'
import { state } from './state'

const formatFoo = (document: vscode.TextDocument) => {
  const lines = document.lineCount
  const lineArr = []
  for (let i = 0; i < lines; i++) {
    const line = document.lineAt(i)
    if (line.text.trim().length === 0) continue
    const indentionLength = config.getConf().autoInsert?.indentionLength
    const indention = indentionLength ? ' '.repeat(indentionLength) : ''
    const lineContext = `${indention}${line.text.trim()}`
    lineArr.push(lineContext)
    const insertLines = config.getConf().autoInsert?.spaceLines
    if (insertLines) {
      for (let j = 0; j < insertLines; j++) {
        lineArr.push('')
      }
    }
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
