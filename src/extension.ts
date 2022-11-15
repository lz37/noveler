import * as vscode from 'vscode'
import decoration from './Decoration'
import config from './Config'
import indentionCreate from './Indention'
import status from './Status'
import { ViewLoader } from './ViewLoader'
import { updateAndGetProvider, triggerSuggest } from './Completion'

const isPlaintext = (editor: vscode.TextEditor) => {
	return editor.document.languageId === 'plaintext'
}

// this method is called when vs code is activated
export const activate = (context: vscode.ExtensionContext) => {
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
	let provider = updateAndGetProvider(config.value)

	context.subscriptions.push(
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
				const autoInsertHandler = config.value.autoInsert
				if (autoInsertHandler && autoInsertHandler.enabled && autoInsertHandler.indentionLength > 0) {
					indentionCreate(event, autoInsertHandler.indentionLength, autoInsertHandler.spaceLines)
				}
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
			decoration.updateHandler(config.value)
			status.updateConf(config.value.statusBar)
			const editor = vscode.window.activeTextEditor
			if (editor) {
				decoration.destroyDecorations(editor)
				decoration.triggerUpdateDecorations(editor)
			}
			ViewLoader.style = config.value.preview
			ViewLoader.postMessageToWebview({
				text: editor ? editor.document.getText() : '',
				scrollPos: 0,
				maxLine: editor ? editor.document.lineCount : 0,
				style: ViewLoader.style,
			})
			// 更新updateAndGetProvider(config.value)
			provider.dispose()
			provider = updateAndGetProvider(config.value)
			context.subscriptions.push(provider)
		}),
	)
}
