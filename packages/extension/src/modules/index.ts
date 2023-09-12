import * as vscode from 'vscode'
import * as indention from './indention'
import * as formatter from './formatter'
import * as decoration from './decoration'
import * as completion from './completion'
import * as watcher from './watcher'
import * as diagnostics from './diagnostics'
import * as statusbar from './statusBar'
import * as infoBar from './infoBar'
import * as commands from '../common/commands'
import * as pairCompletion from './pairCompletion'

export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  infoBar.init(context)
  vscode.commands.executeCommand(commands.Noveler.INFO_BAR_SHOW, 'Noveler is loading...')
  indention.init(context)
  formatter.init(context)
  decoration.init(context, roots)
  completion.init(context, roots)
  diagnostics.init(context, roots)
  pairCompletion.init(context)
  watcher.init(context, roots)
  statusbar.init(context)
  vscode.commands.executeCommand(commands.Noveler.INFO_BAR_HIDE)
}

export const destory = (context: vscode.ExtensionContext) => {
  context.subscriptions.map((sub) => sub.dispose())
  while (context.subscriptions.pop());
}
