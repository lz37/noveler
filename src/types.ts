export interface IConfig {
	roles?: IRole[]
	autoInsert?: IAutoInsertHandler
	statusBar?: IStatus
	preview?: IPreview
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