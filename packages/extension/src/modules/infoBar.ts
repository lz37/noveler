import * as vscode from 'vscode'
import * as state from '../common/state'
import * as commands from '../common/commands'

let handler: NovelerStatusBarHandler | undefined = undefined

export const init = (context: vscode.ExtensionContext) => {
  handler = new NovelerStatusBarHandler(context)
  context.subscriptions.push(commandShow, commandHide)
}

const commandShow = vscode.commands.registerCommand(commands.Noveler.INFO_BAR_SHOW, (text: string) => {
  handler?.show(text)
})

const commandHide = vscode.commands.registerCommand(commands.Noveler.INFO_BAR_HIDE, () => {
  handler?.hide()
})

class NovelerStatusBarHandler {
  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(this.bar)
  }
  private bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, state.barsPriority.status)
  private isShowing = false
  private showingStartTime = 0
  hide() {
    const hideFunc = () => {
      this.bar.hide()
      this.isShowing = false
    }
    if (Date.now() - this.showingStartTime < 10000) {
      setTimeout(() => {
        hideFunc()
      }, 1000)
      return
    }
    hideFunc()
  }
  show(text: string) {
    this.text = text
    if (!this.isShowing) this.bar.show()
    this.isShowing = true
    this.showingStartTime = Date.now()
  }
  //#region getter & setter
  private set text(value: string) {
    this.bar.text = value
  }
  //#endregion
}
