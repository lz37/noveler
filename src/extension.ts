import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import * as statusBar from '@/modules/StatusBar'
import * as formatter from '@/modules/Formatter'
import * as indention from '@/modules/Indention'
import * as preview from '@/modules/webviews/Preview'
import * as decoration from '@/modules/Decoration'
import * as completion from '@/modules/Completion'
import * as CSVReader from '@/modules/reader/CSVReader'
import * as TXTReader from '@/modules/reader/TXTReader'
import * as diagnostic from '@/modules/Diagnostic'
import * as panel from '@/modules/webviews/Panel'
import Commands from '@/types/Commands'
import * as os from 'os'

// this method is called when vs code is activated
export const activate = async (context: vscode.ExtensionContext) => {
  const editor = vscode.window.activeTextEditor
  await confHandler.askForPlaintextConf()
  // ------------------ setcontext ------------------
  const previewProvider = preview.provider(context)
  completion.setContext(context)
  panel.init(context, os.platform(), editor)
  // ------------------ register ------------------
  context.subscriptions.push(
    formatter.provider,
    indention.provider,
    statusBar.init(),
    statusBar.change,
    statusBar.changeConf,
    statusBar.changeEditor,
    previewProvider.command,
    previewProvider.onChangeConf,
    previewProvider.onChangeDocument,
    previewProvider.onChangeEditor,
    previewProvider.onScroll,
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
  )
  // ------------------ extension-init ------------------
  await vscode.commands.executeCommand(Commands.ReloadCSV)
  await vscode.commands.executeCommand(Commands.ReloadTXT)
}
