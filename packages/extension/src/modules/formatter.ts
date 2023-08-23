import * as vscode from 'vscode'
import * as utils from '../common/utils'
import * as config from '../config'
import * as R from 'ramda'
import * as state from '../common/state'
import { IConfig } from 'src/common/types'

export const init = (context: vscode.ExtensionContext) => context.subscriptions.push(formatProvider)

const formatFoo = (document: vscode.TextDocument) => (conf: IConfig) => {
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

export const formatProvider = vscode.languages.registerDocumentFormattingEditProvider(state.funcTarget.formatter, {
  provideDocumentFormattingEdits: (document) =>
    R.ifElse(
      () => utils.isNovelDoc(document)(config.get()),
      () => [
        vscode.TextEdit.replace(
          new vscode.Range(0, 0, document.lineCount, 0),
          formatFoo(document)(config.get(true)).join(utils.getEOLOfDoc(document)),
        ),
      ],
      () => [],
    )(),
})
