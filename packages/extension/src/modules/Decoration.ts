import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import {
  ICustomHighlightConfMap,
  IDealedCustomHighlightConfMap,
} from 'common/types'

const targetFiles = ['plaintext', 'markdown']

export const onChangeEditor = vscode.window.onDidChangeActiveTextEditor(
  (editor) => {
    if (!editor) return
    if (!targetFiles.includes(editor.document.languageId)) return
    triggerUpdateDecorations(editor)
  },
)

export const onChangeDocument = vscode.workspace.onDidChangeTextDocument(
  (event) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    if (!targetFiles.includes(editor.document.languageId)) return
    if (event.document === editor.document) {
      triggerUpdateDecorations(editor)
    }
  },
)

export const reloadConf = (extConf?: ICustomHighlightConfMap) => {
  const editor = vscode.window.activeTextEditor
  destroyHovers()
  if (editor) {
    destroyDecorations(editor)
    updateHighlightConf(extConf)
    triggerUpdateDecorations(editor)
  } else {
    updateHighlightConf(extConf)
  }
}

export const onChangeConf = vscode.workspace.onDidChangeConfiguration(
  (event) => {
    if (!event.affectsConfiguration('noveler')) return
    reloadConf()
  },
)

let highlightConf: IDealedCustomHighlightConfMap = {}
const defaultHighlightConf: IDealedCustomHighlightConfMap = {
  '\\d+(\\.\\d+)?': {
    renderOptions: vscode.window.createTextEditorDecorationType({
      color: { id: 'number' },
    }),
  },
  '《.*?》': {
    renderOptions: vscode.window.createTextEditorDecorationType({
      textDecoration: 'underline',
    }),
  },
  '“.*?”': {
    renderOptions: vscode.window.createTextEditorDecorationType({
      fontStyle: 'italic',
      opacity: '0.7',
    }),
  },
  '【.*?】': {
    renderOptions: vscode.window.createTextEditorDecorationType({
      fontWeight: 'bold',
      opacity: '0.7',
    }),
  },
}

export const updateHighlightConf = (extConf?: ICustomHighlightConfMap) => {
  // deep clone
  highlightConf = JSON.parse(JSON.stringify(defaultHighlightConf))
  const conf = confHandler.get().customHighlight
  if (conf) {
    Object.entries(conf).forEach((entry) => {
      const [key, value] = entry
      highlightConf[key] = {
        renderOptions: vscode.window.createTextEditorDecorationType(value),
      }
    })
  }
  if (extConf) {
    Object.entries(extConf).forEach((entry) => {
      const [key, value] = entry
      // 设置显示的优先级
      highlightConf[key] = {
        hoverMsg: value.hoverMsg,
        renderOptions: vscode.window.createTextEditorDecorationType(
          value.renderOptions,
        ),
      }
    })
  }
}

const updateDecorations = (activeEditor: vscode.TextEditor) => {
  try {
    Object.entries(highlightConf).forEach((highlightConf) => {
      const [key, value] = highlightConf
      const reg = new RegExp(key, 'g')
      const decorationType = value.renderOptions
      // sleep
      updateDecoration(reg, decorationType, activeEditor, value.hoverMsg)
    })
  } catch (error) {
    console.error(error)
    vscode.window.showErrorMessage('配置解析错误')
  }
}

const updateDecoration = (
  regEx: RegExp,
  decorationType: vscode.TextEditorDecorationType,
  activeEditor: vscode.TextEditor,
  hoverMessage?: vscode.MarkdownString,
) => {
  const text = activeEditor.document.getText()
  const options: vscode.DecorationOptions[] = []
  let match: RegExpExecArray | null = null
  while ((match = regEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index)
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length,
    )
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage,
    }
    options.push(decoration)
  }
  activeEditor.setDecorations(decorationType, options)
}

const destroyDecorations = (activeEditor: vscode.TextEditor) => {
  Object.values(highlightConf).forEach((value) => {
    // delete hoverMessage
    value.hoverMsg = undefined
    activeEditor.setDecorations(value.renderOptions, [])
  })
}

const destroyHovers = () => {
  Object.values(highlightConf).forEach((value) => {
    // delete hoverMessage
    value.hoverMsg = undefined
  })
}

export const triggerUpdateDecorations = (activeEditor: vscode.TextEditor) => {
  if (!targetFiles.includes(activeEditor.document.languageId)) return
  updateDecorations(activeEditor)
}
