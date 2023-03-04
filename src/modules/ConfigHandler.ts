import * as vscode from 'vscode'
import defaultConfig from '@/state/defaultConfig'
const extPrefix = 'noveler'
const editorPrefix = 'editor'

// 一次性取出一个整体的配置 而非一个一个 (保证配置一致性以及类型可读性)
export const get = () => {
  const userConf = vscode.workspace
    .getConfiguration(undefined)
    .get(extPrefix) as IConfig
  return { ...defaultConfig, ...userConf } as IConfig
}

export const set = (config: IConfig, target?: vscode.ConfigurationTarget) => {
  // 获取config中的所有key
  const keys = Object.keys(config)
  // 遍历key
  keys.forEach((key) => {
    // 更新配置
    vscode.workspace
      .getConfiguration()
      .update(
        `${extPrefix}.${key}`,
        (config as any)[key],
        target ?? vscode.ConfigurationTarget.Workspace,
      )
  })
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
      '不再提示',
    )
    if (res === '是') {
      plaintextEditorConf.update(
        'wrappingIndent',
        'none',
        vscode.ConfigurationTarget.Workspace,
        true,
      )
      plaintextEditorConf.update(
        'autoIndent',
        'none',
        vscode.ConfigurationTarget.Workspace,
        true,
      )
      plaintextEditorConf.update(
        'off',
        'bounded',
        vscode.ConfigurationTarget.Workspace,
        true,
      )
    }
    if (res === '不再提示') {
      set({ ...get(), showApplyRecommendPlaintextConf: false })
    }
  }
}