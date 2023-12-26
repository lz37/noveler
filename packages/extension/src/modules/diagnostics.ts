import * as vscode from 'vscode'
import * as R from 'ramda'
import * as command from '@common/commands'
import * as utils from '@common/utils'
import * as config from '@ext/config'
import { getDiagnosticsFromAllWorkspaces } from '@ext/config/diagnostics'
import * as state from '@common/state'
import { DiagnosticSeverityKeys, ITXTContent } from '@common/types'

const collection = vscode.languages.createDiagnosticCollection('noveler')

export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  context.subscriptions.push(collection, onChangeDocument, onChangeEditor, reloadCommand(roots))

const TXTContents = (() => {
  let contents: ITXTContent[] = []
  return (newContents?: ITXTContent[]) => {
    if (newContents !== undefined) contents = newContents
    return contents
  }
})()

const reloadCommand = (roots: readonly vscode.WorkspaceFolder[]) =>
  vscode.commands.registerCommand(command.Noveler.RELOAD_DIAGNOSTIC, async () => {
    const cfg = await getDiagnosticsFromAllWorkspaces(roots)
    TXTContents(
      R.values(cfg)
        .map((value) => R.values(value).map((value) => value))
        .map((x) => x)
        .reduce((acc, value) => R.concat(acc, value), []),
    )
    collection.clear()
    if (vscode.window.activeTextEditor) updateDiagnostics(vscode.window.activeTextEditor.document)
  })

const onChangeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
  if (!utils.isNovelDoc(event.document)(config.get())) return
  updateDiagnostics(event.document)
})

const onChangeEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (!editor) return
  if (!utils.isNovelDoc(editor.document)(config.get())) return
  updateDiagnostics(editor.document)
})

const regexSearch = (
  document: vscode.TextDocument,
  regex: RegExp,
  diagnosticSeverity: DiagnosticSeverityKeys,
  message: string,
) => {
  const text = document.getText()
  const diagnostics: vscode.Diagnostic[] = []
  let match: RegExpExecArray | null | undefined = undefined
  while ((match = regex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index)
    const endPos = document.positionAt(match.index + match[0].length)
    const range = new vscode.Range(startPos, endPos)
    const diagnostic = new vscode.Diagnostic(
      range,
      `${message}: ${match[0]}`,
      vscode.DiagnosticSeverity[diagnosticSeverity],
    )
    diagnostics.push(diagnostic)
  }
  return diagnostics
}

export const updateDiagnostics = (document: vscode.TextDocument) => {
  if (!state.funcTarget.diagnostics.includes(document.languageId)) return
  try {
    const diagnostics = TXTContents()
      .map(({ data, diagnosticSeverity, message }) => {
        const words: string[] = []
        data.forEach((value) => words.push(value))
        return regexSearch(document, new RegExp(`(${words.join('|')})`, 'g'), diagnosticSeverity, message)
      })
      .reduce((acc, value) => acc.concat(value), [])
    collection.set(document.uri, diagnostics)
  } catch (error) {
    console.error(error)
  }
}
