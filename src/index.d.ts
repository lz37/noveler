interface IConfig {
	roles: IRole[],
	autoInsert: AutoInsertHandler,
}
interface IRole {
	name: string
	color: {
		light: string
		dark: string
	}
	description?: string
}
interface AutoInsertHandler{
	enabled: boolean
	indentionLength: number
	spaceLines: number
}

interface DecorationHandler {
	decorationType: import('vscode').TextEditorDecorationType
	regEx: RegExp
	hoverMessage?: import('vscode').MarkdownString | import('vscode').MarkdownString[]
}
