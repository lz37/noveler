import * as vscode from 'vscode'
import * as config from './Config'
import { state } from './state'
import { isPlaintext } from './utils'

// @note 此功能与vscode editor.wrappingIndent 与 editor.autoIndent 配置冲突

/**判断是否是回车 */
const isEnter = (str: string) => {
  return str == '\r\n' || str == '\r' || str == '\n'
}

export const indentionCreate = (event: vscode.TextDocumentChangeEvent, indentionNumber: number, spaceLines: number) => {
  // 检测输入是否是回车，是的话在输入回车后添加两个空格
  if (!isEnter(event.contentChanges[0]?.text)) {
    return
  }
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }
  let indention = ''
  for (let i = 0; i < spaceLines; i++) {
    indention += event.contentChanges[0].text
  }
  for (let i = 0; i < indentionNumber; i++) {
    indention += ' '
  }
  // 获得 multi-cursor 模式下的 position
  const positions = editor.selections.map((selection) => {
    return selection.active
  })
  editor.edit((editBuilder) => {
    positions.forEach((position, index) => {
      // 将光标移动到下一行开头
      const newPosition = position.with(position.line + index + 1, 0)
      // 自动补全缩进
      editBuilder.insert(newPosition, indention)
    })
  })
}

export const autoInsert = vscode.workspace.onDidChangeTextDocument(async (event) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return
  if (!isPlaintext(editor)) return
  if (state.isFormatting) {
    // 触发命令editor.action.formatDocument
    await vscode.commands.executeCommand('editor.action.formatDocument')
    state.isFormatting = false
    return
  }
  if (event.document === editor.document) {
    const autoInsertHandler = config.getConf().autoInsert
    if (autoInsertHandler && autoInsertHandler.enabled && autoInsertHandler.indentionLength > 0) {
      indentionCreate(event, autoInsertHandler.indentionLength, autoInsertHandler.spaceLines)
    }
  }
})
