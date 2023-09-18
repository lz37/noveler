import * as vscode from 'vscode'
import { IPairCompletion } from '../common/types'
import * as state from '../common/state'
import * as config from '../config'
import * as R from 'ramda'

export const init = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(...onChangeDocument(config.get()), onChangeConf(context))
}

const onChangeConf = (context: vscode.ExtensionContext) =>
  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (
      !event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IPairCompletion>('pairCompletion')}`) &&
      !event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IPairCompletion>('pairCompletionChars')}`)
    )
      return
    context.subscriptions.push(...onChangeDocument(config.get()))
  })

const onChangeDocument = (() => {
  let pairConf: IPairCompletion | undefined = undefined
  let hooks: vscode.Disposable[] = []
  return (conf: IPairCompletion) => {
    if (
      conf.pairCompletion !== pairConf?.pairCompletion ||
      conf.pairCompletionChars !== pairConf?.pairCompletionChars
    ) {
      pairConf = conf
      hooks.map((hook) => hook.dispose())
      hooks = makeHooks(conf)
    }
    return hooks
  }
})()

const makeHooks = ({ pairCompletionChars, pairCompletion }: IPairCompletion) => {
  const charsGroups = pairCompletionChars.map((chars) => chars.split('')).filter((chars) => chars.length === 2)
  let selected: { range: vscode.Range; text: string }[] = []
  let isPairCompleting = false
  return [
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (!pairCompletion) return
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
      if (!pairCompletion) return
      if (event.reason) return
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (isPairCompleting) {
        isPairCompleting = false
        return
      }
      if (!state.funcTarget.pairCompletion.includes(event.document.languageId)) return
      if (event.contentChanges[0].text.length !== 1) return
      const chars = charsGroups?.find((chPair) => chPair.includes(event.contentChanges[0].text))
      if (!chars) return
      isPairCompleting = true
      replacer(chars, editor, event.document, selected)
    }),
  ]
}

const replacer = (
  chars: string[],
  editor: vscode.TextEditor,
  document: vscode.TextDocument,
  selected: { range: vscode.Range; text: string }[],
) =>
  (editor.selections = selected.map(({ range, text }) => {
    const nowRangeWithStartEnd = new vscode.Range(range.start.translate(0, -1), range.start.translate(0, 2))
    const nowTextWithStartEnd = document.getText(nowRangeWithStartEnd)
    if (nowTextWithStartEnd.startsWith(chars[0]) && nowTextWithStartEnd.endsWith(chars[1])) {
      editor.edit((editBuilder) => editBuilder.replace(nowRangeWithStartEnd, text))
      return new vscode.Selection(range.start.translate(0, -1), range.end.translate(0, -1))
    } else {
      editor.edit((editBuilder) =>
        editBuilder.replace(
          new vscode.Range(range.start, range.start.translate(0, 1)),
          `${chars[0]}${text}${chars[1]}`,
        ),
      )
      return new vscode.Selection(range.start.translate(0, 1), range.end.translate(0, 1))
    }
  }))
