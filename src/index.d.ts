interface IConfig {
	roles: IRole[]
	autoInsert: IAutoInsertHandler
	statusBar: IStatus
}
interface IRole {
	name: string
	color: {
		light: string
		dark: string
	}
	description?: string
}
interface IAutoInsertHandler {
	enabled: boolean
	indentionLength: number
	spaceLines: number
}

interface IStatus {
	enabled: boolean
	timeUnit: number
}

interface IDecorationHandler {
	decorationType: import('vscode').TextEditorDecorationType
	regEx: RegExp
	hoverMessage?: import('vscode').MarkdownString | import('vscode').MarkdownString[]
}
