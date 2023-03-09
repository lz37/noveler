import { CompletionItemKindKeys, DiagnosticSeverityKeys } from '.'

export interface CSVOptions {
  path?: string
  key: string
  hoverKey?: string
  decorationRenderOptions?: import('vscode').DecorationRenderOptions
  suggestPrefix: string
  suggestKind?: CompletionItemKindKeys
}

export interface CSVOptionMap {
  [path: string]: {
    key: string
    hoverKey?: string
    decorationRenderOptions?: import('vscode').DecorationRenderOptions
    suggestPrefix: string
    suggestKind?: CompletionItemKindKeys
  }
}

export interface TXTOptions {
  path?: string
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}

export interface TXTOptionMap {
  [path: string]: {
    message: string
    diagnosticSeverity: DiagnosticSeverityKeys
  }
}

export type StatusItem = 'Speed' | 'Time' | 'InputWordCount' | 'TextWordCount'

export interface IConfig {
  showApplyRecommendPlaintextConf: boolean
  autoIndent: boolean
  autoIndentSpaces: number
  autoIndentLines: number
  usePangu: boolean
  statusShow: boolean
  statusTimeUnit: number
  statusIncludingSpace: boolean
  statusItems: StatusItem[]
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
  customHighlight?: { [key: string]: import('vscode').DecorationRenderOptions }
  completionChar: string
  confCSVFiles?: CSVOptions[]
  confTXTFiles?: TXTOptions[]
}
