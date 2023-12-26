import * as vscode from 'vscode'
import * as indention from '@ext/modules/indention'
import * as formatter from '@ext/modules/formatter'
import * as decoration from '@ext/modules/decoration'
import * as completion from '@ext/modules/completion'
import * as watcher from '@ext/modules/watcher'
import * as diagnostics from '@ext/modules/diagnostics'
import * as statusbar from '@ext/modules/statusBar'
import * as infoBar from '@ext/modules/infoBar'
import * as commands from '@common/commands'
import * as pairCompletion from '@ext/modules/pairCompletion'
import * as webviewPreview from '@ext/modules/webviewPreview'

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
  webviewPreview.init(context)
  vscode.commands.executeCommand(commands.Noveler.INFO_BAR_HIDE)
}

export const destory = (context: vscode.ExtensionContext) => {
  context.subscriptions.map((sub) => sub.dispose())
  while (context.subscriptions.pop());
}
