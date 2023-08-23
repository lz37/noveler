import * as vscode from 'vscode'

export type CompletionItemKindKeys = keyof typeof vscode.CompletionItemKind

export interface CSVOption {
  /**对应的csv数据是去掉首尾空格的字符串 */
  nameKey: string
  /**对应的csv数据是去掉首尾空格的markdown字符串 */
  hoverKey?: string
  /**对应的csv数据是一个json数组 */
  aliasKey?: string
  decorationRenderOptions?: vscode.DecorationRenderOptions
  description: string
  suggestKind?: CompletionItemKindKeys
}

/**
 * 用于存储csv文件的数据
 * key: csv文件中的nameKey对应的内容
 */
export interface CSVData {
  [key: string]: {
    hover?: vscode.MarkdownString
    alias?: string[]
  }
}

export interface FileCSVOptionMap {
  [file: string]: CSVOption
}

export interface FileCSVDataMap {
  [file: string]: CSVData
}

export interface FileCSVContentMap {
  [file: string]: CSVContent
}

export interface RootCSVContentMapMap {
  [root: string]: FileCSVContentMap
}

/**
 * 一组csv和json包含的最终信息
 */
export interface CSVContent {
  data: CSVData
  decorationRenderOptions?: vscode.DecorationRenderOptions
  description: string
  suggestKind?: CompletionItemKindKeys
}
