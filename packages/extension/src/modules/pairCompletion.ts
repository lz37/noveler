import * as vscode from 'vscode'
import { IPairCompletion } from '../common/types'
import * as state from '../common/state'
import * as config from '../config'

export const init = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(...onChangeDocument(config.get()))
}

const onChangeDocument = ({ pairCompletionChars }: IPairCompletion) => {
  const charsGroups = pairCompletionChars.map((chars) => chars.split('')).filter((chars) => chars.length === 2)
  let selected: { range: vscode.Range; text: string }[] = []
  let isPairCompleting = false
  return [
    vscode.window.onDidChangeTextEditorSelection((event) => {
      isPairCompleting = false
      selected = []
      if (!state.funcTarget.pairCompletion.includes(event.textEditor.document.languageId)) return
      event.selections.forEach((selection) => {
        selected = selected.concat({
          range: selection,
          text: event.textEditor.document.getText(selection),
        })
      })
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.reason) return
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (isPairCompleting) {
        isPairCompleting = false
        return
      }
      if (!state.funcTarget.pairCompletion.includes(event.document.languageId)) return
      if (event.contentChanges[0].text.length !== 1) return
      const chars = charsGroups.find((chPair) => chPair.includes(event.contentChanges[0].text))
      if (!chars) return
      isPairCompleting = true
      editor.edit((editBuilder) => {
        selected.forEach(({ range, text }) => {
          editBuilder.delete(new vscode.Range(range.start, range.start.translate(0, 1)))
          if (text.length !== 0) {
            editBuilder.insert(range.start, `${chars[0]}${text}${chars[1]}`)
          } else {
            editBuilder.insert(range.start, `${chars[0]}${chars[1]}`)
          }
        })
      })
      editor.selections = selected.map(
        ({ range }) => new vscode.Selection(range.start.translate(0, 1), range.end.translate(0, 1)),
      )
    }),
  ]
}
