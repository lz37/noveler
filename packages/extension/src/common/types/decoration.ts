import * as vscode from 'vscode'

export interface IRenderOptions {
  renderOpts: vscode.DecorationRenderOptions
  hoverMsg?: vscode.MarkdownString
}

export interface IDealedRenderOptions {
  decorationType: vscode.TextEditorDecorationType
  hoverMsg?: vscode.MarkdownString
}

/**
 * key should be a RegExp string
 */
export interface IRegExpRenderOptionsMap {
  [key: string]: IRenderOptions
}

export interface IRegExpDealedRenderOptionsMap {
  [key: string]: IDealedRenderOptions
}
