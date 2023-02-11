import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'

const targetFiles = ['plaintext', 'markdown']

export const onChangeEditor = vscode.window.onDidChangeActiveTextEditor(
  async (editor) => {
    if (!editor) return
    if (!targetFiles.includes(editor.document.languageId)) return
    triggerUpdateDecorations(editor)
  },
)

export const onChangeDocument = vscode.workspace.onDidChangeTextDocument(
  async (event) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    if (!targetFiles.includes(editor.document.languageId)) return
    if (event.document === editor.document) {
      destroyDecorations()
      triggerUpdateDecorations(editor)
    }
  },
)

export const reloadConf = (extConf?: ICustomHighlightConf) => {
  updateHighlightConf()
  const editor = vscode.window.activeTextEditor
  destroyDecorations()
  if (editor) {
    triggerUpdateDecorations(editor, extConf)
  }
}

export const onChangeConf = vscode.workspace.onDidChangeConfiguration(
  async (event) => {
    if (!event.affectsConfiguration('noveler')) return
    reloadConf()
  },
)

const decorationTypes = new Set<vscode.TextEditorDecorationType>()
let highlightConf: ICustomHighlightConf = {}
const defaultHighlightConf: ICustomHighlightConf = {
  '\\d+(\\.\\d+)?': {
    renderOptions: { color: { id: 'number' } },
    hoverMsg: undefined,
  },
  '《.*?》': {
    renderOptions: { color: { id: 'bookTitleMark' } },
    hoverMsg: undefined,
  },
  '“.*?”': {
    renderOptions: { color: { id: 'quote' } },
    hoverMsg: undefined,
  },
  '【.*?】': {
    renderOptions: { color: { id: 'squareBracket' } },
    hoverMsg: undefined,
  },
}

export const updateHighlightConf = () => {
  // deep clone
  highlightConf = JSON.parse(JSON.stringify(defaultHighlightConf))
  const conf = confHandler.get().customHighlight
  if (conf) {
    Object.entries(conf).forEach((entry) => {
      const [key, value] = entry
      highlightConf[key] = {
        renderOptions: value,
      }
    })
  }
}

const updateDecorations = (
  activeEditor: vscode.TextEditor,
  extConf?: ICustomHighlightConf,
) => {
  // key value split
  if (extConf)
    Object.entries(extConf).forEach((ect) => {
      const [key, value] = ect
      highlightConf[key] = value
    })
  const highlightConfArray = Object.entries(highlightConf)
  try {
    highlightConfArray.forEach((highlightConf) => {
      const [key, value] = highlightConf
      const reg = new RegExp(key, 'g')
      const decorationType = vscode.window.createTextEditorDecorationType(
        value.renderOptions,
      )
      decorationTypes.add(decorationType)
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

const destroyDecorations = () => {
  decorationTypes.forEach((decorationType) => {
    decorationType.dispose()
  })
  decorationTypes.clear()
}

export const triggerUpdateDecorations = (
  activeEditor: vscode.TextEditor,
  extConf?: ICustomHighlightConf,
) => {
  if (!targetFiles.includes(activeEditor.document.languageId)) return
  updateDecorations(activeEditor, extConf)
}
