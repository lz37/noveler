import * as vscode from 'vscode'

export type CompletionItemKindKeys = keyof typeof vscode.CompletionItemKind

export interface ICSVOption {
  mainKey?: string
  aliasKey?: string
  decorationRenderOptions?: vscode.DecorationRenderOptions
  description: string
  suggestKind?: CompletionItemKindKeys
}

/**
 * 用于存储csv文件的数据
 * key: csv文件中的nameKey对应的内容
 */
export type ICSVData = Record<
  string,
  {
    hover?: vscode.MarkdownString
    alias?: string[]
  }
>

/**
 * 一组csv和json包含的最终信息
 */
export interface ICSVContent {
  data: ICSVData
  decorationRenderOptions?: vscode.DecorationRenderOptions
  description: string
  suggestKind?: CompletionItemKindKeys
}
