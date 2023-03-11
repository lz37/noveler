import { NovelerRouter } from '@/types/webvDto'
import { promises as fs } from 'fs'
import * as vscode from 'vscode'

const getStrLength = (str: string) => {
  // eslint-disable-next-line no-control-regex
  const cArr = str.match(/[^\x00-\xff]/gi)
  return str.length + (cArr == null ? 0 : cArr.length)
}

export const splitStr = (sChars: string) => {
  let str = ''
  for (let i = 0; i < sChars.length; i++) {
    const schar = sChars.charAt(i)
    if (
      typeof schar == 'undefined' ||
      typeof sChars.charAt(i + 1) == 'undefined'
    )
      break
    str += schar
    if (getStrLength(schar) != getStrLength(sChars.charAt(i + 1))) {
      str += ' '
    }
  }
  return str.substring(0, str.length - 1)
}

export const isAbsolutePath = (path: string) => {
  return (
    path.startsWith('/') || path.startsWith('\\') || /^[a-zA-Z]:/.test(path)
  )
}

/**
 * @returns 一维数组，数组中的每一项都是一个绝对路径
 */
export const getAbsolutePaths = async (path: string, suffix: string) => {
  const paths: string[] = []
  if (!isAbsolutePath(path)) {
    paths.push(`${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/${path}`)
  } else {
    paths.push(path)
  }
  const stat = await fs.stat(paths[0])
  if (stat.isDirectory()) {
    // read all suffix in this dir
    const p = paths.pop()
    if (!p) return
    const files = await fs.readdir(p)
    for (let i = 0; i < files.length; i++) {
      const f = `${p}/${files[i]}`
      if (files[i].endsWith(suffix) && (await fs.stat(f)).isFile()) {
        paths.push(f)
      }
    }
  }
  return paths
}

export const getRelativePathAndRoot = (path: string) => {
  const roots = vscode.workspace.workspaceFolders?.map(
    (item) => item.uri.fsPath,
  )
  if (!roots) return undefined
  // 匹配前缀
  for (let i = 0; i < roots.length; i++) {
    if (path.startsWith(roots[i])) {
      return { root: roots[i], path: path.replace(`${roots[i]}/`, '') }
    }
  }
}

export const createWebviewHtml = (
  router: NovelerRouter,
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  showScrollbar = false,
) => {
  const bundleScriptPath = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'out', 'app', 'bundle.js'),
  )
  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>React App</title>
    </head>
    <body>
      <div id="root"></div>
      <script>
        const vscode = acquireVsCodeApi();
        const home = '${router}'
        const showScrollbar = ${showScrollbar}
      </script>
      <script src="${bundleScriptPath}"></script>
    </body>
  </html>
`
}
