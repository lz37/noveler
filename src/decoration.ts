import * as vscode from 'vscode'

const activeEditor = vscode.window.activeTextEditor
const updateDecoration = (handler: DecorationHandler) => {
	if (!activeEditor) {
		return
	}
	const text = activeEditor.document.getText()
	const options: vscode.DecorationOptions[] = []
	let match
	while ((match = handler.regEx.exec(text))) {
		const startPos = activeEditor.document.positionAt(match.index)
		const endPos = activeEditor.document.positionAt(match.index + match[0].length)
		const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: handler.hoverMessage }
		options.push(decoration)
	}
	activeEditor.setDecorations(handler.decorationType, options)
}

const quoteHandler: DecorationHandler = {
	decorationType: vscode.window.createTextEditorDecorationType({
		color: 'green',
		light: {
			color: 'darkgreen',
		},
		dark: {
			color: 'lightgreen',
		},
	}),
	regEx: /".*?"|“.*?”/g,
}

const bookTitleMarkHandler: DecorationHandler = {
	decorationType: vscode.window.createTextEditorDecorationType({
		color: 'red',
		light: {
			color: 'darkred',
		},
		dark: {
			color: 'lightred',
		},
	}),
	regEx: /《.*?》/g,
}
/**
 * 包括小数
 */
const numberHandler: DecorationHandler = {
	decorationType: vscode.window.createTextEditorDecorationType({
		color: 'yellow',
		light: {
			color: 'darkyellow',
		},
		dark: {
			color: 'lightyellow',
		},
	}),
	regEx: /\d+(\.\d+)?/g,
}

/**主要的更新函数，Decoration的更新操作在此完成 */
function updateDecorations() {
	updateDecoration(numberHandler)
	updateDecoration(bookTitleMarkHandler)
	updateDecoration(quoteHandler)
}

let timeout: NodeJS.Timer | undefined = undefined

export function triggerUpdateDecorations(throttle = false) {
	if (timeout) {
		clearTimeout(timeout)
		timeout = undefined
	}
	if (throttle) {
		timeout = setTimeout(updateDecorations, 500)
	} else {
		updateDecorations()
	}
}
