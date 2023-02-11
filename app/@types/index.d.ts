interface ICustomHighlightConf {
  [key: string]: {
    renderOptions: import('vscode').DecorationRenderOptions
    hoverMsg?: import('vscode').MarkdownString
  }
}

interface IDealedCustomHighlightConf {
  [key: string]: {
    renderOptions: import('vscode').TextEditorDecorationType
    hoverMsg?: import('vscode').MarkdownString
  }
}

interface DecorationExtConf {
  [path: string]: {
    key: string
    hoverKey?: string
    decorationRenderOptions?: import('vscode').DecorationRenderOptions
  }
}
