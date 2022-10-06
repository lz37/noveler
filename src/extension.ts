import * as vscode from 'vscode'
import decoration from './decoration'
import config from './config'

// this method is called when vs code is activated
export const activate = (context: vscode.ExtensionContext) => {
	let activeEditor = vscode.window.activeTextEditor

	if (activeEditor) {
		decoration.triggerUpdateDecorations(activeEditor)
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			activeEditor = editor
			if (editor) {
				decoration.triggerUpdateDecorations(activeEditor)
			}
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (activeEditor && event.document === activeEditor.document) {
				decoration.triggerUpdateDecorations(activeEditor, true)
			}
		}),
	)
}
