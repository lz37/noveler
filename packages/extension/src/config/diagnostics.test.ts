import * as vscode from 'vscode'
import * as diagnostics from './diagnostics'
import * as assert from 'assert'
import * as path from 'path'
import * as R from 'ramda'

suite('Extension Config Diagnostics Modules Test Suite', () => {
  vscode.window.showInformationMessage('Start config/diagnostics test')
  const diagnosticsFiles = ['', '国内地名.Warning', '民族.Warning', '宗教.Warning1', 'test1']
  const diagnosticsTest1Path = path.join(
    __dirname,
    '..',
    '..',
    'test',
    'folder2',
    '.noveler',
    'diagnostics',
    'test1.txt',
  )
  const diagnosticsTest1Content = new Set(['av', '军阀', '血腥', '123'])

  test('getTXTOptions', () => {
    const map = diagnostics.getTXTOptions(diagnosticsFiles)
    assert.strictEqual(R.keys(map).length, 5)
    assert.strictEqual(map?.['国内地名.Warning'].message, '国内地名')
    assert.strictEqual(map?.['民族.Warning'].diagnosticSeverity, 'Warning')
    assert.strictEqual(map?.['宗教.Warning1'].diagnosticSeverity, 'Error')
    assert.strictEqual(map?.['test1'].diagnosticSeverity, 'Error')
    assert.strictEqual(map?.[''].message, '敏感词')
  })

  test('getTXTData', async () => {
    const data = await diagnostics.getTXTSingleData(diagnosticsTest1Path)
    assert.deepStrictEqual(data, diagnosticsTest1Content)
  })

  test('getDiagnosticsFromAllWorkspaces', async () => {
    const roots = vscode.workspace.workspaceFolders
    if (!roots) return
    const txtContents = await diagnostics.getDiagnosticsFromAllWorkspaces(roots)
    assert.strictEqual(R.keys(txtContents).length, 1)
  })
})
