import * as vscode from 'vscode'
import defaultConfig, { CSVOpt, TXTOpt } from '@/state/DefaultConfig'
import { IConfig } from '@/types/config'
const extPrefix = 'noveler'
const editorPrefix = 'editor'

// 一次性取出一个整体的配置 而非一个一个 (保证配置一致性以及类型可读性)
export const get = () => {
  const userConf = vscode.workspace
    .getConfiguration(undefined)
    .get(extPrefix) as IConfig
  const res = { ...defaultConfig, ...userConf } as IConfig
  res.confCSVFiles = res.confCSVFiles?.map((file) => {
    file.suggestPrefix = file.suggestPrefix ?? CSVOpt.suggestPrefix
    file.key = file.key ?? CSVOpt.key
    return file
  })
  res.confTXTFiles = res.confTXTFiles?.map((file) => {
    file.message = file.message ?? TXTOpt.message
    file.diagnosticSeverity =
      file.diagnosticSeverity ?? TXTOpt.diagnosticSeverity
    return file
  })
  if (res.statusItems.length === 0) {
    res.statusShow = false
  }
  return res
}

export const set = (
  config: IConfig,
  items?: (keyof IConfig)[],
  target = vscode.ConfigurationTarget.Workspace,
) => {
  console.log('set config', config)
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
