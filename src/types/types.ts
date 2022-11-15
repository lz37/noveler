import * as vscode from 'vscode'
export interface IConfig {
	roles?: IRole[]
	autoInsert?: IAutoInsertHandler
	statusBar?: IStatus
	preview?: IPreview
	completions?: ICompletion[]
}

export interface IRole {
	name: string
	color: {
		light: string
		dark: string
	}
	description?: string
}

export interface IAutoInsertHandler {
	enabled: boolean
	indentionLength: number
	spaceLines: number
}

export interface IStatus {
	enabled: boolean
	timeUnit: number
}
export interface ICompletion {
	title: string
	context: string
	kind: keyof typeof vscode.CompletionItemKind
}
