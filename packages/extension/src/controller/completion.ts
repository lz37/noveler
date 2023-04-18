import * as vscode from 'vscode'
import * as commands from '../common/commands'
import * as config from '../config'
import * as infos from '../config/infos'
import * as completion from '../modules/completion'
import * as R from 'ramda'
import { CSVContent } from '../common/types'

export const init = async (
  context: vscode.ExtensionContext,
  roots: readonly vscode.WorkspaceFolder[],
) => {
  context.subscriptions.push(reloadCommand(context, roots))
}

const reloadCommand = (
  context: vscode.ExtensionContext,
  roots: readonly vscode.WorkspaceFolder[],
) =>
  vscode.commands.registerCommand(
    commands.Noveler.RELOAD_COMPLETION,
    async () => {
      storeProvider()()
      R.pipe(
        (map: Map<string, Map<string, CSVContent>>) => {
          const newMap = new Map<string, CSVContent>()
          map.forEach((value) => {
            value.forEach((value, key) => {
              newMap.set(key, value)
            })
          })
          return newMap
        },
        completion.createCompletionOptions,
        completion.makeProvider(config.get()),
        storeProvider(context),
      )(await infos.getInfosFromAllWorkspaces(roots)())
    },
  )

const storeProvider = (() => {
  let disposable: vscode.Disposable | undefined = undefined
  return (context?: vscode.ExtensionContext) =>
    (provider?: vscode.Disposable) => {
      disposable?.dispose()
      disposable = provider
      provider && context?.subscriptions.push(provider)
    }
})()
