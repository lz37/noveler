import * as vscode from 'vscode'

export interface CompletionOption {
  insertText: vscode.SnippetString
  kind?: vscode.CompletionItemKind
  label: vscode.CompletionItemLabel
  document?: vscode.MarkdownString
}
