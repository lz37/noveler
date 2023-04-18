import * as path from 'path'

import { runTests } from '@vscode/test-electron'
;(async () => {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        path.resolve(__dirname, '../../test/workspace.code-workspace'),
      ],
    })
  } catch (err) {
    console.error('Failed to run tests', err)
    process.exit(1)
  }
})()
