import * as vscode from 'vscode'

export const init = (context: vscode.ExtensionContext) => {
  const provider = vscode.window.registerWebviewViewProvider('sidebar-view', {
    resolveWebviewView(webviewView) {
      webviewView.webview.options = {
        enableScripts: true,
      }
      const bundleScriptPath = webviewView.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'out', 'app', 'bundle.js'),
      )
      webviewView.webview.html = `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>React App</title>
          </head>

          <body>
            <div id="root"></div>
            <script>
              const vscode = acquireVsCodeApi();
            </script>
            <script src="${bundleScriptPath}"></script>
          </body>
        </html>
      `
    },
  })
  return { provider }
}
