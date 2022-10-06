interface IConfig {
	roles: IRole[]
}
interface IRole {
	name: string
	color: {
		light: string
		dark: string
	}
	description?: string
}

interface DecorationHandler {
	decorationType: import('vscode').TextEditorDecorationType
	regEx: RegExp
	hoverMessage?: import('vscode').MarkdownString | import('vscode').MarkdownString[]
}
