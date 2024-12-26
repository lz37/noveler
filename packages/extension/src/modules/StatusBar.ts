import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { StatusItem } from 'common/types'
import { initing } from '@/extension'
import { appendToCSV } from '@/modules/Record'
const targetFiles = ['plaintext', 'markdown']

const statusItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  11.4514,
)
// let startLength = 0
let textItems: StatusItem[] = []
let includingSpace = false
let wordReset = false
let isShow = false
let accumulateTime = 0
let timeUnit = 10
let maxTime = 0

let recordInputCount = 0 // 上次记录的输入长度 用于记录码字字数
let recordLastTime = 0 // 上次记录的事件,用于记录码字字数

let inputLength = 0 // 记录已输入所有文本的长度
const inputLengthMap: Map<string, number> = new Map() // 记录每个文档输入的长度 待定
const lastLengthMap: Map<string, number> = new Map() // 记录上次的文档长度

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
    const doc = vscode.window.activeTextEditor.document
    lastLengthMap.set(doc.fileName, textLengthHandler(doc))
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
  setInterval(async () => {
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
    if (Date.now() - recordLastTime > 60 * 1000) {
      // 限制记录次数,每x毫秒记录一次
      recordLastTime = Date.now()
      await appendToCSV(inputLength - recordInputCount)
      recordInputCount = inputLength
    }
  }, 1000)

  return statusItem
}

const textLengthHandler = (doc: vscode.TextDocument) => {
  const text = doc.getText()
  let cleanedText
  if (!includingSpace) {
    cleanedText = text.replace(/\s/g, '')
  } else {
    cleanedText = text.replace(/[\r\n]/g, '')
  }

  return cleanedText.length
  // doc.getText().replace(/\s/,"")
  // doc
  //   .getText()
  //   .split('')
  //   .forEach((char) => {
  //     if (!includingSpace) {
  //       if (char == ' ' || char == '\r' || char == '\n') textLength -= 1
  //     } else {
  //       if (char == '\r' || char == '\n') textLength -= 1
  //     }
  //   })
  // return textLength
}

const update = (event: vscode.TextDocumentChangeEvent) => {
  if (maxTime == 0) {
    maxTime = Date.now()
    return
  }
  maxTime = Date.now() + timeUnit * 1000
  // 获取总计的输入长度，删除掉的部分计算为负数
  const textLength = textLengthHandler(event.document)
  inputLength +=
    textLength - (lastLengthMap.get(event.document.fileName) || textLength)
  lastLengthMap.set(event.document.fileName, textLength)

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
    const currentDocLength = textLengthHandler(editor.document)

    // 如果切换文档,并且上次没有记录长度,则记录一下
    if (!lastLengthMap.has(editor.document.fileName)) {
      lastLengthMap.set(editor.document.fileName, currentDocLength)
    }
    if (wordReset) {
      // 是否开启重置切换文件重置字数
      inputLength = 0
    }
    updateItemTooltip(inputLength, currentDocLength)
  },
)

export const changeConf = vscode.workspace.onDidChangeConfiguration((event) => {
  if (initing) return
  if (!event.affectsConfiguration('noveler')) return
  console.log('触发changeConf')

  updateConf()
})
