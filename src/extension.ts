import * as vscode from 'vscode'
import decoration from './Decoration'
import config from './Config'
import IndentionCreate from './Indention'

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
				const autoInsertHandler = config.value.autoInsert
				if (autoInsertHandler && autoInsertHandler.enabled && autoInsertHandler.indentionLength > 0) {
					IndentionCreate(event, autoInsertHandler.indentionLength, autoInsertHandler.spaceLines)
				}
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
