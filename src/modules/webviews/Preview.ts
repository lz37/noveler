import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import Commands from '@/types/Commands'
import { PreviewDto, PreviewExtRecDto } from '@/types/webvDto'
import { IConfig } from '@/types/config'
import { createWebviewHtml } from '@/utils'

const targetFiles = ['plaintext']

let currentPanel: vscode.WebviewPanel | undefined = undefined
let context: vscode.ExtensionContext | undefined = undefined
let disposables: vscode.Disposable[] | undefined = undefined
const signals: Array<PreviewExtRecDto> = []
const popSignal = async () => {
  while (signals.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return signals.shift()
}
const pushSignal = (s: PreviewExtRecDto) => {
  signals.push(s)
}

const init = (cnt: vscode.ExtensionContext) => {
  context = cnt
  disposables = []
  const panel = vscode.window.createWebviewPanel(
    'NovelerPreview',
    'Noveler Preview',
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      // localResourceRoots: [
      //   vscode.Uri.file(path.join(context.extensionPath, 'out', 'app')),
      // ],
    },
  )
  panel.webview.html = createWebviewHtml('/preview', panel.webview, context)
  panel.webview.onDidReceiveMessage(
    (message: PreviewExtRecDto) => {
      if (message.option !== 0) {
        const config = confHandler.get()
        const { conf: target, option } = message
        const ratio = target === 'previewSpaceLines' ? 0.1 : 1
        const newVal = parseFloat(
          Math.max((config as any)[target] + message.option * ratio, 0).toFixed(
            1,
          ),
        )
        const newKVPair = { [target]: newVal } as unknown
        confHandler.set(newKVPair as IConfig, [
          'previewFontSize',
          'previewIndentionLength',
          'previewSpaceLines',
        ])
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

const showWebview = async (context: vscode.ExtensionContext) => {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined
  if (currentPanel) {
    currentPanel.reveal(column)
  } else {
    currentPanel = init(context)
  }
}

const postMessageToWebview = (msg: PreviewDto) =>
  currentPanel?.webview.postMessage(msg)

export const provider = (context: vscode.ExtensionContext) => {
  return {
    command: vscode.commands.registerCommand(Commands.Preview, async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      if (!targetFiles.includes(editor.document.languageId)) return
      await showWebview(context)
      if ((await popSignal())?.option === 0) {
        await postMessageToWebview({
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
    onScroll: vscode.window.onDidChangeTextEditorVisibleRanges(
      async (event) => {
        const editor = vscode.window.activeTextEditor
        if (!editor) return
        if (!targetFiles.includes(editor.document.languageId)) return
        // 获取滚动条位置
        const scroll = event.visibleRanges[0].start.line
        // 发送消息
        await postMessageToWebview({
          text: editor.document.getText(),
          scrollPos: scroll,
          maxLine: editor.document.lineCount,
          conf: confHandler.get(),
        })
      },
    ),
    onChangeEditor: vscode.window.onDidChangeActiveTextEditor(
      async (editor) => {
        if (!editor) return
        if (!targetFiles.includes(editor.document.languageId)) return
        await postMessageToWebview({
          text: editor.document.getText(),
          scrollPos: 0,
          maxLine: editor.document.lineCount,
          conf: confHandler.get(),
        })
      },
    ),
    onChangeDocument: vscode.workspace.onDidChangeTextDocument(
      async (event) => {
        const editor = vscode.window.activeTextEditor
        if (!editor) return
        if (!targetFiles.includes(editor.document.languageId)) return
        const scroll = editor.visibleRanges[0].start.line
        await postMessageToWebview({
          text: editor.document.getText(),
          scrollPos: scroll,
          maxLine: editor.document.lineCount,
          conf: confHandler.get(),
        })
      },
    ),
    onChangeConf: vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration('noveler')) {
        return
      }
      await postMessageToWebview({
        text: undefined,
        scrollPos: -1,
        maxLine: -1,
        conf: confHandler.get(),
      })
    }),
  }
}
