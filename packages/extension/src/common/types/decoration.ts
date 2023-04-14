import * as vscode from 'vscode'

export interface RenderOptions {
  renderOpts: vscode.DecorationRenderOptions
  hoverMsg?: vscode.MarkdownString[]
}

export interface DealedRenderOptions {
  decorationType: vscode.TextEditorDecorationType
  hoverMsg?: vscode.MarkdownString[]
}
