import { NovelerRouter } from '../types'
import * as fs from 'fs/promises'
import * as vscode from 'vscode'
import * as R from 'ramda'
import * as osPath from 'path'
import * as md5 from 'ts-md5'
import chroma from 'chroma-js'

const getStrLength = (str: string) => {
  // eslint-disable-next-line no-control-regex
  const cArr = str.match(/[^\x00-\xff]/gi)
  return str.length + (cArr == null ? 0 : cArr.length)
}

export const splitStr = (sChars: string) => {
  let str = ''
  for (let i = 0; i < sChars.length; i++) {
    const schar = sChars.charAt(i)
    if (typeof schar == 'undefined' || typeof sChars.charAt(i + 1) == 'undefined') break
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
  const bundleScriptPath = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'dist', 'app', 'bundle.js'))
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
export const getFileNameInDir = async (dir: string, fileType?: string, withFileTypes = true) =>
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

export const getEOLOfEditor = (editor: vscode.TextEditor) => getEOLOfDoc(editor.document)

export const getEOLOfDoc = (document: vscode.TextDocument) => (document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n')

export const getRandomColor = (str?: string) => {
  const onceHash = R.once(() => md5.Md5.hashStr(str || ''))
  return R.ifElse(
    (str) => !str,
    R.always(chroma.random()),
    () =>
      R.partial(
        chroma,
        R.range(0)(3)
          .map(onceHash)
          .map((x, i) => x.slice((i * 32) / 3, ((i + 1) * 32) / 3))
          .map((x) => parseInt(x, 16))
          .map(Math.abs)
          .map((x) => x % 256)
          .map(Math.floor),
      )(),
  )(str)
}

/**
 * 在亮色区间随机生成
 * @returns
 */
export const getRandomColorLight = (str?: string) => {
  const onceChroma = R.once(() => getRandomColor(str))
  return R.cond([
    [R.lte(0.5), R.always(onceChroma().hex())],
    [
      R.T,
      () =>
        (function fn(color: chroma.Color, i: number): chroma.Color {
          return R.ifElse(
            (i: number) => i > 3,
            () => color,
            () =>
              R.ifElse(
                (c: chroma.Color) => c.luminance() > 0.5,
                (c) => c,
                (c) => fn(c, i + 1),
              )(color.brighten()),
          )(i)
        })(onceChroma(), 0).hex(),
    ],
  ])(onceChroma().luminance())
}

/**
 * 在暗色区间随机生成
 * @returns
 */
export const getRandomColorDark = (str?: string) => {
  const onceChroma = R.once(() => getRandomColor(str))
  return R.cond([
    [R.gte(0.5), R.always(onceChroma().hex())],
    [
      R.T,
      () =>
        (function fn(color: chroma.Color, i: number): chroma.Color {
          return R.ifElse(
            (i: number) => i > 3,
            () => color,
            () =>
              R.ifElse(
                (c: chroma.Color) => c.luminance() > 0.5,
                (c) => c,
                (c) => fn(c, i + 1),
              )(color.darken()),
          )(i)
        })(onceChroma(), 0).hex(),
    ],
  ])(onceChroma().luminance())
}

export const isNovelDoc =
  (document: vscode.TextDocument) =>
  /**
   *
   * @param dirsConf 每个value都得是相对路径
   * @returns
   */
  (dirsConf: { infoDir: string; novelDir: string; outlinesDir: string; diagnosticDir: string }) => {
    // get absolute path of file
    const path = document.uri.path
    // get workspace of file
    const workspace = vscode.workspace.getWorkspaceFolder(document.uri)
    if (!workspace) return false
    // dirsConf 变为绝对路径
    const absoluteDirsConf = R.zipObj(
      R.keys(dirsConf),
      R.map((p) => osPath.join(workspace?.uri.path, String(p)), R.values(dirsConf)),
    )
    // 判断是否在配置的目录下
    return (
      path.startsWith(absoluteDirsConf.novelDir) &&
      !path.startsWith(absoluteDirsConf.outlinesDir) &&
      !path.startsWith(absoluteDirsConf.diagnosticDir) &&
      !path.startsWith(absoluteDirsConf.infoDir)
    )
  }
