interface CSVOptions {
  path?: string
  key: string
  hoverKey?: string
  decorationRenderOptions?: import('vscode').DecorationRenderOptions
  suggestPrefix: string
  suggestKind?: CompletionItemKindKeys
}

interface CSVOptionMap {
  [path: string]: {
    key: string
    hoverKey?: string
    decorationRenderOptions?: import('vscode').DecorationRenderOptions
    suggestPrefix: string
    suggestKind?: CompletionItemKindKeys
  }
}

interface TXTOptions {
  path?: string
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}

interface TXTOptionMap {
  [path: string]: {
    message: string
    diagnosticSeverity: DiagnosticSeverityKeys
  }
}

interface IConfig {
  showApplyRecommendPlaintextConf: boolean
  autoIndent: boolean
  autoIndentSpaces: number
  autoIndentLines: number
  usePangu: boolean
  statusShow: boolean
  statusTimeUnit: number
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
  customHighlight?: { [key: string]: import('vscode').DecorationRenderOptions }
  completionChar: string
  confCSVFiles?: CSVOptions[]
  confTXTFiles?: TXTOptions[]
}
