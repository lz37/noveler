import * as vscode from 'vscode'
import * as indention from './indention'
import * as formatter from './formatter'
import * as decoration from './decoration'

export const init = async (
  context: vscode.ExtensionContext,
  roots: readonly vscode.WorkspaceFolder[],
) => {
  indention.init(context)
  formatter.init(context)
  await decoration.init(context, roots)
}
