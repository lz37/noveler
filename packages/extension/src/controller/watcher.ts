import * as vscode from 'vscode'
import * as config from '../config'
import * as commands from '../common/commands'
import * as state from '../common/state'
import { IConfig } from '../common/types'

const execInfosCommands = async () => {
  await vscode.commands.executeCommand(commands.Noveler.RELOAD_DECORATION)
  await vscode.commands.executeCommand(commands.Noveler.RELOAD_COMPLETION)
}

export const init = async (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  context.subscriptions.push(onChangeConf(context, roots), ...watchInfosDir(roots, config.get()))
  await execInfosCommands()
}

const onChangeConf = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration(`${state.extPrefix}.infoDir`))
      context.subscriptions.push(...watchInfosDir(roots, config.get()))
  })

const watchInfosDir = (() => {
  const makeWatcher = (infoDir: string) => (workspace: vscode.WorkspaceFolder) => {
    const watcher = vscode.workspace.createFileSystemWatcher(
      // 监控csv与js
      new vscode.RelativePattern(workspace, `${infoDir}/*.{csv,json}`),
    )
    ;[watcher.onDidChange, watcher.onDidCreate, watcher.onDidDelete].forEach((fn) => fn(execInfosCommands))
    return watcher
  }
  let watches: vscode.FileSystemWatcher[] | undefined = undefined
  return (roots: readonly vscode.WorkspaceFolder[], { infoDir }: IConfig) => {
    watches?.forEach((w) => w.dispose())
    watches = roots.map(makeWatcher(infoDir))
    return watches
  }
})()
