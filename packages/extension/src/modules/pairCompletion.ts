import * as vscode from 'vscode'
import * as R from 'ramda'
import { IConfig, IPairCompletion } from '../common/types'
import * as state from '../common/state'
import * as config from '../config'
import * as utils from '../common/utils'

export const init = (context: vscode.ExtensionContext) => {
  console.log('init')
  context.subscriptions.push(onChangeDocument(config.get()))
}

const onChangeDocument = ({ pairCompletionChars }: IPairCompletion) => {
  const charsGroups = pairCompletionChars.map((chars) => chars.split('')).filter((chars) => chars.length === 2)
  let onCompleting = false
  return vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    if (!state.funcTarget.pairCompletion.includes(event.document.languageId)) return
    event.contentChanges.forEach((change) => {
      if (change.text.length !== 1) return
      const chars = charsGroups.find((chPair) => chPair[0] === change.text)
      if (!chars) return
      // write
      if (onCompleting) {
        onCompleting = false
        return
      }
      onCompleting = true
      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(change.range.start.line, change.range.start.character + 1), chars[1])
      })
    })
  })
}
