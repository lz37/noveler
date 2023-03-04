import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import * as statusBar from '@/modules/StatusBar'
import * as formatter from '@/modules/Formatter'
import * as indention from '@/modules/Indention'
import * as viewLoader from '@/modules/ViewLoader'
import * as decoration from '@/modules/Decoration'
import * as CSVHandler from '@/modules/CSVReader'
import * as completion from '@/modules/Completion'

// this method is called when vs code is activated
export const activate = async (context: vscode.ExtensionContext) => {
  confHandler.askForPlaintextConf()
  const viewLoaderProvider = viewLoader.provider(context)
  context.subscriptions.push(
    formatter.provider,
    indention.provider,
    statusBar.init(),
    statusBar.change,
    statusBar.changeConf,
    viewLoaderProvider.command,
    viewLoaderProvider.onChangeConf,
    viewLoaderProvider.onChangeDocument,
    viewLoaderProvider.onChangeEditor,
    viewLoaderProvider.onScroll,
    decoration.onChangeConf,
    decoration.onChangeDocument,
    decoration.onChangeConf,
    CSVHandler.reload,
    CSVHandler.onChangeConf,
    completion.deletePrefix,
  )
  await vscode.commands.executeCommand('noveler.reloadCSV')
  completion.setContext(context)
}
