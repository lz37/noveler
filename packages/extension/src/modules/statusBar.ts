import * as vscode from 'vscode'
import * as config from '@ext/config'
import * as defaultConf from '@common/state/defaultConfig'
import * as state from '@common/state'
import * as utils from '@common/utils'
import * as R from 'ramda'
import { IConfig, IStatusBar, StatusItem } from '@common/types'

let handler: NovelerCountBarHandler | undefined = undefined

export const init = (context: vscode.ExtensionContext) => {
  handler = new NovelerCountBarHandler(config.get(), context)
  context.subscriptions.push(changeDocument, changeEditor, changeConf)
}

const changeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
  if (!state.funcTarget.countBar.includes(event.document.languageId)) return
  if (!utils.isNovelDoc(event.document)(config.get())) return
  handler?.update(event)
})

const changeEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (!editor) return
  if (!state.funcTarget.countBar.includes(editor.document.languageId)) return
  if (!utils.isNovelDoc(editor.document)(config.get())) return
  handler?.reset(editor)
})

const changeConf = vscode.workspace.onDidChangeConfiguration((event) => {
  if (
    R.identity<(keyof IStatusBar)[]>(['statusItems', 'statusIncludingSpace', 'statusShow', 'statusTimeUnit'])
      .map((key) => event.affectsConfiguration(`${state.extPrefix}.${key}`))
      .reduce((acc, cur) => acc || cur, false)
  )
    handler?.updateConf(config.get())
})

class NovelerCountBarHandler {
  constructor(cfg: IConfig, context: vscode.ExtensionContext) {
    context.subscriptions.push(this.bar)
    const editor = vscode.window.activeTextEditor
    this.updateConf(cfg)
    this.updateItemText(0, editor ? this.textLengthHandler(editor.document) : 0, 0, true)
    this.updateItemTooltip(0, editor ? this.textLengthHandler(editor.document) : 0)
    setInterval(() => {
      const editor = vscode.window.activeTextEditor
      if (Date.now() < this.maxTime) {
        this.updateItemText(
          this.inputLength,
          editor ? this.textLengthHandler(editor.document) : 0,
          ++this.accumulateTime,
          false,
        )
      } else {
        this.updateItemText(
          this.inputLength,
          editor ? this.textLengthHandler(editor.document) : 0,
          this.accumulateTime,
          true,
        )
      }
    }, 1000)
    if (this.isShow) this.show()
  }
  //#region field
  private bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, state.barsPriority.count)
  private startLength = 0
  private textItems = defaultConf.config.statusItems
  private includingSpace = defaultConf.config.statusIncludingSpace
  private inputLength = 0
  private isShow = defaultConf.config.statusShow
  private accumulateTime = 0
  private timeUnit = defaultConf.config.statusTimeUnit
  private maxTime = 0
  //#endregion
  private textLengthHandler = (doc: vscode.TextDocument) =>
    doc
      .getText()
      .split('')
      .reduce(
        (acc, cur) => (['\r', '\n'].concat(this.includingSpace ? [] : [' ']).includes(cur) ? acc - 1 : acc),
        doc.getText().length,
      )
  private updateItemTooltip = (sum: number, textLength: number) => {
    const tooltip = [`一共输入了 ${sum} 个字符`, `文本总长度 ${textLength} 个字符`]
    this.tooltip = tooltip.join('\n')
  }
  //#region public
  reset = (editor: vscode.TextEditor) => {
    this.startLength = this.textLengthHandler(editor.document)
    this?.updateItemTooltip(this.inputLength, this.startLength)
  }
  update = (event: vscode.TextDocumentChangeEvent) => {
    if (this.maxTime == 0) {
      this.maxTime = Date.now()
      return
    }
    this.maxTime = Date.now() + this.timeUnit * 1000
    // 获取总计的输入长度，删除掉的部分计算为负数
    this.inputLength = this.textLengthHandler(event.document) - this.startLength
    const textLength = this.textLengthHandler(event.document)
    this.updateItemText(this.inputLength, textLength, this.accumulateTime, false)
    this.updateItemTooltip(this.inputLength, textLength)
  }
  updateConf = (cfg: IConfig) => {
    this.textItems = cfg.statusItems
    this.includingSpace = cfg.statusIncludingSpace
    this.isShow = cfg.statusShow
    this.timeUnit = cfg.statusTimeUnit
    const editor = vscode.window.activeTextEditor
    if (editor) this.startLength = this.textLengthHandler(editor.document)
    this[this.isShow ? 'show' : 'hide']()
  }
  updateItemText = (sum: number, textSum: number, dateTime: number, isPause: boolean) => {
    const speed = Math.floor((sum / (dateTime == 0 ? 1 : dateTime)) * 3600)
    // icon: https://code.visualstudio.com/api/references/icons-in-labels
    const map: Record<StatusItem, string> = {
      Speed: `$(symbol-event) ${speed}`,
      Time: `${isPause ? '$(debug-pause)' : '$(clock)'} ${new Date(dateTime * 1000).toISOString().slice(11, 19)}`,
      TextWordCount: `$(book) ${textSum}`,
      InputWordCount: `$(edit) ${sum}`,
    }
    this.text = this.textItems.map((item) => map[item]).join(' ')
  }
  //#endregion
  //#region setter getter
  private show() {
    if (!this.isShow) return
    this.bar.show()
  }
  private hide() {
    this.bar.hide()
  }
  private set text(text: string) {
    this.bar.text = text
  }
  private set tooltip(tooltip: string) {
    this.bar.tooltip = tooltip
  }
  //#endregion
}
