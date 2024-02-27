import * as vscode from 'vscode'
import * as R from 'ramda'
import * as utils from '@common/utils'
import * as commands from '@common/commands'
import * as state from '@common/state'
import * as config from '@ext/config'
import { WebviewStatus, IWebviewDTO, IDTO, ExtCommandToWebview, IPreview } from '@common/types'

const keysofIPreview: (keyof IPreview)[] = ['previewFontSize', 'previewIndentionLength', 'previewSpaceLines']

let panel: PanelHandler | undefined

export const init = (context: vscode.ExtensionContext) => {
  panel = new PanelHandler(utils.createWebviewHtml(context)('/preview'))
  context.subscriptions.push(panelShow, onScroll, onChangeEditor, onChangeConfig, onChangeTheme, onChangeDocument)
}

const panelShow = vscode.commands.registerCommand(commands.Noveler.PANEL_PREVIEW_SHOW, () => {
  panel?.show(vscode.window.activeTextEditor)
})

const onScroll = vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
  const editor = event.textEditor
  if (!state.funcTarget.webviewPreview.includes(editor.document.languageId)) return
  const scrollTop = event.visibleRanges[0].start.line
  panel?.scrollTo(editor.document.lineCount, scrollTop)
})

const onChangeEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (!editor) return
  if (!state.funcTarget.webviewPreview.includes(editor.document.languageId)) return
  panel?.editorChange(editor.document)
})

const onChangeConfig = vscode.workspace.onDidChangeConfiguration((event) => {
  if (
    keysofIPreview
      .map((key) => event.affectsConfiguration(`${state.extPrefix}.${R.identity<keyof IPreview>(key)}`))
      .some(R.identity)
  ) {
    panel?.updateConfig(config.get())
  }
})

const onChangeTheme = vscode.window.onDidChangeActiveColorTheme((colorTheme) => panel?.updateTheme(colorTheme.kind))

const onChangeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
  const document = event.document
  if (!state.funcTarget.webviewPreview.includes(document.languageId)) return
  panel?.editorChange(document)
  const scrollTop = vscode.window.activeTextEditor?.visibleRanges[0].start.line
  scrollTop && panel?.scrollTo(document.lineCount, scrollTop)
})

class PanelHandler {
  private panel: vscode.WebviewPanel | undefined
  private webviewCreator: (webview: vscode.Webview) => string
  constructor(webviewCreator: (webview: vscode.Webview) => string) {
    this.webviewCreator = webviewCreator
  }
  private panelCreator = (editor: vscode.TextEditor) => {
    const panel = vscode.window.createWebviewPanel('NovelerPreview', 'Noveler Preview', vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
    })
    panel.webview.html = this.webviewCreator(panel.webview)
    panel.onDidDispose(() => {
      this.panel = undefined
    })
    panel.webview.onDidReceiveMessage(
      R.cond<[msg: IWebviewDTO], any>([
        [
          (msg) => msg.status === WebviewStatus.PREPARE_DONE,
          () => {
            vscode.window.showTextDocument(editor.document, editor.viewColumn)
            this.postMessage({
              command: ExtCommandToWebview.TO_INIT,
            })
          },
        ],
        [
          (msg) => msg.status === WebviewStatus.TO_INIT_THEME,
          () =>
            this.postMessage({
              command: ExtCommandToWebview.INIT_THEME,
              theme: vscode.ColorThemeKind[vscode.window.activeColorTheme.kind] as keyof typeof vscode.ColorThemeKind,
            }),
        ],
        [
          (msg) => msg.status === WebviewStatus.TO_INIT_CONFIG,
          () =>
            this.postMessage({
              command: ExtCommandToWebview.INIT_CONFIG,
              previewConfig: config.get(),
            }),
        ],
        [
          (msg) => msg.status === WebviewStatus.TO_INIT_TEXT,
          () =>
            this.postMessage({
              text: editor?.document.getText(),
              eol: editor?.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n',
              command: ExtCommandToWebview.INIT_TEXT,
            }),
        ],
        [
          (msg) => msg.status === WebviewStatus.TO_UPDATE_CONFIG,
          (msg) => {
            if (!msg.previewConfig) return
            const roundingConfig = R.mapObjIndexed((value) => Math.round(value * 10) / 10, msg.previewConfig)
            config.set(roundingConfig ?? {}, keysofIPreview)
          },
        ],
      ]),
    )
    this.panel = panel
  }
  private postMessage = (message: Omit<IDTO, 'time' | 'uuid'> & Partial<IDTO>) => {
    const dto = utils.genDTO(message)
    this.panel?.webview.postMessage(dto)
    return dto
  }
  show = (editor?: vscode.TextEditor) => {
    if (this.panel) {
      this.panel.dispose()
    } else if (editor && state.funcTarget.webviewPreview.includes(editor.document.languageId)) {
      this.panelCreator(editor)
    }
  }
  scrollTo(lineCount: number, scrollTop: number) {
    this.postMessage({ command: ExtCommandToWebview.UPDATE_SCROLL, scrollTop, lineCount })
  }
  editorChange(document: vscode.TextDocument) {
    this.postMessage({
      text: document.getText(),
      eol: document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n',
      command: ExtCommandToWebview.UPDATE_TEXT,
    })
  }
  updateConfig(config: IPreview) {
    this.postMessage({
      command: ExtCommandToWebview.UPDATE_CONFIG,
      previewConfig: config,
    })
  }
  updateTheme(colorThemeKind: vscode.ColorThemeKind) {
    this.postMessage({
      command: ExtCommandToWebview.UPDATE_THEME,
      theme: vscode.ColorThemeKind[colorThemeKind] as keyof typeof vscode.ColorThemeKind,
    })
  }
}
