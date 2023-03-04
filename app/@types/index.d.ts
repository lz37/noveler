interface ICustomHighlightConfMap {
  [key: string]: {
    renderOptions: import('vscode').DecorationRenderOptions
    hoverMsg?: import('vscode').MarkdownString
  }
}

interface IDealedCustomHighlightConfMap {
  [key: string]: {
    renderOptions: import('vscode').TextEditorDecorationType
    hoverMsg?: import('vscode').MarkdownString
  }
}

type CompletionItemKindKeys = keyof typeof import('vscode').CompletionItemKind
