import * as vscode from 'vscode'

export interface ICustomHighlightConfMap {
  [key: string]: {
    renderOptions: vscode.DecorationRenderOptions
    hoverMsg?: vscode.MarkdownString
  }
}

export interface IDealedCustomHighlightConfMap {
  [key: string]: {
    renderOptions: vscode.TextEditorDecorationType
    hoverMsg?: vscode.MarkdownString
  }
}

export type CompletionItemKindKeys = keyof typeof vscode.CompletionItemKind
export type DiagnosticSeverityKeys = keyof typeof vscode.DiagnosticSeverity

export interface CSVOption {
  key: string
  hoverKey?: string
  decorationRenderOptions?: vscode.DecorationRenderOptions
  suggestPrefix: string
  suggestKind?: CompletionItemKindKeys
}

export interface TXTOptions {
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}

export type StatusItem = 'Speed' | 'Time' | 'InputWordCount' | 'TextWordCount'

export interface IConfig {
  showApplyRecommendPlaintextConf: boolean
  autoIndent: boolean
  autoIndentSpaces: number
  autoIndentLines: number
  usePangu: boolean
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
  customHighlight?: { [key: string]: vscode.DecorationRenderOptions }
  completionChar: string
  outlinesDir: string
  infoDir: string
  diagnosticDir: string
}

export type NovelerRouter = '/' | '/preview' | '/panel'
export interface PreviewDto {
  /**if undefined will not take effect */
  text?: string
  /**if <0 will not take effect */
  scrollPos: number
  /**if <0 will not take effect */
  maxLine: number
  conf: IConfig
}

export interface PreviewExtRecDto {
  /**只有 preview开头的才能被处理 */
  conf: keyof IConfig
  /**0表示完成，1，-1表示进一步操作 */
  option: number
}

export enum PanelDtoStatus {
  NoEditor,
  NoFile,
  Valid,
  OutlineFile,
}

export type Theme = 'light' | 'dark'

export interface PanelDto {
  status: PanelDtoStatus
  workSpaceRoot: string
  path: string
  content: string
  themeKind?: Theme
}

export interface PanelExtRecDto {
  needLoad?: boolean
  status: PanelDtoStatus
  workSpaceRoot: string
  path: string
  content: string
}

export enum Commands {
  ReloadCSV = 'noveler.reloadCSV',
  ReloadTXT = 'noveler.reloadTXT',
  Preview = 'noveler.preview',
  DeletePrefix = 'noveler.deletePrefix',
}
