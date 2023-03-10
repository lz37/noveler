import { createWebviewHtml } from '@/utils'
import * as vscode from 'vscode'

export const init = (context: vscode.ExtensionContext) => {
  const provider = vscode.window.registerWebviewViewProvider(
    'noveler-outline',
    {
      resolveWebviewView(webviewView) {
        webviewView.webview.options = {
          enableScripts: true,
        }
        const bundleScriptPath = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, 'out', 'app', 'bundle.js'),
        )
        webviewView.webview.html = createWebviewHtml('/panel', bundleScriptPath)
      },
    },
  )
  return { provider }
}
