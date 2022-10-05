import * as vscode from 'vscode'
import * as decoration from './decoration'

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('decorator sample is activated')

	let activeEditor = vscode.window.activeTextEditor

	if (activeEditor) {
		decoration.triggerUpdateDecorations()
	}

	vscode.window.onDidChangeActiveTextEditor(
		(editor) => {
			activeEditor = editor
			if (editor) {
				decoration.triggerUpdateDecorations()
			}
		},
		null,
		context.subscriptions,
	)

	vscode.workspace.onDidChangeTextDocument(
		(event) => {
			if (activeEditor && event.document === activeEditor.document) {
				decoration.triggerUpdateDecorations(true)
			}
		},
		null,
		context.subscriptions,
	)
}
