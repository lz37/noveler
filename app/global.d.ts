type VSCode = {
	postMessage<T>(message: T): void
	getState(): any
	setState(state: any): void
}

declare const vscode: VSCode

declare const startMessage: string

type Dto = import('../src/Dto').default

type IPreview = import('../src/Dto').IPreview

type WebViewConfHandlerEnum = import('../src/Dto').WebViewConfHandlerEnum

type WebViewConfHandler = import('../src/Dto').WebViewConfHandler
