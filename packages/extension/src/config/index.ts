import * as vscode from 'vscode'
import * as defaultConfig from '../common/state/defaultConfig'
import { IConfig } from '../common/types'
import { extPrefix, editorPrefix } from '../common/state'
import * as osPath from 'path'

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
          .update(`${extPrefix}.${String(item)}`, config[item], target)
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
