type VSCode = {
  postMessage<T>(message: T): void
  getState(): any
  setState(state: any): void
}

declare const home: import('noveler/src/types/webvDto').NovelerRouter
declare const vscode: VSCode
