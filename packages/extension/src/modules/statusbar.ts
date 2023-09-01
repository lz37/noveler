import * as vscode from 'vscode'
import * as state from '../common/state'

let handler: NovelerStatusBarHandler | undefined = undefined

export const init = (context: vscode.ExtensionContext) => {
  handler = new NovelerStatusBarHandler(context)
}

class NovelerStatusBarHandler {
  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(this.bar)
    this.text = 'Noveler Initializing...'
    this.show()
  }
  private bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, state.barsPriority.status)
  //#region getter & setter
  private set text(value: string) {
    this.bar.text = value
  }
  private show() {
    this.bar.show()
  }
  //#endregion
}
