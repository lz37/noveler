import * as vscode from 'vscode'

export type DiagnosticSeverityKeys = keyof typeof vscode.DiagnosticSeverity

export interface TXTOptions {
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}

/**
 * 一个txt文件的内容
 */
export interface TXTContent {
  data: Set<string>
  message: string
  diagnosticSeverity: DiagnosticSeverityKeys
}
