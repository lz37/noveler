import { PanelDto, PanelDtoStatus, PanelExtRecDto, Theme } from 'common/types'
import { createWebviewHtml, getRelativePathAndRoot } from 'common/utils'
import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { promises as fs } from 'fs'

const disposables: vscode.Disposable[] = []
const disposeAll = () => {
  while (disposables?.length) {
    const x = disposables.pop()
    if (x) x.dispose()
  }
}

export const init = (
  context: vscode.ExtensionContext,
  platForm: NodeJS.Platform,
  editor?: vscode.TextEditor,
) => {
  const provider = vscode.window.registerWebviewViewProvider(
    'noveler-outline',
    {
      resolveWebviewView(wbvv) {
        wbvv = defineWebviewView(wbvv, context, platForm, editor)
        context.subscriptions.push(
          createOnDidChangeActiveTextEditor(wbvv, platForm),
        )
        context.subscriptions.push(
          createOnDidChangeActiveColorTheme(wbvv, platForm, editor),
        )
      },
    },
  )
  context.subscriptions.push(provider)
}

const createOnDidChangeActiveColorTheme = (
  wbvv: vscode.WebviewView,
  platForm: NodeJS.Platform,
  editor?: vscode.TextEditor,
) =>
  vscode.window.onDidChangeActiveColorTheme(() => {
    sendFirstDto(wbvv.webview, platForm, editor)
  })

const colorThemeKind2Theme = (kind: vscode.ColorThemeKind) => {
  let theme: Theme
  switch (kind) {
    case vscode.ColorThemeKind.Dark:
    case vscode.ColorThemeKind.HighContrast:
      theme = 'dark'
      break
    default:
      theme = 'light'
      break
  }
  return theme
}

const createOnDidChangeActiveTextEditor = (
  wbvv: vscode.WebviewView,
  platForm: NodeJS.Platform,
) =>
  vscode.window.onDidChangeActiveTextEditor(async (e) => {
    await sendFirstDto(wbvv.webview, platForm, e)
  })

const defineWebviewView = (
  webviewView: vscode.WebviewView,
  context: vscode.ExtensionContext,
  platForm: NodeJS.Platform,
  editor?: vscode.TextEditor,
) => {
  webviewView.webview.options = {
    enableScripts: true,
  }
  webviewView.webview.html = createWebviewHtml(
    '/panel',
    webviewView.webview,
    context,
    true,
  )
  webviewView.webview.onDidReceiveMessage(
    receiveMsg(webviewView.webview, platForm, editor),
    null,
    disposables,
  )
  webviewView.onDidDispose(disposeAll, null, disposables)
  return webviewView
}

const sendFirstDto = async (
  webview: vscode.Webview,
  platForm: NodeJS.Platform,
  editor?: vscode.TextEditor,
) => {
  if (!editor) {
    await sendBlankDto(webview, sendDto, PanelDtoStatus.NoEditor)
    return
  }
  const themeKind = colorThemeKind2Theme(vscode.window.activeColorTheme.kind)
  const fsPath = editor.document.uri.fsPath
  const relativePathAndRoot = getRelativePathAndRoot(fsPath, platForm)
  if (!relativePathAndRoot) {
    await sendBlankDto(webview, sendDto, PanelDtoStatus.NoEditor, themeKind)
    return
  }
  const { path, root } = relativePathAndRoot
  const { outlinesDir } = confHandler.get()
  if (
    fsPath.startsWith(`${root}/${outlinesDir}`) ||
    fsPath.startsWith(`${root}\\${outlinesDir}`)
  ) {
    await sendBlankDto(webview, sendDto, PanelDtoStatus.OutlineFile, themeKind)
    return
  }
  const { content, err } = await readContent(path, root, outlinesDir)
  const status = err ? PanelDtoStatus.NoFile : PanelDtoStatus.Valid
  sendDto(webview, {
    status,
    content,
    path,
    workSpaceRoot: root,
    themeKind,
  })
}

const sendDto = (webview: vscode.Webview, dto: PanelDto) => {
  return webview.postMessage(dto)
}

const sendBlankDto = async (
  webview: vscode.Webview,
  sendDto: (webview: vscode.Webview, dto: PanelDto) => Thenable<boolean>,
  status: PanelDtoStatus,
  themeKind?: Theme,
) =>
  await sendDto(webview, {
    status,
    content: '',
    path: '',
    workSpaceRoot: '',
    themeKind,
  })

const readContent = async (path: string, root: string, outlinesDir: string) => {
  const dir = `${root}/${outlinesDir}`
  let err: Error | undefined = undefined
  const content = await fs.readFile(`${dir}/${path}.md`, 'utf-8').catch(() => {
    err = new Error('No outline file')
    return ''
  })
  return { content, err }
}

const receiveMsg = (
  webview: vscode.Webview,
  platForm: NodeJS.Platform,
  editor?: vscode.TextEditor,
) => {
  return async (message: PanelExtRecDto) => {
    if (message.needLoad) {
      await sendFirstDto(webview, platForm, editor)
    } else {
      await saveFile(message, platForm)
    }
  }
}

const saveFile = async (message: PanelExtRecDto, platForm: NodeJS.Platform) => {
  const split = platForm === 'win32' ? '\\' : '/'
  const { content, path, workSpaceRoot, status } = message
  if (status === PanelDtoStatus.NoEditor) return
  const { outlinesDir } = confHandler.get()
  const oldir = `${workSpaceRoot}${split}${outlinesDir}`
  const filePath = `${oldir}${split}${path}.md`
  const dir = filePath.substring(0, filePath.lastIndexOf(split))
  if (!(await fs.stat(dir).catch(() => false))) {
    // 递归创建目录
    await fs.mkdir(dir, { recursive: true })
  }
  await fs.writeFile(filePath, content)
}
