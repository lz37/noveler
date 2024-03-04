import { IDirs, NovelerRouter } from '@common/types'
import * as fs from 'fs/promises'
import * as vscode from 'vscode'
import * as R from 'ramda'
import * as osPath from 'path'
import * as md5 from 'ts-md5'
import chroma from 'chroma-js'

export * from './webview'

const getStrLength = (str: string) =>
  R.pipe(
    // eslint-disable-next-line no-control-regex
    () => str.match(/[^\x00-\xff]/gi),
    (cArr) => str.length + (cArr == null ? 0 : cArr.length),
  )()

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

export const createWebviewHtml =
  (context: vscode.ExtensionContext) =>
  (router: NovelerRouter, showScrollbar = false) =>
  (webview: vscode.Webview) =>
    `
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
          const vscodeApi = acquireVsCodeApi();
          const home = '${router}';
          const showScrollbar = ${showScrollbar};
        </script>
        <script src="${webview.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, 'dist', 'app', 'bundle.js'),
        )}"></script>
      </body>
    </html>
  `
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s)
      .join('')

/**
 *
 * @param dir 绝对路径
 * @param fileType 后缀名不带点
 * @param withFileTypes 是否返回文件类型
 * @returns
 */
export const getFileNameInDir = (dir: string, fileType?: string, withFileTypes = true) =>
  fs.readdir(dir, { withFileTypes: true }).then((files) =>
    files
      .map((item) => item.name)
      .filter((item) => {
        if (!fileType) return true
        return item.endsWith(`.${fileType}`)
      })
      .map((item) => {
        if (withFileTypes) return item
        // 删除最后一个
        return item.split('.').slice(0, -1).join('.')
      }),
  )

/**
 *
 * @param p 绝对路径
 * @returns true: 是目录或新建目录，false: 不是目录
 */
export const isDirOrMkdir = (p: string) =>
  fs
    .stat(p)
    .then(
      // 判断是否为目录
      (stat) => stat.isDirectory(),
    )
    .catch(R.pipe(console.log, () => fs.mkdir(p, { recursive: true }).then(R.T)))

export const getEOLOfEditor = (editor: vscode.TextEditor) => getEOLOfDoc(editor.document)

export const getEOLOfDoc = (document: vscode.TextDocument) => (document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n')

const getRandomColor = (str?: string) =>
  R.pipe(
    () => R.once(() => md5.Md5.hashStr(str || '')),
    (onceHash) =>
      R.ifElse(
        (str) => !str,
        R.always(chroma.random()),
        () =>
          R.partial(
            chroma,
            R.range(0)(3)
              // 调用三次 后面两次取缓存
              .map(onceHash)
              .map((x, i) => x.slice((i * 32) / 3, ((i + 1) * 32) / 3))
              .map((x) => parseInt(x, 16))
              .map(Math.abs)
              .map((x) => x % 256)
              .map(Math.floor),
          )(),
      )(str),
  )()

const getRandomColorWrapper = (compare: (l: number) => boolean, action: 'brighten' | 'darken', str?: string) =>
  R.pipe(
    () => R.once(() => getRandomColor(str)),
    (onceChroma) =>
      (function fn(color: chroma.Color, i: number): chroma.Color {
        return R.ifElse(
          () => i > 3,
          () => color,
          () =>
            R.ifElse(
              (c: chroma.Color) => compare(c.luminance()),
              (c) => c,
              (c) => fn(c, i + 1),
            )(color[action]()),
        )()
      })(onceChroma(), 0).hex(),
  )()

/**
 * 在亮色区间随机生成
 * @returns
 */
export const getRandomColorLight = (str?: string) => getRandomColorWrapper(R.lte(0.5), 'brighten', str)

/**
 * 在暗色区间随机生成
 * @returns
 */
export const getRandomColorDark = (str?: string) => getRandomColorWrapper(R.gte(0.5), 'darken', str)

export const isNovelDoc =
  (document: vscode.TextDocument) =>
  /**
   *
   * @param dirsConf 每个value都得是相对路径
   * @returns
   */
  (dirsConf: Record<keyof IDirs, string>) => {
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
    return R.cond<[p: string], boolean>([
      [(p) => p.startsWith(absoluteDirsConf.outlinesDir), R.F],
      [(p) => p.startsWith(absoluteDirsConf.diagnosticDir), R.F],
      [(p) => p.startsWith(absoluteDirsConf.infoDir), R.F],
      [(p) => p.startsWith(absoluteDirsConf.novelDir), R.T],
      [R.T, R.F],
    ])(path)
  }
