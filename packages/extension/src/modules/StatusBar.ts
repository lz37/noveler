import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { StatusItem } from 'common/types'
import { initing } from '@/extension'

const targetFiles = ['plaintext', 'markdown']

const statusItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  11.4514,
)
let startLength = 0
let textItems: StatusItem[] = []
let includingSpace = false
let wordReset = false
let inputLength = 0
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
  const {
    statusShow,
    statusTimeUnit,
    statusIncludingSpace,
    statusItems,
    statusWordReset,
  } = confHandler.get()
  isShow = statusShow
  timeUnit = statusTimeUnit
  includingSpace = statusIncludingSpace
  wordReset = statusWordReset
  textItems = statusItems
  if (vscode.window.activeTextEditor) {
    startLength = textLengthHandler(vscode.window.activeTextEditor.document)
  }
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
        inputLength,
        editor ? textLengthHandler(editor.document) : 0,
        ++accumulateTime,
        false,
      )
    } else {
      updateItemText(
        inputLength,
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

const update = (event: vscode.TextDocumentChangeEvent) => {
  if (maxTime == 0) {
    maxTime = Date.now()
    return
  }
  maxTime = Date.now() + timeUnit * 1000
  // 获取总计的输入长度，删除掉的部分计算为负数
  inputLength = textLengthHandler(event.document) - startLength
  const textLength = textLengthHandler(event.document)
  updateItemText(inputLength, textLength, accumulateTime, false)
  updateItemTooltip(inputLength, textLength)
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
    startLength = textLengthHandler(editor.document)

    if (!wordReset) {
      // 是否开启重置切换文件重置字数
      startLength -= inputLength // 如果不重置那么开始位置就要减去上次输入的字数
    }
    updateItemTooltip(inputLength, startLength)
  },
)

export const changeConf = vscode.workspace.onDidChangeConfiguration((event) => {
  if (initing) return
  if (!event.affectsConfiguration('noveler')) return
  updateConf()
})
