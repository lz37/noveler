type VSCode = {
	postMessage<T>(message: T): void
	getState(): any
	setState(state: any): void
}

declare const vscode: VSCode

declare const startMessage: string

type Dto = import('../../src/types/Dto').default

type IPreview = import('../../src/types/Dto').IPreview

type WebViewConfHandlerEnum = import('../../src/types/Dto').WebViewConfHandlerEnum

type WebViewConfHandler = import('../../src/types/Dto').WebViewConfHandler
