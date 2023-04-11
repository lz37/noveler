import * as vscode from 'vscode'
import * as utils from '../common/utils'
import * as config from '../config'
import * as R from 'ramda'

export const init = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(formatProvider)
}

const formatFoo = (document: vscode.TextDocument) => {
  const conf = config.get()
  const lineArr: string[] = []
  const indention = ' '.repeat(conf.autoIndentSpaces)
  const spaceLines = R.range(0)(conf.autoIndentLines).map(() => '')
  R.range(0)(document.lineCount).forEach((i) => {
    const lineText = R.ifElse(
      R.always(conf.usePangu),
      R.pipe(R.trim, R.replace(/\s/g, ''), utils.splitStr),
      R.trim,
    )(document.lineAt(i).text)
    if (lineText.length === 0) return
    const lineContext = `${indention}${lineText}`
    lineArr.push(lineContext)
    if (spaceLines.length > 0) lineArr.push(...spaceLines)
  })
  return lineArr
}

export const formatProvider =
  vscode.languages.registerDocumentFormattingEditProvider('plaintext', {
    provideDocumentFormattingEdits: (document) => {
      const lineArr = formatFoo(document)
      return [
        vscode.TextEdit.replace(
          new vscode.Range(0, 0, document.lineCount, 0),
          lineArr.join('\n'),
        ),
      ]
    },
  })
