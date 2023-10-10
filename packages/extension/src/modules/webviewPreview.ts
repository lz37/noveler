import * as vscode from 'vscode'
import * as R from 'ramda'
import * as utils from '../common/utils'
import * as commands from '../common/commands'
import { NovelerRouter } from '../common/types'

let panel: PanelHandler | undefined

export const init = (context: vscode.ExtensionContext) => {
  panel = new PanelHandler(utils.createWebviewHtml(context)('/preview'))
  context.subscriptions.push(panelShow)
}

const panelShow = vscode.commands.registerCommand(commands.Noveler.PANEL_PREVIEW_SHOW, () => {
  panel?.show()
})

class PanelHandler {
  private panel: vscode.WebviewPanel | undefined
  private disposables: vscode.Disposable[] = []
  constructor(createWebviewHtml: (webview: vscode.Webview) => string) {
    const panel = vscode.window.createWebviewPanel('NovelerPreview', 'Noveler Preview', vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
    })
    panel.webview.html = createWebviewHtml(panel.webview)
    this.panel = panel
  }
  show() {
    console.log('show')
    const column = vscode.window.activeTextEditor?.viewColumn
    this.panel?.reveal(column)
  }
}
