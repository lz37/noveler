import * as vscode from 'vscode'
import * as state from '../common/state'
import { CSVContent, CompletionOption, IConfig } from '../common/types'

const additionalTextEdits = (position: vscode.Position, l: number) => [
  vscode.TextEdit.delete(
    new vscode.Range(
      new vscode.Position(position.line, position.character - l),
      new vscode.Position(position.line, position.character),
    ),
  ),
]

export const createCompletionOptions = (map: Map<string, CSVContent>) => {
  const completionOptions: CompletionOption[] = []
  map.forEach(({ suggestKind, description, data }) => {
    data.forEach(({ alias, hover }, key) => {
      const document = hover ? new vscode.MarkdownString() : undefined
      if (document) {
        document.value = `***${description}***<br />${hover?.value}`
        document.isTrusted = hover?.isTrusted
        document.baseUri = hover?.baseUri
        document.supportHtml = hover?.supportHtml
        document.supportThemeIcons = hover?.supportThemeIcons
      }
      const insertTextChoices = [key]
      if (alias) {
        insertTextChoices.push(...alias)
      }
      completionOptions.push({
        insertText: new vscode.SnippetString().appendChoice(insertTextChoices),
        document,
        kind: suggestKind ? vscode.CompletionItemKind[suggestKind] : undefined,
        label: {
          label: key,
          description,
          detail: alias ? `(${alias.join(', ')})` : undefined,
        },
      })
    })
  })
  return completionOptions
}

export const makeProvider =
  ({ completionChar }: IConfig) =>
  (opts: CompletionOption[]) => {
    const completionChars = completionChar === '' ? [''] : ['', completionChar]
    return vscode.languages.registerCompletionItemProvider(
      state.funcTarget.completion,
      {
        provideCompletionItems: (
          document: vscode.TextDocument,
          position: vscode.Position,
        ) => {
          const linePrefix = document
            .lineAt(position)
            .text.slice(0, position.character)
          const items: vscode.CompletionItem[] = []
          const needDelete = linePrefix.endsWith(completionChar)
          opts.forEach(({ insertText, label, document, kind }) => {
            const item = new vscode.CompletionItem(label, kind)
            item.insertText = insertText
            item.documentation = document
            if (needDelete)
              item.additionalTextEdits = additionalTextEdits(position, 1)
            items.push(item)
          })
          return items
        },
      },
      ...completionChars,
    )
  }
