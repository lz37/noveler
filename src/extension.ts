import * as vscode from 'vscode'
import { Decoration } from './Decoration'
import * as config from './Config'
import { autoInsert } from './Indention'
import { Status } from './Status'
import { ViewLoader } from './ViewLoader'
import { updateAndGetProvider, triggerSuggest } from './Completion'
import { formatProvider } from './Formatter'
import { isPlaintext } from './utils'

// this method is called when vs code is activated
export const activate = async (context: vscode.ExtensionContext) => {
  config.init()
  await config.askForplaintextConf()
  const status = new Status(config.getConf().statusBar)
  const decoration = new Decoration(config.getConf())

  const activeEditor = vscode.window.activeTextEditor
  const disposables: vscode.Disposable[] = []
  disposables.push(
    vscode.commands.registerCommand('extension.helloWorld', () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage('Hello World!')
    }),
  )

  context.subscriptions.push(...disposables)

  if (activeEditor && isPlaintext(activeEditor)) {
    decoration.triggerUpdateDecorations(activeEditor)
  }
  let provider = updateAndGetProvider(config.getConf())

  context.subscriptions.push(
    autoInsert,
    formatProvider,
    provider,
    triggerSuggest.before,
    triggerSuggest.after,
    vscode.commands.registerCommand('noveler.preview', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        return
      }
      if (!isPlaintext(editor)) {
        return
      }
      ViewLoader.showWebview(context)
      if ((await ViewLoader.popSignal())?.option === 0) {
        ViewLoader.postMessageToWebview({
          text: editor.document.getText(),
          scrollPos: 0,
          maxLine: editor.document.lineCount,
          style: ViewLoader.style,
        })
      }
      // 活动编辑器改回原值
      vscode.window.showTextDocument(editor.document, editor.viewColumn)
    }),
    // 滚动条滚动时
    vscode.window.onDidChangeTextEditorVisibleRanges(async (event) => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        return
      }
      if (!isPlaintext(editor)) {
        return
      }
      // 获取滚动条位置
      const scroll = event.visibleRanges[0].start.line
      // 发送消息
      ViewLoader.postMessageToWebview({
        text: editor.document.getText(),
        scrollPos: scroll,
        maxLine: editor.document.lineCount,
        style: ViewLoader.style,
      })
    }),
    // 状态栏的输入字数输入速度输入时间显示
    status.item,
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) {
        return
      }
      if (!isPlaintext(editor)) {
        return
      }
      decoration.triggerUpdateDecorations(editor)
      ViewLoader.postMessageToWebview({
        text: editor.document.getText(),
        scrollPos: 0,
        maxLine: editor.document.lineCount,
        style: ViewLoader.style,
      })
    }),
    vscode.workspace.onDidChangeTextDocument(async (event) => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        return
      }
      if (!isPlaintext(editor)) {
        return
      }
      if (event.document === editor.document) {
        decoration.triggerUpdateDecorations(editor, true)
      }
      // 如果有输入内容
      status.update(event)
      const scroll = editor.visibleRanges[0].start.line
      ViewLoader.postMessageToWebview({
        text: editor.document.getText(),
        scrollPos: scroll,
        maxLine: editor.document.lineCount,
        style: ViewLoader.style,
      })
    }),
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration('noveler')) {
        return
      }
      config.update()
      decoration.updateHandler(config.getConf())
      status.updateConf(config.getConf().statusBar)
      const editor = vscode.window.activeTextEditor
      if (editor) {
        decoration.destroyDecorations(editor)
        decoration.triggerUpdateDecorations(editor)
      }
      ViewLoader.style = config.getConf().preview
      ViewLoader.postMessageToWebview({
        text: editor ? editor.document.getText() : '',
        scrollPos: 0,
        maxLine: editor ? editor.document.lineCount : 0,
        style: ViewLoader.style,
      })
      // 更新updateAndGetProvider(config.value)
      provider.dispose()
      provider = updateAndGetProvider(config.getConf())
      context.subscriptions.push(provider)
    }),
  )
}
