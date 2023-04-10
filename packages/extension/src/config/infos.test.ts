import * as assert from 'assert'
import * as infos from './infos'
import * as vscode from 'vscode'
import * as path from 'path'
import { CSVOption } from 'src/common/types'

suite('Extension Config Modules Test Suite', () => {
  vscode.window.showInformationMessage('Start config/infos test')

  test('getCSVOptions', async () => {
    const infosPath = path.join(
      __dirname,
      '..',
      '..',
      'test',
      'folder2',
      '.noveler',
      'infos',
    )
    const csvOptions = await infos.getCSVOptions(infosPath)
    const map = new Map<string, CSVOption>()
    map.set('test1', {
      key: 'key',
      hoverKey: 'hoverKey',
      suggestPrefix: '主角：',
      suggestKind: 'Method',
      decorationRenderOptions: {
        color: '#9e952f',
      },
    })
    map.set('test2', {
      key: 'key',
      hoverKey: 'hoverKey',
      suggestPrefix: '配角：',
      suggestKind: 'Method',
      decorationRenderOptions: {
        color: '#9e952f',
      },
    })
    // 判断字面量相等
    assert.deepStrictEqual(csvOptions, map)
  })

  test('getCSVOptionsFromAllWorkspaces', async () => {
    const csvOptions = await infos.getCSVOptionsFromAllWorkspaces()
    assert.strictEqual(csvOptions?.size, 1)
  })
})
