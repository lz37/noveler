import * as confHandler from '@/modules/ConfigHandler'
import * as vscode from 'vscode'
import { promises as fs, createReadStream } from 'fs'
import { isAbsolutePath } from '@/utils'
import * as csv from 'csv'
import { reloadConf } from './Decoration'

let conf: DecorationExtConf | undefined = undefined
let highlightConf: ICustomHighlightConf | undefined = undefined
const workSpaceRoots = vscode.workspace.workspaceFolders

const updateConf = () => {
  const tmpConfs = confHandler.get().confCSVFiles
  if (tmpConfs) {
    for (let i = 0; i < tmpConfs.length; i++) {
      if (!tmpConfs[i].path) {
        throw new Error('confCSVFiles 配置格式出现错误: path 不能为空')
      }
    }
    const newConf: DecorationExtConf = {}
    tmpConfs.forEach((tmpConf) => {
      if (!tmpConf.hoverKey && !tmpConf.decorationRenderOptions) return
      if (!workSpaceRoots && !isAbsolutePath(tmpConf.path!)) return
      if (
        workSpaceRoots &&
        workSpaceRoots.length > 1 &&
        !isAbsolutePath(tmpConf.path!)
      )
        return
      const { key, decorationRenderOptions, hoverKey, path } = tmpConf
      newConf[path!] = { key, decorationRenderOptions, hoverKey }
    })
    conf = newConf
  }
}

/**
 * 返回一个数组，数组中的每一项都是一个绝对路径
 * @param path
 * @returns
 */
const handlePath = async (path: string) => {
  const paths: string[] = []
  if (!isAbsolutePath(path)) {
    paths.push(`${workSpaceRoots?.[0].uri.fsPath}/${path}`)
  } else {
    paths.push(path)
  }
  const stat = await fs.stat(paths[0])
  if (stat.isDirectory()) {
    // read all .csv in this dir
    const p = paths.pop()
    if (!p) return
    const files = await fs.readdir(p)
    for (let i = 0; i < files.length; i++) {
      const f = `${p}/${files[i]}`
      if (files[i].endsWith('.csv') && (await fs.stat(f)).isFile()) {
        paths.push(f)
      }
    }
  }
  return paths
}
/**
 *
 * @param path 绝对路径
 */
const handleCSV = (
  path: string,
  csvKey: string,
  csvHoverKey?: string,
  decorationRenderOptions: vscode.DecorationInstanceRenderOptions = {},
) => {
  let firstRow = true
  let keyIndex = -1
  let hoverKeyIndex = -1
  const stream = createReadStream(path)
  stream
    .pipe(csv.parse({ delimiter: ',', from_line: 1 }))
    .on('data', (row: string[]) => {
      if (firstRow) {
        firstRow = false
        for (let i = 0; i < row.length; i++) {
          const element = row[i]
          if (element.trim() === csvKey) {
            keyIndex = i
          }
          if (element.trim() === csvHoverKey) {
            hoverKeyIndex = i
          }
        }
        if (keyIndex === -1) {
          stream.emit(
            'error',
            new Error(`配置文件 ${path} 中没有找到 key: ${csvKey}`),
          )
        }
        return
      }
      const key = row[keyIndex].trim()
      let hoverKey: string | undefined = undefined
      if (hoverKeyIndex != -1) {
        hoverKey = row[hoverKeyIndex].trim()
      }
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      const markdownStr = hoverKey
        ? new vscode.MarkdownString(hoverKey)
        : undefined
      highlightConf![key] = {
        renderOptions: decorationRenderOptions,
        hoverMsg: markdownStr,
      }
    })
    .on('end', () => {
      reloadConf(highlightConf)
    })
    .on('error', (error) => {
      vscode.window.showErrorMessage(
        `读取配置文件 ${path} 出现错误:\n ${error.message}`,
      )
    })
}

const loadFile = async () => {
  updateConf()
  if (!conf) throw new Error('confCSVFiles 配置出现错误: 获取配置失败')
  const confEntries = Object.entries(conf)
  highlightConf = {}
  for (let i = 0; i < confEntries.length; i++) {
    const [key, value] = confEntries[i]
    const paths = await handlePath(key)
    if (!paths || paths.length == 0) return
    for (let j = 0; j < paths.length; j++) {
      handleCSV(
        paths[j],
        value.key,
        value.hoverKey,
        value.decorationRenderOptions,
      )
    }
  }
}

export const reloadConfExt = vscode.commands.registerCommand(
  'noveler.reloadCSV',
  async () => {
    await loadFile()
  },
)
