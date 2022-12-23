import * as vscode from 'vscode'
import * as conf from './Config'
import defaultConf from './DefaultConf'
import { IStatus } from './types'

export class Status {
  constructor(statusConf = defaultConf.statusBar) {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 11.4514)
    this.updateItem(0, 0, true)
    this.maxTime = 0
    this.accumulateTime = 0
    this.inputLength = 0
    statusConf && this.updateConf(statusConf)
    setInterval(() => {
      if (Date.now() < this.maxTime) {
        this.updateItem(this.inputLength, ++this.accumulateTime, false)
      } else {
        this.updateItem(this.inputLength, this.accumulateTime, true)
      }
    }, 1000)
  }
  public readonly item: vscode.StatusBarItem
  private enabled = defaultConf.statusBar!.enabled
  private timeUnit = defaultConf.statusBar!.timeUnit
  public updateConf = (conf: IStatus | undefined) => {
    this.enabled = conf == undefined ? defaultConf.statusBar!.enabled : conf.enabled
    this.timeUnit = conf == undefined ? defaultConf.statusBar!.timeUnit : conf.timeUnit
    if (this.enabled) {
      this.item.show()
    } else {
      this.item.hide()
    }
  }
  private maxTime: number
  private accumulateTime: number
  private inputLength: number
  private updateItem = (sum: number, dateTime: number, isPause: boolean) => {
    const speed = Math.floor((sum / (dateTime == 0 ? 1 : dateTime)) * 3600)
    this.item.text = `$(symbol-event) ${speed} $(clock) ${new Date(dateTime * 1000).toISOString().substr(11, 8)}`
    this.item.tooltip = `一共输入了 ${sum} 个字符`
    if (isPause) {
      this.item.text = `$(symbol-event) ${speed} $(debug-pause) ${new Date(dateTime * 1000)
        .toISOString()
        .substr(11, 8)}`
    }
  }
  public update = (event: vscode.TextDocumentChangeEvent) => {
    if (this.maxTime == 0) {
      this.maxTime = Date.now()
      return
    }
    this.maxTime = Date.now() + this.timeUnit * 1000
    // 获取总计的输入长度，删除掉的部分计算为负数
    this.inputLength += event.contentChanges
      .map((change) => {
        let length = 0
        // 扫描输入内容，去掉空格与回车的权重
        change.text.split('').forEach((char) => {
          if (char != ' ' && char != '\r' && char != '\n') {
            length += 1
          }
        })
        return length - change.rangeLength
      })
      .reduce((a, b) => {
        return a + b
      }, 0)
    if (this.inputLength < 0) {
      this.inputLength = 0
    }
    this.updateItem(this.inputLength, this.accumulateTime, false)
  }
}
