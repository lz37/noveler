import * as vscode from 'vscode'
import * as indention from './indention'
import * as formatter from './formatter'
import * as decoration from './decoration'
import * as completion from './completion'
import * as watcher from './watcher'
import * as diagnostics from './diagnostics'
import * as countbar from './countbar'
import * as statusbar from './statusbar'
import * as command from '../common/commands'

export const init = async (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  statusbar.init(context)
  indention.init(context)
  formatter.init(context)
  decoration.init(context, roots)
  completion.init(context, roots)
  diagnostics.init(context, roots)
  await watcher.init(context, roots)
  countbar.init(context)
  // await vscode.commands.executeCommand(command.Noveler.STATUSBAR_INIT_COMPLETION)
}
