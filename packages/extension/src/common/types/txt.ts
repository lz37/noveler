import * as vscode from 'vscode'

export type DiagnosticSeverityKeys = keyof typeof vscode.DiagnosticSeverity

export interface ITXTOptions {
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}

/**
 * 一个txt文件的内容
 */
export interface ITXTContent {
  data: Set<string>
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}
