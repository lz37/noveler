import * as vscode from 'vscode'
import * as utils from '.'
import * as assert from 'assert'
import * as fs from 'fs/promises'
import * as path from 'path'

suite('Extension Common Utils Test Suite', () => {
  vscode.window.showInformationMessage('Start common/utils test')

  test('isDirOrMkdir', async () => {
    const tmpTestDir = path.join(__dirname, 'tmp', 'test')
    const tmpDir = path.join(__dirname, 'tmp')
    const isDir = await utils.isDirOrMkdir(tmpTestDir)
    assert.strictEqual(isDir, true)
    await fs.rm(tmpDir, { recursive: true })
  })
})
