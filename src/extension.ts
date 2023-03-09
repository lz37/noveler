import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import * as statusBar from '@/modules/StatusBar'
import * as formatter from '@/modules/Formatter'
import * as indention from '@/modules/Indention'
import * as viewLoader from '@/modules/ViewLoader'
import * as decoration from '@/modules/Decoration'
import * as completion from '@/modules/Completion'
import * as CSVReader from '@/modules/reader/CSVReader'
import * as TXTReader from '@/modules/reader/TXTReader'
import * as diagnostic from '@/modules/Diagnostic'
import * as comment from '@/modules/Comment'
import Commands from '@/state/Commands'

// this method is called when vs code is activated
export const activate = async (context: vscode.ExtensionContext) => {
  await confHandler.askForPlaintextConf()
  // ------------------ setcontext ------------------
  const viewLoaderProvider = viewLoader.provider(context)
  completion.setContext(context)
  // ------------------ register ------------------
  context.subscriptions.push(
    formatter.provider,
    indention.provider,
    statusBar.init(),
    statusBar.change,
    statusBar.changeConf,
    statusBar.changeEditor,
    viewLoaderProvider.command,
    viewLoaderProvider.onChangeConf,
    viewLoaderProvider.onChangeDocument,
    viewLoaderProvider.onChangeEditor,
    viewLoaderProvider.onScroll,
    decoration.onChangeConf,
    decoration.onChangeDocument,
    CSVReader.reloadCommand,
    CSVReader.onChangeConf,
    TXTReader.reloadCommand,
    completion.deletePrefixCommand,
    diagnostic.onChangeEditor,
    diagnostic.onChangeDocument,
    diagnostic.onChangConf,
    diagnostic.onChangeConfDocument,
    comment.commentController,
    ...Object.values(comment.commands),
  )
  // ------------------ extension-init ------------------
  await vscode.commands.executeCommand(Commands.ReloadCSV)
  await vscode.commands.executeCommand(Commands.ReloadTXT)
}
