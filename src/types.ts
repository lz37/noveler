import * as vscode from 'vscode'
export interface IConfig {
  roles?: IRole[]
  autoInsert?: IAutoInsertHandler
  statusBar?: IStatus
  preview?: IPreview
  completions?: ICompletion[]
}

export interface IRole {
  name: string
  color: {
    light: string
    dark: string
  }
  description?: string
}

export interface IAutoInsertHandler {
  enabled: boolean
  indentionLength: number
  spaceLines: number
}

export interface IStatus {
  enabled: boolean
  timeUnit: number
}

export interface ICompletion {
  title: string
  context: string
  kind: keyof typeof vscode.CompletionItemKind
}

export interface Dto {
  text: string
  scrollPos: number
  maxLine: number
  style: IPreview
}

export interface IPreview {
  fontSize: number
  indentionLength: number
  spaceLines: number
}

export interface IDecorationHandler {
  decorationType: vscode.TextEditorDecorationType
  regEx: RegExp
  hoverMessage?: vscode.MarkdownString | vscode.MarkdownString[]
}

export enum WebViewConfHandlerEnum {
  fontSize = '字体',
  indentionLength = '缩进',
  spaceLines = '段落空行',
}

export interface WebViewConfHandler {
  target: WebViewConfHandlerEnum
  /**0表示完成，1，-1表示进一步操作 */
  option: number
}
