import * as vscode from 'vscode'
import { IConfig, IDecorationHandler } from './types'

export class Decoration {
  public constructor(config: IConfig) {
    this.updateHandler(config)
  }
  private _handlers: {
    roleHandlers: IDecorationHandler[]
    punctuationHandlers: IDecorationHandler[]
  } = {
    roleHandlers: [],
    punctuationHandlers: [
      {
        decorationType: vscode.window.createTextEditorDecorationType({
          color: { id: 'number' },
        }),
        // 包括小数
        regEx: /\d+(\.\d+)?/g,
      },
      {
        decorationType: vscode.window.createTextEditorDecorationType({
          color: { id: 'bookTitleMark' },
        }),
        regEx: /《.*?》/g,
      },
      {
        decorationType: vscode.window.createTextEditorDecorationType({
          color: { id: 'quote' },
        }),
        regEx: /“.*?”/g,
      },
      {
        decorationType: vscode.window.createTextEditorDecorationType({
          color: { id: 'squareBracket' },
        }),
        regEx: /【.*?】/g,
      },
    ],
  }
  public get handlers() {
    return this._handlers
  }
  private updateDecoration = (handler: IDecorationHandler, activeEditor: vscode.TextEditor | undefined) => {
    if (!activeEditor) {
      return
    }
    const text = activeEditor.document.getText()
    const options: vscode.DecorationOptions[] = []
    let match
    while ((match = handler.regEx.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index)
      const endPos = activeEditor.document.positionAt(match.index + match[0].length)
      const decoration: vscode.DecorationOptions = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: handler.hoverMessage,
      }
      options.push(decoration)
    }
    activeEditor.setDecorations(handler.decorationType, options)
  }
  /**主要的更新函数，Decoration的更新操作在此完成 */
  private updateDecorations = (activeEditor: vscode.TextEditor | undefined) => {
    this.handlers.punctuationHandlers.forEach((handler) => {
      this.updateDecoration(handler, activeEditor)
    })
    this.handlers.roleHandlers.forEach((handler) => {
      this.updateDecoration(handler, activeEditor)
    })
  }

  private destroyDecoration = (handler: IDecorationHandler, activeEditor: vscode.TextEditor | undefined) => {
    activeEditor?.setDecorations(handler.decorationType, [])
  }
  public destroyDecorations = (activeEditor: vscode.TextEditor | undefined) => {
    this.handlers.punctuationHandlers.forEach((handler) => {
      this.destroyDecoration(handler, activeEditor)
    })
    this.handlers.roleHandlers.forEach((handler) => {
      this.destroyDecoration(handler, activeEditor)
    })
  }

  public updateHandler = (config: IConfig) => {
    const newRoleHandlers: IDecorationHandler[] = []
    config.roles?.forEach((role) => {
      newRoleHandlers.push({
        decorationType: vscode.window.createTextEditorDecorationType({
          light: {
            color: role.color.light,
          },
          dark: {
            color: role.color.dark,
          },
        }),
        regEx: new RegExp(role.name, 'g'),
        hoverMessage: new vscode.MarkdownString(role.description),
      })
    })
    this._handlers.roleHandlers = newRoleHandlers
  }

  private timeout: NodeJS.Timer | undefined = undefined

  public triggerUpdateDecorations = (activeEditor: vscode.TextEditor | undefined, throttle = false) => {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = undefined
    }
    if (throttle) {
      this.timeout = setTimeout(this.updateDecorations, 500, activeEditor)
    } else {
      this.updateDecorations(activeEditor)
    }
  }
}
