import { NovelerRouter } from '../types'
import * as fs from 'fs/promises'
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

export const createWebviewHtml = (
  router: NovelerRouter,
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  showScrollbar = false,
) => {
  const bundleScriptPath = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'app', 'bundle.js'),
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

/**
 *
 * @param p 绝对路径
 * @returns true: 是目录或新建目录，false: 不是目录
 */
export const isDirOrMkdir = async (p: string) => {
  try {
    const stat = await fs.stat(p)
    // 判断是否为目录
    return stat.isDirectory()
  } catch (error) {
    // 判断是否存在
    console.error(error)
    // 递归创建目录
    await fs.mkdir(p, { recursive: true })
    return true
  }
}

export const getEOLOfEditor = (editor: vscode.TextEditor) =>
  editor.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n'
