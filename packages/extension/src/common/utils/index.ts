import { NovelerRouter } from '../types'
import * as fs from 'fs/promises'
import * as vscode from 'vscode'
import * as R from 'ramda'
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
export const isDirOrMkdir = async (p: string) =>
  fs
    .stat(p)
    .then(
      // 判断是否为目录
      (stat) => stat.isDirectory(),
    )
    .catch(async (err) => {
      // 判断是否存在
      console.log(err)
      // 递归创建目录
      await fs.mkdir(p, { recursive: true })
      return true
    })

export const getEOLOfEditor = (editor: vscode.TextEditor) =>
  getEOLOfDoc(editor.document)

export const getEOLOfDoc = (document: vscode.TextDocument) =>
  document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n'

export const getRandomColor = () =>
  '#' + ('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).slice(-6)

/**
 * 在亮色区间随机生成
 * @returns
 */
export const getRandomColorLight = () => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const l = (max + min) / 2
  return R.cond([
    [
      R.lt(0.5),
      R.always(`rgb(${r - diff / 2}, ${g - diff / 2}, ${b - diff / 2})`),
    ],
    [R.T, R.always(`rgb(${r + diff / 2}, ${g + diff / 2}, ${b + diff / 2})`)],
  ])(l)
}

/**
 * 在暗色区间随机生成
 * @returns
 */
export const getRandomColorDark = () => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const l = (max + min) / 2
  return R.cond([
    [R.lt(0.5), R.always(`rgb(${r - diff}, ${g - diff}, ${b - diff})`)],
    [R.T, R.always(`rgb(${r + diff}, ${g + diff}, ${b + diff})`)],
  ])(l)
}

export const isNovelDoc =
  (document: vscode.TextDocument) =>
  /**
   *
   * @param dirsConf 每个value都得是相对路径
   * @returns
   */
  (dirsConf: {
    infoDir: string
    novelDir: string
    outlinesDir: string
    diagnosticDir: string
  }) => {
    // get absolute path of file
    const path = document.uri.path
    // get workspace of file
    const workspace = vscode.workspace.getWorkspaceFolder(document.uri)
    if (!workspace) return false
    // dirsConf 变为绝对路径
    const absoluteDirsConf = R.zipObj(
      R.keys(dirsConf),
      R.map(
        (p) => osPath.join(workspace?.uri.path, String(p)),
        R.values(dirsConf),
      ),
    )
    // 判断是否在配置的目录下
    return (
      path.startsWith(absoluteDirsConf.novelDir) &&
      !path.startsWith(absoluteDirsConf.outlinesDir) &&
      !path.startsWith(absoluteDirsConf.diagnosticDir) &&
      !path.startsWith(absoluteDirsConf.infoDir)
    )
  }
