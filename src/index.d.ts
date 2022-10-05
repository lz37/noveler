interface IConfig {
	roles: IRole[]
}
interface IRole {
	name: string
}
declare const ProjectName = 'noveler'

interface DecorationHandler {
	decorationType: import('vscode').TextEditorDecorationType
	regEx: RegExp
	hoverMessage?: string
}
