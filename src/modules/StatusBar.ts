import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'

const targetFiles = ['plaintext', 'markdown']

const statusItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  11.4514,
)
let inputLength = 0
let isShow = false
let accumulateTime = 0
let timeUnit = 10
let maxTime = 0

const updateItem = (sum: number, dateTime: number, isPause: boolean) => {
  const speed = Math.floor((sum / (dateTime == 0 ? 1 : dateTime)) * 3600)
  statusItem.text = `$(symbol-event) ${speed} $(clock) ${new Date(
    dateTime * 1000,
  )
    .toISOString()
    .substr(11, 8)}`
  statusItem.tooltip = `一共输入了 ${sum} 个字符`
  if (isPause) {
    statusItem.text = `$(symbol-event) ${speed} $(debug-pause) ${new Date(
      dateTime * 1000,
    )
      .toISOString()
      .substr(11, 8)}`
  }
}
const updateConf = () => {
  const { statusShow, statusTimeUnit } = confHandler.get()
  isShow = statusShow
  timeUnit = statusTimeUnit
  if (isShow) {
    statusItem.show()
  } else {
    statusItem.hide()
  }
}

export const init = () => {
  updateItem(0, 0, true)
  updateConf()
  setInterval(() => {
    if (Date.now() < maxTime) {
      updateItem(inputLength, ++accumulateTime, false)
    } else {
      updateItem(inputLength, accumulateTime, true)
    }
  }, 1000)
  return statusItem
}

const update = (event: vscode.TextDocumentChangeEvent) => {
  if (maxTime == 0) {
    maxTime = Date.now()
    return
  }
  maxTime = Date.now() + timeUnit * 1000
  // 获取总计的输入长度，删除掉的部分计算为负数
  inputLength += event.contentChanges
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
  if (inputLength < 0) {
    inputLength = 0
  }
  updateItem(inputLength, accumulateTime, false)
}

export const change = vscode.workspace.onDidChangeTextDocument(
  async (event) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    if (!targetFiles.includes(event.document.languageId)) return
    update(event)
  },
)

export const changeConf = vscode.workspace.onDidChangeConfiguration(
  async (event) => {
    updateConf()
  },
)
