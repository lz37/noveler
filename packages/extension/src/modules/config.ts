import * as vscode from 'vscode'
import * as defaultConfig from 'common/state/defaultConfig'
import { IConfig, CSVOption } from 'common/types'
import { extPrefix, editorPrefix } from 'common/state'
import * as osPath from 'path'
import { promises as fs } from 'fs'
import { getFileNameInDir } from 'common/utils'
import * as path from 'path'

/** 一次性取出一个整体的配置 而非一个一个 (保证配置一致性以及类型可读性)
 * @returns {IConfig}
 * @throws {Error} 请确保noveler的infoDir、outlinesDir、diagnosticDir都是相对路径
 */
export const get = () => {
  const userConf = vscode.workspace
    .getConfiguration(undefined)
    .get(extPrefix) as IConfig
  const conf = { ...defaultConfig.config, ...userConf } as IConfig
  const { infoDir, outlinesDir, diagnosticDir } = conf
  if (
    [infoDir, outlinesDir, diagnosticDir]
      .map((dir) => !osPath.isAbsolute(dir))
      .includes(false)
  ) {
    throw new Error(
      '请确保noveler的infoDir、outlinesDir、diagnosticDir都是相对路径',
    )
  }
  return conf
}

/**
 * @param p infoDir 绝对路径
 */
export const getCSVOptions = async (p: string) => {
  // 判断是否为目录
  try {
    const stat = await fs.stat(p)
    if (!stat.isDirectory()) return undefined
  } catch (error) {
    console.error(error)
    fs.mkdir(p)
  }
  // 遍历，获取csv文件
  const csvFiles = await getFileNameInDir(p, 'csv', false)
  const csvMap: Map<string, CSVOption> = new Map()
  const isCompletionItemKind = (a: string) => {
    return Object.values(vscode.CompletionItemKind).includes(a)
  }
  csvFiles.forEach((file) => {
    csvMap.set(file, {
      suggestPrefix: file,
      key: defaultConfig.csvOpt.key,
    })
  })
  if (csvMap.size === 0) return undefined
  // 遍历，读取json文件
  const jsonFiles = await getFileNameInDir(p, 'json', false)
  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i]
    if (!csvMap.has(file)) continue
    const data = await fs.readFile(path.join(p, `${file}.json`), 'utf-8')
    // data解析json
    const json = <CSVOption>JSON.parse(data)
    if (json.suggestKind && !isCompletionItemKind(json.suggestKind)) {
      json.suggestKind = undefined
    }
    if (json) {
      csvMap.set(file, { ...csvMap.get(file), ...json })
    }
  }
  return csvMap
}

export const getCSVOptionsFromAllWorkspaces = async () => {
  const roots = vscode.workspace.workspaceFolders
  if (!roots) return
  const map = new Map<string, Map<string, CSVOption>>()
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i]
    const opts = await getCSVOptions(path.join(root.uri.fsPath, get().infoDir))
    if (opts) {
      map.set(root.uri.fsPath, opts)
    }
  }
  return map
}

export const set = (
  config: IConfig,
  items?: (keyof IConfig)[],
  target = vscode.ConfigurationTarget.Workspace,
) => {
  if (items) {
    items.forEach((item) => {
      if (config[item]) {
        // 更新配置
        vscode.workspace
          .getConfiguration()
          .update(`${extPrefix}.${item}`, config[item], target)
      }
    })
  } else {
    const keys = Object.keys(config)
    keys.forEach((key) => {
      // 更新配置
      vscode.workspace
        .getConfiguration()
        .update(`${extPrefix}.${key}`, (config as any)[key], target)
    })
  }
}

const judgeConfigIsRecommended = (config: vscode.WorkspaceConfiguration) => {
  let isCommand = true
  isCommand = isCommand && config.get('wrappingIndent') === 'none'
  isCommand = isCommand && config.get('autoIndent') === 'none'
  isCommand = isCommand && config.get('wordWrap') !== 'off'
  return isCommand
}

export const askForPlaintextConf = async () => {
  const plaintextEditorConf = vscode.workspace.getConfiguration(editorPrefix, {
    languageId: 'plaintext',
  })
  if (!get().showApplyRecommendPlaintextConf) return
  if (!vscode.workspace.workspaceFolders) return
  if (!judgeConfigIsRecommended(plaintextEditorConf)) {
    const res = await vscode.window.showErrorMessage(
      '您当前的编辑器配置不适合小说写作，是否应用noveler推荐的配置？',
      '是',
      '否',
      '不再提示(工作区)',
      '不再提示(全局)',
    )
    switch (res) {
      case '是':
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[
          ['wrappingIndent', 'none'],
          ['autoIndent', 'none'],
          ['wordWrap', 'bounded'],
        ].forEach(([key, value]) => {
          plaintextEditorConf.update(
            key,
            value,
            vscode.ConfigurationTarget.Workspace,
            true,
          )
        })
        break
      case '不再提示(工作区)':
        set({ ...get(), showApplyRecommendPlaintextConf: false }, [
          'showApplyRecommendPlaintextConf',
        ])
        break
      case '不再提示(全局)':
        set(
          { ...get(), showApplyRecommendPlaintextConf: false },
          ['showApplyRecommendPlaintextConf'],
          vscode.ConfigurationTarget.Global,
        )
        break
      default:
        break
    }
  }
}
