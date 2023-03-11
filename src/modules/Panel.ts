import { PanelDto, PanelDtoStatus, PanelExtRecDto } from '@/types/webvDto'
import { createWebviewHtml } from '@/utils'
import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import { getRelativePathAndRoot } from '@/utils'
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
  editor: vscode.TextEditor | undefined,
) => contextPush(context, editor)

const contextPush = (
  context: vscode.ExtensionContext,
  editor: vscode.TextEditor | undefined,
) => {
  const provider = vscode.window.registerWebviewViewProvider(
    'noveler-outline',
    {
      async resolveWebviewView(wbvv) {
        wbvv = defineWebviewView(wbvv, context)
        await sendFirstDto(wbvv.webview, editor)
        context.subscriptions.push(createOnDidChangeActiveTextEditor(wbvv))
      },
    },
  )
  context.subscriptions.push(provider)
}

const createOnDidChangeActiveTextEditor = (wbvv: vscode.WebviewView) =>
  vscode.window.onDidChangeActiveTextEditor(async (e) => {
    await sendFirstDto(wbvv.webview, e)
  })

const defineWebviewView = (
  webviewView: vscode.WebviewView,
  context: vscode.ExtensionContext,
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
  webviewView.webview.onDidReceiveMessage(saveFile, null, disposables)
  webviewView.onDidDispose(disposeAll, null, disposables)
  return webviewView
}

const sendFirstDto = async (
  webview: vscode.Webview,
  editor?: vscode.TextEditor,
) => {
  if (!editor) {
    await sendBlankDto(webview, sendDto, PanelDtoStatus.NoEditor)
    return
  }
  const fsPath = editor.document.uri.fsPath
  const relativePathAndRoot = getRelativePathAndRoot(fsPath)
  if (!relativePathAndRoot) {
    await sendBlankDto(webview, sendDto, PanelDtoStatus.NoEditor)
    return
  }
  const { path, root } = relativePathAndRoot
  const { outlinesDir } = confHandler.get()
  if (fsPath.startsWith(`${root}/${outlinesDir}`)) {
    await sendBlankDto(webview, sendDto, PanelDtoStatus.OutlineFile)
    return
  }
  const { content, err } = await readContent(path, root, outlinesDir)
  const status = err ? PanelDtoStatus.NoFile : PanelDtoStatus.Valid
  sendDto(webview, {
    status,
    content,
    path,
    workSpaceRoot: root,
  })
}

const sendDto = (webview: vscode.Webview, dto: PanelDto) =>
  webview.postMessage(dto)

const sendBlankDto = async (
  webview: vscode.Webview,
  sendDto: (webview: vscode.Webview, dto: PanelDto) => Thenable<boolean>,
  status: PanelDtoStatus,
) =>
  await sendDto(webview, {
    status,
    content: '',
    path: '',
    workSpaceRoot: '',
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

const saveFile = async (message: PanelExtRecDto) => {
  const { content, path, workSpaceRoot, status } = message
  if (status === PanelDtoStatus.NoEditor) return
  const { outlinesDir } = confHandler.get()
  const oldir = `${workSpaceRoot}/${outlinesDir}`
  const filePath = `${oldir}/${path}.md`
  const dir = filePath.substring(0, filePath.lastIndexOf('/'))
  if (!(await fs.stat(dir).catch(() => false))) {
    // 递归创建目录
    await fs.mkdir(dir, { recursive: true })
  }
  await fs.writeFile(filePath, content)
}
