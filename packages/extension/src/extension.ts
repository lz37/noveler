/**
 * developed by
 * __________            _______    __________
 * \____    /___________ \   _  \   \____    /____ __  _  _______
 *   /     // __ \_  __ \/  /_\  \    /     /\__  \\ \/ \/ /\__  \
 *  /     /\  ___/|  | \/\  \_/   \  /     /_ / __ \\     /  / __ \_
 * /_______ \___  >__|    \_____  / /_______ (____  /\/\_/  (____  /
 *         \/   \/              \/          \/    \/             \/
 */

import * as vscode from 'vscode'
import * as config from './config'
import * as modules from './modules'
import { IConfig, IDirs } from './common/types'
import * as state from './common/state'
import * as R from 'ramda'

// this method is called when vs code is activated
export const activate = async (context: vscode.ExtensionContext) => {
  await config.askForPlaintextConf()
  modules.init(context, vscode.workspace.workspaceFolders ?? [])
  // workspaceFolders 改变
  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeWorkspaceFolders(() => {
  //     // modules.destory(context)
  //     modules.init(context, vscode.workspace.workspaceFolders ?? [])
  //   }),
  //   vscode.workspace.onDidChangeConfiguration((event) => {
  //     if (
  //       R.always<(keyof IDirs)[]>(['infoDir', 'novelDir', 'outlinesDir', 'diagnosticDir'])()
  //         .map((key) => event.affectsConfiguration(`${state.extPrefix}.${key}`))
  //         .reduce((acc, cur) => acc || cur, false)
  //     )
  //       return
  //     // modules.destory(context)
  //     modules.init(context, vscode.workspace.workspaceFolders ?? [])
  //   }),
  // )
}

export const deactivate = () => {
  // nothing to do
}
