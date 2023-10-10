import * as vscode from 'vscode'
import * as config from '../config'
import * as commands from '../common/commands'
import * as state from '../common/state'
import * as R from 'ramda'
import { IConfig, IDirs } from '../common/types'

const execInfosCommands = () => {
  vscode.commands.executeCommand(commands.Noveler.RELOAD_DECORATION)
  vscode.commands.executeCommand(commands.Noveler.RELOAD_COMPLETION)
}

const execDiagnosticsCommands = () => {
  vscode.commands.executeCommand(commands.Noveler.RELOAD_DIAGNOSTIC)
}

export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  context.subscriptions.push(onChangeConf(context, roots), ...watchInfosDir(roots), ...watchDiagnosticDir(roots))
  execInfosCommands()
  execDiagnosticsCommands()
}

const onChangeConf = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IDirs>('infoDir')}`))
      context.subscriptions.push(...watchInfosDir(roots))
    if (event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IDirs>('diagnosticDir')}`))
      context.subscriptions.push(...watchDiagnosticDir(roots))
  })

const watchDir = (() => {
  const makeWatcher = (infoDir: string, exts: string[]) => (hook: () => any) => (workspace: vscode.WorkspaceFolder) => {
    const watcher = vscode.workspace.createFileSystemWatcher(
      // 监控csv与js
      new vscode.RelativePattern(workspace, `${infoDir}/*.{${exts.join(',')}}`),
    )
    ;[watcher.onDidChange, watcher.onDidCreate, watcher.onDidDelete].forEach((fn) => fn(hook))
    return watcher
  }
  let watches: vscode.FileSystemWatcher[] | undefined = undefined
  return (roots: readonly vscode.WorkspaceFolder[], { infoDir }: IConfig, exts: string[], hook: () => any) => {
    watches?.map((w) => w.dispose())
    watches = roots.map(makeWatcher(infoDir, exts)(hook))
    return watches
  }
})()

const watchInfosDir = (roots: readonly vscode.WorkspaceFolder[]) =>
  watchDir(roots, config.get(), ['csv', 'json'], execInfosCommands)
const watchDiagnosticDir = (roots: readonly vscode.WorkspaceFolder[]) =>
  watchDir(roots, config.get(), ['txt'], execDiagnosticsCommands)