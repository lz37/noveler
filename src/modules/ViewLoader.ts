import * as vscode from 'vscode'
import * as path from 'path'
import * as confHandler from '@/modules/ConfigHandler'
import { WebViewConfHandler, Dto } from '@/types/webvDto'
import { IConfig } from '@/types/config'

const targetFiles = ['plaintext']

let currentPanel: vscode.WebviewPanel | undefined = undefined
let context: vscode.ExtensionContext | undefined = undefined
let disposables: vscode.Disposable[] | undefined = undefined
const signals: Array<WebViewConfHandler> = []
const popSignal = async () => {
  while (signals.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return signals.shift()
}
const pushSignal = (s: WebViewConfHandler) => {
  signals.push(s)
}

const init = (cnt: vscode.ExtensionContext) => {
  context = cnt
  disposables = []
  const panel = vscode.window.createWebviewPanel('NovelerPreview', 'Noveler Preview', vscode.ViewColumn.Two, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out', 'app'))],
  })
  renderWebview(panel, context)
  panel.webview.onDidReceiveMessage(
    (message: WebViewConfHandler) => {
      if (message.option !== 0) {
        const config = confHandler.get()
        const { target, option } = message
        const ratio = target === 'previewSpaceLines' ? 0.1 : 1
        const newVal = parseFloat(Math.max((config as any)[target] + message.option * ratio, 0).toFixed(1))
        const newKVPair = { [target]: newVal } as unknown
        confHandler.set(newKVPair as IConfig)
      }
      pushSignal(message)
    },
    null,
    disposables,
  )
  panel.onDidDispose(
    () => {
      currentPanel = undefined
      // Clean up our resources
      panel.dispose()
      while (disposables?.length) {
        const x = disposables.pop()
        if (x) x.dispose()
      }
    },
    null,
    disposables,
  )
  return panel
}

const renderWebview = (panel: vscode.WebviewPanel, context: vscode.ExtensionContext) => {
  const html = render(panel, context)
  panel.webview.html = html
}

const showWebview = (context: vscode.ExtensionContext) => {
  const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined
  if (currentPanel) {
    currentPanel.reveal(column)
  } else {
    currentPanel = init(context)
  }
}

const postMessageToWebview = (msg: Dto) => {
  currentPanel?.webview.postMessage(msg)
}

const render = (panel: vscode.WebviewPanel, context: vscode.ExtensionContext) => {
  const bundleScriptPath = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'out', 'app', 'bundle.js')),
  )
  return `
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
}

export const provider = (context: vscode.ExtensionContext) => {
  return {
    command: vscode.commands.registerCommand('noveler.preview', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (!targetFiles.includes(editor.document.languageId)) return
      showWebview(context)
      if ((await popSignal())?.option === 0) {
        postMessageToWebview({
          text: editor.document.getText(),
          scrollPos: 0,
          maxLine: editor.document.lineCount,
          conf: confHandler.get(),
        })
      }
      // 活动编辑器改回原值
      vscode.window.showTextDocument(editor.document, editor.viewColumn)
    }),
    // 滚动条滚动时
    onScroll: vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (!targetFiles.includes(editor.document.languageId)) return
      // 获取滚动条位置
      const scroll = event.visibleRanges[0].start.line
      // 发送消息
      postMessageToWebview({
        text: editor.document.getText(),
        scrollPos: scroll,
        maxLine: editor.document.lineCount,
        conf: confHandler.get(),
      })
    }),
    onChangeEditor: vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return
      if (!targetFiles.includes(editor.document.languageId)) return
      postMessageToWebview({
        text: editor.document.getText(),
        scrollPos: 0,
        maxLine: editor.document.lineCount,
        conf: confHandler.get(),
      })
    }),
    onChangeDocument: vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (!targetFiles.includes(editor.document.languageId)) return
      const scroll = editor.visibleRanges[0].start.line
      postMessageToWebview({
        text: editor.document.getText(),
        scrollPos: scroll,
        maxLine: editor.document.lineCount,
        conf: confHandler.get(),
      })
    }),
    onChangeConf: vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration('noveler')) {
        return
      }
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (!targetFiles.includes(editor.document.languageId)) return
      postMessageToWebview({
        text: editor ? editor.document.getText() : '',
        scrollPos: 0,
        maxLine: editor ? editor.document.lineCount : 0,
        conf: confHandler.get(),
      })
    }),
  }
}
