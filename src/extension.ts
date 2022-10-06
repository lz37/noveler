import * as vscode from 'vscode'
import decoration from './Decoration'
import config from './Config'

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
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('noveler')) {
				config.update()
				decoration.destroyDecorations(activeEditor)
				decoration.updateHandler(config.value)
				decoration.triggerUpdateDecorations(activeEditor)
			}
		}),
	)
}
