export interface ICustomHighlightConfMap {
  [key: string]: {
    renderOptions: import('vscode').DecorationRenderOptions
    hoverMsg?: import('vscode').MarkdownString
  }
}

export interface IDealedCustomHighlightConfMap {
  [key: string]: {
    renderOptions: import('vscode').TextEditorDecorationType
    hoverMsg?: import('vscode').MarkdownString
  }
}

export type CompletionItemKindKeys =
  keyof typeof import('vscode').CompletionItemKind
export type DiagnosticSeverityKeys =
  keyof typeof import('vscode').DiagnosticSeverity
