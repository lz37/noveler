import * as vscode from 'vscode'
import * as assert from 'assert'
import * as path from 'path'
import * as commands from '../common/commands'
import * as config from '../config'
import * as utils from '../common/utils'

suite('Extension Formatter Modules Test Suite', () => {
  vscode.window.showInformationMessage('Start modules/formatter test')

  test(commands.Etc.FormatDocument, async () => {
    const testText = '1\n3可以1\n\n1啊'
    const textFilePath = path.join(
      __dirname,
      '..',
      '..',
      'test',
      'folder1',
      `testFor${commands.Etc.FormatDocument}.txt`,
    )
    // vscode 创建文件
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(textFilePath),
      Buffer.from(testText),
    )
    // vscode打开文件
    const doc = await vscode.workspace.openTextDocument(textFilePath)
    const editor = await vscode.window.showTextDocument(doc)
    // 执行命令
    await vscode.commands.executeCommand(commands.Etc.FormatDocument)
    // 获取文本
    const text = editor.document.getText()
    // 删除文件
    await vscode.workspace.fs.delete(vscode.Uri.file(textFilePath))
    const conf = config.get()
    const EOL = utils.getEOLOfEditor(editor)
    const indentSpaces = ' '.repeat(conf.autoIndentSpaces)
    const indentLines = EOL.repeat(conf.autoIndentLines + 1)
    const expectedText = `${indentSpaces}1${indentLines}${indentSpaces}3 可以 1${indentLines}${indentSpaces}1 啊${EOL}`
    assert.strictEqual(text, expectedText)
  })
})
