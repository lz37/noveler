/**
 * @note 此模块功可能与vscode editor.wrappingIndent 与 editor.autoIndent 配置冲突
 */

import * as vscode from 'vscode'
import * as command from '../common/commands'
import * as config from '../config'
import * as utils from '../common/utils'
import * as state from '../common/state'
import * as R from 'ramda'

const createIndentCommand = vscode.commands.registerTextEditorCommand(
  command.Noveler.CreateIndent,
  (editor, edit) => {
    const { autoIndent, autoIndentLines, autoIndentSpaces } = config.get()
    const positions = editor.selections.map((item) => item.active)
    const eol = utils.getEOLOfEditor(editor)
    const includesLangId = state.funcTarget.indention.includes(
      editor.document.languageId,
    )
    const isNovel = utils.isNovelDoc(editor.document)(config.get(true))
    const indention = R.cond([
      [() => !includesLangId, () => eol],
      [() => !isNovel, () => eol],
      [
        () => autoIndent,
        () =>
          `${eol.repeat(autoIndentLines + 1)}${' '.repeat(autoIndentSpaces)}`,
      ],
      [R.T, () => eol],
    ])()
    // 获得 multi-cursor 模式下的 position
    positions.forEach((position) => {
      edit.insert(position, indention)
    })
  },
)

export const init = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(createIndentCommand)
}
