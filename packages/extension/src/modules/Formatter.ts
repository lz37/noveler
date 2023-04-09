import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { state } from 'common/state'
import { splitStr } from 'common/utils'

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
    const oldText = document.lineAt(i).text
    let lineText = oldText.trim()
    if (conf.usePangu) {
      try {
        lineText = splitStr(lineText.replace(/\s/g, ''))
      } catch (error) {
        console.error(error)
      }
    }
    if (lineText.length === 0) continue
    const lineContext = `${indention}${lineText}`
    lineArr.push(lineContext)
    if (spaceLines.length > 0) lineArr.push(...spaceLines)
  }
  return lineArr
}

export const provider = vscode.languages.registerDocumentFormattingEditProvider(
  'plaintext',
  {
    provideDocumentFormattingEdits: (
      document: vscode.TextDocument,
    ): vscode.TextEdit[] => {
      if (!state.isFormatting) state.isFormatting = true
      const lineArr = formatFoo(document)
      let shouldFormat = false
      if (document.lineCount !== lineArr.length) {
        shouldFormat = true
      } else {
        for (let i = 0; i < document.lineCount; i++) {
          if (document.lineAt(i).text !== lineArr[i]) {
            shouldFormat = true
            break
          }
        }
      }
      if (!shouldFormat) state.isFormatting = false
      return [
        vscode.TextEdit.replace(
          new vscode.Range(0, 0, document.lineCount, 0),
          lineArr.join('\n'),
        ),
      ]
    },
  },
)
