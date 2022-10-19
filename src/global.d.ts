type IConfig=import("./types").IConfig

type IRole=import("./types").IRole

type IAutoInsertHandler=import("./types").IAutoInsertHandler

type IStatus=import("./types").IStatus

type IPreview=import('./dto').IPreview

interface IDecorationHandler {
	decorationType: import('vscode').TextEditorDecorationType
	regEx: RegExp
	hoverMessage?: import('vscode').MarkdownString | import('vscode').MarkdownString[]
}

type Dto = import('./dto').default
