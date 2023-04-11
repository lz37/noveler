import * as vscode from 'vscode'

export type CompletionItemKindKeys = keyof typeof vscode.CompletionItemKind

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
  diagnosticDir: string
  infoDir: string
}
//#endregion

//#region csv
export interface CSVOption {
  /**对应的csv数据是去掉首尾空格的字符串 */
  nameKey: string
  /**对应的csv数据是去掉首尾空格的markdown字符串 */
  hoverKey?: string
  /**对应的csv数据是一个json数组 */
  aliasKey?: string
  decorationRenderOptions?: vscode.DecorationRenderOptions
  suggestPrefix: string
  suggestKind?: CompletionItemKindKeys
}

/**
 * 一个Map
 * 用于存储csv文件的数据
 * key: csv文件中的nameKey对应的内容
 */
export type CSVData = Map<
  string,
  {
    hover?: vscode.MarkdownString
    alias?: string[]
  }
>

/**
 * 一组csv和json包含的最终信息
 */
export interface CSVContent {
  data: CSVData
  decorationRenderOptions?: vscode.DecorationRenderOptions
  suggestPrefix: string
  suggestKind?: CompletionItemKindKeys
}
