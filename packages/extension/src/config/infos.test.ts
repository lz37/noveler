import * as assert from 'assert'
import * as infos from '@ext/config/infos'
import * as vscode from 'vscode'
import * as path from 'path'
import * as utils from '@common/utils'
import { ICSVOption } from '@common/types'

suite('Extension Config Infos Modules Test Suite', () => {
  vscode.window.showInformationMessage('Start config/infos test')
  const folder2InfosPath = path.join(__dirname, '..', '..', 'test', 'folder2', '.noveler', 'infos')
  const test1Opt: ICSVOption = {
    nameKey: 'key',
    hoverKey: 'hoverKey',
    description: '主角：',
    suggestKind: 'Method',
    decorationRenderOptions: {
      color: '#9e952f',
    },
  }
  const test2Opt: ICSVOption = {
    nameKey: 'key',
    hoverKey: 'hoverKey',
    description: '配角：',
    suggestKind: 'Method',
    decorationRenderOptions: {
      color: '#9e952f',
    },
  }

  test('getCSVOptions', async () => {
    const csvFiles = await utils.getFileNameInDir(folder2InfosPath, 'csv', false)
    const csvOptions = await infos.getCSVOptions(folder2InfosPath, csvFiles)
    const map = {
      test1: test1Opt,
      test2: test2Opt,
    }
    // 判断字面量相等
    assert.deepStrictEqual(csvOptions, map)
  })

  test('getInfosFromAllWorkspaces', async () => {
    const roots = vscode.workspace.workspaceFolders
    if (!roots) return
    const csvContents = await infos.getInfosFromAllWorkspaces(roots)()
    assert.strictEqual(csvContents[roots.filter((root) => root.uri.path.endsWith('folder1'))[0].uri.path], undefined)
  })

  test('getCSVDatas', async () => {
    const dataMap = await infos.getCSVDatas(vscode.workspace.workspaceFolders![1], folder2InfosPath, ['test2'], {
      test2: test2Opt,
    })
    assert.deepStrictEqual(dataMap, {
      test2: {
        女王: {
          hover: new vscode.MarkdownString(
            '西梁女国的国王，姓名不详。女王在西梁国从未见过男人，举国上下靠子母河水繁衍后代，她见唐僧是天朝上国男儿，想要用一国之富招唐僧为王，自己情愿与他做个王后。孙悟空不愿用对付妖怪的方式对付凡人，于是说服唐僧假装答应，在吃过婚宴之后，哄骗女王将唐僧师徒送出城。因为蝎子精的出现，孙悟空等显露出神通，女王方才醒悟，自觉惭愧，黯然回城。',
          ),
        },
      },
    })
  })
})
