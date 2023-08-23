import * as vscode from 'vscode'
import * as commands from '../common/commands'
import * as config from '../config'
import * as infos from '../config/infos'
import * as R from 'ramda'
import * as state from '../common/state'
import { CSVContent, CompletionOption, FileCSVContentMap, IConfig, RootCSVContentMapMap } from '../common/types'

export const init = async (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  context.subscriptions.push(reloadCommand(context, roots))
  context.subscriptions.push(deletePrefixCommand)
  context.subscriptions.push(triggerCommandRegister(context))
}

const deletePrefixCommand = vscode.commands.registerTextEditorCommand(
  commands.Noveler.DELETE_COMPLETION_PREFIX,
  async (_, edit, position: vscode.Position, num: number) => {
    const start = new vscode.Position(position.line, position.character - num)
    const end = new vscode.Position(position.line, position.character - 1)
    await new Promise((resolve) => {
      edit.delete(new vscode.Range(start, end))
      resolve(undefined)
    })
    vscode.commands.executeCommand(commands.Etc.TRIGGER_SUGGEST)
  },
)

const triggerCommandRegister = (context: vscode.ExtensionContext) => {
  const makeCommand = () =>
    vscode.commands.registerTextEditorCommand(commands.Noveler.TRIGGER_COMPLETION, async (editor, edit) => {
      await new Promise((resolve) => {
        edit.insert(editor.selection.active, config.get().completionChar)
        resolve(undefined)
      })
      vscode.commands.executeCommand(commands.Etc.TRIGGER_SUGGEST)
    })
  let triggerCommand: vscode.Disposable = makeCommand()
  return vscode.workspace.onDidChangeConfiguration(() => {
    triggerCommand.dispose()
    triggerCommand = makeCommand()
    context.subscriptions.push(triggerCommand)
    vscode.commands.executeCommand(commands.Noveler.RELOAD_COMPLETION)
  })
}

const reloadCommand = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  vscode.commands.registerCommand(commands.Noveler.RELOAD_COMPLETION, async () => {
    storeProvider()()
    R.pipe(
      (map: RootCSVContentMapMap) =>
        R.values(map)
          .map((value) => value)
          .reduce((acc, value) => R.mergeDeepWith(R.concat, acc, value), {}),
      createCompletionOptions,
      makeProvider(config.get()),
      storeProvider(context),
    )(await infos.getInfosFromAllWorkspaces(roots)())
  })

const storeProvider = (() => {
  let disposable: vscode.Disposable | undefined = undefined
  return (context?: vscode.ExtensionContext) => (provider?: vscode.Disposable) => {
    disposable?.dispose()
    disposable = provider
    provider && context?.subscriptions.push(provider)
  }
})()

const additionalTextEdits = (position: vscode.Position, l: number) => [
  vscode.TextEdit.delete(
    new vscode.Range(
      new vscode.Position(position.line, position.character - l),
      new vscode.Position(position.line, position.character),
    ),
  ),
]

const createCompletionOptions = (map: FileCSVContentMap) => {
  const completionOptions: CompletionOption[] = []
  R.values(map).forEach(({ suggestKind, description, data }) => {
    Object.entries(data).forEach(([key, { alias, hover }]) => {
      const document = hover ? new vscode.MarkdownString() : undefined
      if (document) {
        document.value = `***${description}***<br />${hover?.value}`
        document.isTrusted = hover?.isTrusted
        document.baseUri = hover?.baseUri
        document.supportHtml = hover?.supportHtml
        document.supportThemeIcons = hover?.supportThemeIcons
      }
      const insertTextChoices = [key]
      if (alias) insertTextChoices.push(...alias)
      completionOptions.push({
        insertText: new vscode.SnippetString().appendChoice(insertTextChoices.map((v) => v.toString())),
        document,
        kind: suggestKind ? vscode.CompletionItemKind[suggestKind] : undefined,
        label: {
          label: key.toString(),
          description,
          detail: alias ? `(${alias.join(', ')})` : undefined,
        },
      })
    })
  })
  return completionOptions
}

const makeProvider =
  ({ completionChar }: IConfig) =>
  (opts: CompletionOption[]) => {
    const completionChars = completionChar === '' ? [''] : ['', completionChar]
    return vscode.languages.registerCompletionItemProvider(
      state.funcTarget.completion,
      {
        provideCompletionItems: (document: vscode.TextDocument, position: vscode.Position) => {
          const linePrefix = document.lineAt(position).text.slice(0, position.character)
          const items: vscode.CompletionItem[] = []
          const needDelete = linePrefix.endsWith(completionChar)
          opts.forEach(({ insertText, label, document, kind }) => {
            const item = new vscode.CompletionItem(label, kind)
            item.command = {
              command: commands.Noveler.DELETE_COMPLETION_PREFIX,
              title: 'delete completion prefix',
              arguments: [position, config.get().completionChar.length],
            }
            item.insertText = insertText
            item.documentation = document
            if (needDelete) item.additionalTextEdits = additionalTextEdits(position, 1)
            items.push(item)
          })
          return items
        },
      },
      ...completionChars,
    )
  }
