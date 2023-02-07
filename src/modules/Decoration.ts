import * as vscode from 'vscode'
import { ICustomHighlightConf } from '@/types'
import * as confHandler from '@/modules/ConfigHandler'

const targetFiles = ['plaintext', 'markdown']

export const onChangeEditor = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
  if (!editor) return
  if (!targetFiles.includes(editor.document.languageId)) return
  triggerUpdateDecorations(editor)
})

export const onChangeDocument = vscode.workspace.onDidChangeTextDocument(async (event) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return
  if (!targetFiles.includes(editor.document.languageId)) return
  if (event.document === editor.document) {
    triggerUpdateDecorations(editor, true)
  }
})

export const onChangeConf = vscode.workspace.onDidChangeConfiguration(async (event) => {
  if (!event.affectsConfiguration('noveler')) return
  updateHighlightConf()
  const editor = vscode.window.activeTextEditor
  if (editor) {
    destroyDecorations(editor)
    triggerUpdateDecorations(editor)
  }
})

let timeout: NodeJS.Timer | undefined = undefined

let highlightConf: ICustomHighlightConf = {}
const defaultHighlightConf: ICustomHighlightConf = {
  '\\d+(\\.\\d+)?': {
    color: { id: 'number' },
  },
  '《.*?》': {
    color: { id: 'bookTitleMark' },
  },
  '“.*?”': {
    color: { id: 'quote' },
  },
  '【.*?】': {
    color: { id: 'squareBracket' },
  },
}

export const updateHighlightConf = () => {
  const conf = confHandler.get().customHighlight
  if (conf) {
    const confJson = JSON.stringify(conf)
    const confJsonParsed = <ICustomHighlightConf>JSON.parse(confJson)
    highlightConf = { ...defaultHighlightConf, ...confJsonParsed }
  }
}

const updateDecorations = (activeEditor: vscode.TextEditor) => {
  // key value split
  const highlightConfArray = Object.entries(highlightConf)
  try {
    highlightConfArray.forEach((highlightConf) => {
      const [key, value] = highlightConf
      const reg = new RegExp(key, 'g')
      updateDecoration(reg, vscode.window.createTextEditorDecorationType(value), activeEditor)
    })
  } catch (error) {
    console.error(error)
    vscode.window.showErrorMessage('正则解析错误')
  }
}
const updateDecoration = (
  regEx: RegExp,
  decorationType: vscode.TextEditorDecorationType,
  activeEditor: vscode.TextEditor,
) => {
  const text = activeEditor.document.getText()
  const options: vscode.DecorationOptions[] = []
  let match
  while ((match = regEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index)
    const endPos = activeEditor.document.positionAt(match.index + match[0].length)
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos),
    }
    options.push(decoration)
  }
  activeEditor.setDecorations(decorationType, options)
}

const destroyDecorations = (activeEditor: vscode.TextEditor) => {
  Object.entries(highlightConf).forEach((highlightConf) => {
    activeEditor.setDecorations(vscode.window.createTextEditorDecorationType(highlightConf[1]), [])
  })
}

export const triggerUpdateDecorations = (activeEditor: vscode.TextEditor, throttle = false) => {
  if (!targetFiles.includes(activeEditor.document.languageId)) return
  if (timeout) {
    clearTimeout(timeout)
    timeout = undefined
  }
  if (throttle) {
    timeout = setTimeout(updateDecorations, 500, activeEditor)
  } else {
    updateDecorations(activeEditor)
  }
}
