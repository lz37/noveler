/**
 * @note 此模块功可能与vscode editor.wrappingIndent 与 editor.autoIndent 配置冲突
 */

import * as vscode from 'vscode'
import * as command from '../common/commands'
import * as config from '../config'
import * as utils from '../common/utils'

const createIndentCommand = vscode.commands.registerTextEditorCommand(
  command.Noveler.CreateIndent,
  (textEditor, edit) => {
    const { autoIndent, autoIndentLines, autoIndentSpaces } = config.get()
    const positions = textEditor.selections.map((item) => item.active)
    const eol = utils.getEOLOfEditor(textEditor)
    const indention = `${eol.repeat(autoIndentLines + 1)}${' '.repeat(
      autoIndentSpaces,
    )}`
    // 获得 multi-cursor 模式下的 position
    positions.forEach((position) => {
      edit.insert(position, autoIndent ? indention : eol)
    })
  },
)

export const init = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(createIndentCommand)
}
