import * as vscode from 'vscode'
import * as config from '@ext/config'
import * as commands from '@common/commands'
import * as state from '@common/state'
import * as R from 'ramda'
import { IDirs } from '@common/types'
import path from 'path'

const execInfosCommands = () => {
  vscode.commands.executeCommand(commands.Noveler.RELOAD_DECORATION)
  vscode.commands.executeCommand(commands.Noveler.RELOAD_COMPLETION)
}

const execDiagnosticsCommands = () => {
  vscode.commands.executeCommand(commands.Noveler.RELOAD_DIAGNOSTIC)
}

export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  context.subscriptions.push(onChangeConf(context, roots), ...watchDiagnosticDir(roots), ...watchInfosDir(roots))
  execInfosCommands()
  execDiagnosticsCommands()
}

const onChangeConf = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IDirs>('infoDir')}`)) {
      context.subscriptions.push(...watchInfosDir(roots))
      execInfosCommands()
    }
    if (event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IDirs>('diagnosticDir')}`)) {
      context.subscriptions.push(...watchDiagnosticDir(roots))
      execDiagnosticsCommands()
    }
  })

const watchDir = () => {
  const makeWatcher = (infoDir: string, exts: string[]) => (hook: () => any) => (workspace: vscode.WorkspaceFolder) => {
    const watcher = vscode.workspace.createFileSystemWatcher(
      // 监控csv与js
      new vscode.RelativePattern(workspace, path.join(infoDir, `*.{${exts.join(',')}}`)),
    )
    ;[watcher.onDidChange, watcher.onDidCreate, watcher.onDidDelete].map((fn) => fn(hook))
    return watcher
  }
  let watches: vscode.FileSystemWatcher[] | undefined = undefined
  return (roots: readonly vscode.WorkspaceFolder[], infoDir: string, exts: string[], hook: () => any) => {
    watches?.map((w) => w.dispose())
    watches = roots.map(makeWatcher(infoDir, exts)(hook))
    return watches
  }
}

const watchInfosDir = (roots: readonly vscode.WorkspaceFolder[]) =>
  watchDir()(roots, config.get().infoDir, ['csv', 'json'], execInfosCommands)
const watchDiagnosticDir = (roots: readonly vscode.WorkspaceFolder[]) =>
  watchDir()(roots, config.get().diagnosticDir, ['txt'], execDiagnosticsCommands)
