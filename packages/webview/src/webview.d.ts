type VSCode = {
  postMessage<T>(message: T): void
  getState(): any
  setState(state: any): void
}

declare const showScrollbar: boolean
declare const home: import('extension/src/common/types').NovelerRouter
declare const vscode: VSCode
