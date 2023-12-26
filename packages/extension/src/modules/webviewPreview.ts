import * as vscode from 'vscode'
import * as R from 'ramda'
import * as utils from '@common/utils'
import * as commands from '@common/commands'
import * as state from '@common/state'
import { IBaseDTO } from '@common/types'

let panel: PanelHandler | undefined

export const init = (context: vscode.ExtensionContext) => {
  panel = new PanelHandler(utils.createWebviewHtml(context)('/preview'))
  context.subscriptions.push(panelShow)
}

const panelShow = vscode.commands.registerCommand(commands.Noveler.PANEL_PREVIEW_SHOW, () => {
  panel?.show(vscode.window.activeTextEditor)
})

class PanelHandler {
  private panel: vscode.WebviewPanel | undefined
  private webviewCreator: (webview: vscode.Webview) => string
  constructor(webviewCreator: (webview: vscode.Webview) => string) {
    this.webviewCreator = webviewCreator
  }
  private panelCreator = () => {
    const panel = vscode.window.createWebviewPanel('NovelerPreview', 'Noveler Preview', vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
    })
    panel.webview.html = this.webviewCreator(panel.webview)
    panel.onDidDispose(() => (this.panel = undefined))
    this.panel = panel
  }
  private postMessage = (message: Partial<IBaseDTO>) => {
    this.panel?.webview.postMessage({ ...message, time: Date.now() } as IBaseDTO)
  }
  show = (editor?: vscode.TextEditor) => {
    if (this.panel) {
      this.panel.dispose()
    } else if (editor && state.funcTarget.webviewPreview.includes(editor.document.languageId)) {
      this.panelCreator()
      // console.log(editor.document.getText())
      // 等待2秒
      setTimeout(() => {
        this.postMessage({})
      }, 2000)
    }
  }
}
