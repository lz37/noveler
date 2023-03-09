import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { StatusItem } from '@/types/config'

const targetFiles = ['plaintext', 'markdown']

const statusItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  11.4514,
)
let textItems: StatusItem[] = []
let includingSpace = false
let inputLength = 0
let inputLengthIncludingSpace = 0
let isShow = false
let accumulateTime = 0
let timeUnit = 10
let maxTime = 0

const updateItemText = (
  sum: number,
  textSum: number,
  dateTime: number,
  isPause: boolean,
) => {
  const speed = Math.floor((sum / (dateTime == 0 ? 1 : dateTime)) * 3600)
  const map = new Map<StatusItem, string>()
  // icon: https://code.visualstudio.com/api/references/icons-in-labels
  map.set('Speed', `$(symbol-event) ${speed}`)
  map.set(
    'Time',
    `$(clock) ${new Date(dateTime * 1000).toISOString().substr(11, 8)}`,
  )
  map.set('TextWordCount', `$(book) ${textSum}`)
  map.set('InputWordCount', `$(edit) ${sum}`)
  statusItem.text = textItems.map((item) => map.get(item)).join(' ')
  if (isPause) {
    map.set(
      'Time',
      `$(debug-pause) ${new Date(dateTime * 1000).toISOString().substr(11, 8)}`,
    )
    statusItem.text = textItems.map((item) => map.get(item)).join(' ')
  }
}

const updateItemTooltip = (sum: number, textLength: number) => {
  const tooltip = [
    `一共输入了 ${sum} 个字符`,
    `文本总长度 ${textLength} 个字符`,
  ]
  statusItem.tooltip = tooltip.join('\n')
}

const updateConf = () => {
  const { statusShow, statusTimeUnit, statusIncludingSpace, statusItems } =
    confHandler.get()
  isShow = statusShow
  timeUnit = statusTimeUnit
  includingSpace = statusIncludingSpace
  textItems = statusItems
  if (isShow) {
    statusItem.show()
  } else {
    statusItem.hide()
  }
}

export const init = () => {
  const editor = vscode.window.activeTextEditor
  updateConf()
  updateItemText(0, editor ? textLengthHandler(editor.document) : 0, 0, true)
  updateItemTooltip(0, editor ? textLengthHandler(editor.document) : 0)
  setInterval(() => {
    const editor = vscode.window.activeTextEditor
    if (Date.now() < maxTime) {
      updateItemText(
        includingSpace ? inputLengthIncludingSpace : inputLength,
        editor ? textLengthHandler(editor.document) : 0,
        ++accumulateTime,
        false,
      )
    } else {
      updateItemText(
        includingSpace ? inputLengthIncludingSpace : inputLength,
        editor ? textLengthHandler(editor.document) : 0,
        accumulateTime,
        true,
      )
    }
  }, 1000)
  return statusItem
}

const textLengthHandler = (doc: vscode.TextDocument) => {
  let textLength = doc.getText().length
  doc
    .getText()
    .split('')
    .forEach((char) => {
      if (!includingSpace) {
        if (char == ' ' || char == '\r' || char == '\n') textLength -= 1
      } else {
        if (char == '\r' || char == '\n') textLength -= 1
      }
    })
  return textLength
}

const inputHandler = (
  inputLength: number,
  event: vscode.TextDocumentChangeEvent,
  includingSpace: boolean,
) => {
  inputLength += event.contentChanges
    .map((change) => {
      let length = 0
      // 扫描输入内容，去掉空格与回车的权重
      change.text.split('').forEach((char) => {
        if (includingSpace) {
          if (char != '\r' && char != '\n') length += 1
        } else {
          if (char != ' ' && char != '\r' && char != '\n') length += 1
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
  return inputLength
}

const update = (event: vscode.TextDocumentChangeEvent) => {
  if (maxTime == 0) {
    maxTime = Date.now()
    return
  }
  maxTime = Date.now() + timeUnit * 1000
  // 获取总计的输入长度，删除掉的部分计算为负数
  inputLength = inputHandler(inputLength, event, false)
  inputLengthIncludingSpace = inputHandler(
    inputLengthIncludingSpace,
    event,
    true,
  )
  const textLength = textLengthHandler(event.document)
  updateItemText(
    includingSpace ? inputLengthIncludingSpace : inputLength,
    textLength,
    accumulateTime,
    false,
  )
  updateItemTooltip(
    includingSpace ? inputLengthIncludingSpace : inputLength,
    textLength,
  )
}

export const change = vscode.workspace.onDidChangeTextDocument((event) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return
  if (!targetFiles.includes(event.document.languageId)) return
  update(event)
})

export const changeEditor = vscode.window.onDidChangeActiveTextEditor(
  (editor) => {
    if (!editor) return
    if (!targetFiles.includes(editor.document.languageId)) return
    const textLength = textLengthHandler(editor.document)
    updateItemTooltip(
      includingSpace ? inputLengthIncludingSpace : inputLength,
      textLength,
    )
  },
)

export const changeConf = vscode.workspace.onDidChangeConfiguration(() => {
  updateConf()
})
