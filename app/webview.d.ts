type VSCode = {
  postMessage<T>(message: T): void
  getState(): any
  setState(state: any): void
}

declare const vscode: VSCode
