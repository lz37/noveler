import { NovelerRouter } from '../types'
import { promises as fs } from 'fs'
import * as vscode from 'vscode'
import * as osPath from 'path'

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

/**
 * @returns 一维数组，数组中的每一项都是一个绝对路径
 */
export const getAbsolutePaths = async (p: string, suffix: string) => {
  const paths: string[] = []
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) return undefined
  if (!osPath.isAbsolute(p)) {
    paths.push(osPath.join(workspaceFolders?.[0].uri.fsPath, p))
  } else {
    paths.push(p)
  }
  const stat = await fs.stat(paths[0])
  if (stat.isDirectory()) {
    // read all suffix in this dir
    const p = paths.pop()
    if (!p) return
    const files = await fs.readdir(p)
    for (let i = 0; i < files.length; i++) {
      const f = osPath.join(p, files[i])
      if (files[i].endsWith(suffix) && (await fs.stat(f)).isFile()) {
        paths.push(f)
      }
    }
  }
  return paths
}

export const getRelativePathAndRoot = (p: string) => {
  const roots = vscode.workspace.workspaceFolders?.map(
    (item) => item.uri.fsPath,
  )
  if (!roots) return undefined
  // 匹配前缀
  for (let i = 0; i < roots.length; i++) {
    if (p.startsWith(roots[i])) {
      return {
        root: roots[i],
        path: osPath.relative(roots[i], p),
      }
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
/**
 *
 * @param dir 绝对路径
 * @param fileType 后缀名不带点
 * @param withFileTypes 是否返回文件类型
 * @returns
 */
export const getFileNameInDir = async (
  dir: string,
  fileType?: string,
  withFileTypes = true,
) =>
  (await fs.readdir(dir, { withFileTypes: true }))
    .map((item) => item.name)
    .filter((item) => {
      if (!fileType) return true
      return item.endsWith(`.${fileType}`)
    })
    .map((item) => {
      if (withFileTypes) return item
      // 删除最后一个
      return item.split('.').slice(0, -1).join('.')
    })
