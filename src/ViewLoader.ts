import * as vscode from 'vscode'
import * as path from 'path'

export class ViewLoader {
	public static currentPanel?: vscode.WebviewPanel

	private panel: vscode.WebviewPanel
	private context: vscode.ExtensionContext
	private disposables: vscode.Disposable[]
	/**作为队列 */
	private static signals: Array<boolean> = []
	public static popSignal = async () => {
		while (this.signals.length === 0) {
			await new Promise((resolve) => setTimeout(resolve, 100))
		}
		return this.signals.shift()
	}

	constructor(context: vscode.ExtensionContext) {
		this.context = context
		this.disposables = []

		this.panel = vscode.window.createWebviewPanel('reactApp', 'React App', vscode.ViewColumn.Two, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'app'))],
		})

		// render webview
		this.renderWebview()

		// listen messages from webview
		this.panel.webview.onDidReceiveMessage(
			(message: boolean) => {
				ViewLoader.signals.push(message)
			},
			null,
			this.disposables,
		)

		this.panel.onDidDispose(
			() => {
				this.dispose()
			},
			null,
			this.disposables,
		)
	}

	private renderWebview() {
		const html = this.render()
		this.panel.webview.html = html
	}

	static showWebview(context: vscode.ExtensionContext) {
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined
		if (this.currentPanel) {
			this.currentPanel.reveal(column)
		} else {
			this.currentPanel = new this(context).panel
		}
	}

	static postMessageToWebview(message: any) {
		// post message from extension to webview
		this.currentPanel?.webview.postMessage(message)
	}

	public dispose() {
		ViewLoader.currentPanel = undefined

		// Clean up our resources
		this.panel.dispose()

		while (this.disposables.length) {
			const x = this.disposables.pop()
			if (x) {
				x.dispose()
			}
		}
	}

	render() {
		const bundleScriptPath = this.panel.webview.asWebviewUri(
			vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'app', 'bundle.js')),
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
}
