import * as vscode from 'vscode'
import * as assert from 'assert'
import * as path from 'path'
import * as commands from '@common/commands'
import * as config from '@ext/config'
import * as utils from '@common/utils'

suite('Extension Indention Modules Test Suite', () => {
  vscode.window.showInformationMessage('Start modules/indention test')

  test(commands.Noveler.CREATE_INDENT, async () => {
    const testText = '1'
    const textFilePath = path.join(
      __dirname,
      '..',
      '..',
      'test',
      'folder1',
      `testFor${commands.Noveler.CREATE_INDENT}.txt`,
    )
    // vscode 创建文件
    await vscode.workspace.fs.writeFile(vscode.Uri.file(textFilePath), Buffer.from(testText))
    // vscode打开文件
    const doc = await vscode.workspace.openTextDocument(textFilePath)
    const editor = await vscode.window.showTextDocument(doc)
    // 光标移到末尾
    const position = new vscode.Position(
      editor.document.lineCount - 1,
      editor.document.lineAt(editor.document.lineCount - 1).text.length,
    )
    editor.selection = new vscode.Selection(position, position)
    // 执行命令
    await vscode.commands.executeCommand(commands.Noveler.CREATE_INDENT)
    // 获取文本
    const text = editor.document.getText()
    // 删除文件
    await vscode.workspace.fs.delete(vscode.Uri.file(textFilePath))
    const conf = config.get()
    const EOL = utils.getEOLOfEditor(editor)
    assert.strictEqual(text, `${testText}${EOL.repeat(conf.autoIndentLines + 1)}${' '.repeat(conf.autoIndentSpaces)}`)
  })
})
