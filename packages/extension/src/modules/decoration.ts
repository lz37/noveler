import * as vscode from 'vscode'
import { DealedRenderOptions, RenderOptions } from '../common/types'

/**
 * 不会刷新高亮
 */
export const createDecorations = (map: Map<RegExp, RenderOptions>) => {
  const decorations = new Map<RegExp, DealedRenderOptions>()
  map.forEach((value, key) => {
    const decoration: DealedRenderOptions = {
      decorationType: vscode.window.createTextEditorDecorationType(
        value.renderOpts,
      ),
      hoverMsg: value.hoverMsg,
    }
    decorations.set(key, decoration)
  })
  return decorations
}

export const updateDecorations =
  (editor: vscode.TextEditor) => (map: Map<RegExp, DealedRenderOptions>) => {
    map.forEach(updateSingleDecoration(editor))
  }

const updateSingleDecoration =
  (editor: vscode.TextEditor) => (opts: DealedRenderOptions, reg: RegExp) => {
    const text = editor.document.getText()
    const options: vscode.DecorationOptions[] = []
    let match: RegExpExecArray | null = null
    while ((match = reg.exec(text))) {
      const startPos = editor.document.positionAt(match.index)
      const endPos = editor.document.positionAt(match.index + match[0].length)
      const decoration: vscode.DecorationOptions = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: opts.hoverMsg,
      }
      options.push(decoration)
    }
    editor.setDecorations(opts.decorationType, options)
  }
