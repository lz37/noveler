import * as vscode from 'vscode'
import decoration from './Decoration'
import config from './Config'
import indentionCreate from './Indention'
import status from './Status'
import { ViewLoader } from './ViewLoader'

// this method is called when vs code is activated
export const activate = (context: vscode.ExtensionContext) => {
	let activeEditor = vscode.window.activeTextEditor

	if (activeEditor) {
		decoration.triggerUpdateDecorations(activeEditor)
	}
	const disposable = vscode.commands.registerCommand('webview.open', () => {
		ViewLoader.showWebview(context)
	})

	context.subscriptions.push(
		disposable,
		status.item,
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			activeEditor = editor
			if (editor) {
				decoration.triggerUpdateDecorations(activeEditor)
			}
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (activeEditor && event.document === activeEditor.document) {
				decoration.triggerUpdateDecorations(activeEditor, true)
				const autoInsertHandler = config.value.autoInsert
				if (autoInsertHandler && autoInsertHandler.enabled && autoInsertHandler.indentionLength > 0) {
					indentionCreate(event, autoInsertHandler.indentionLength, autoInsertHandler.spaceLines)
				}
			}
			// 如果有输入内容
			status.update(event)
		}),
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('noveler')) {
				config.update()
				decoration.destroyDecorations(activeEditor)
				decoration.updateHandler(config.value)
				decoration.triggerUpdateDecorations(activeEditor)
				status.updateConf(config.value.statusBar)
			}
		}),
	)
}
