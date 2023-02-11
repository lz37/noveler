interface IConfig {
  showApplyRecommendPlaintextConf: boolean
  autoIndentSpaces: number
  autoIndentLines: number
  usePangu: boolean
  statusShow: boolean
  statusTimeUnit: number
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
  customHighlight?: { [key: string]: import('vscode').DecorationRenderOptions }
  confCSVFiles?: [
    {
      path?: string
      key: string
      hoverKey?: string
      decorationRenderOptions?: import('vscode').DecorationRenderOptions
    },
  ]
}
