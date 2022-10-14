interface IConfig {
	roles?: IRole[]
	autoInsert?: IAutoInsertHandler
	statusBar?: IStatus
	preview?: IPreview
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

type IPreview=import('./dto').IPreview

interface IDecorationHandler {
	decorationType: import('vscode').TextEditorDecorationType
	regEx: RegExp
	hoverMessage?: import('vscode').MarkdownString | import('vscode').MarkdownString[]
}

type Dto = import('./dto').default
