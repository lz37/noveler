import * as vscode from 'vscode'
import { defaultConfig, IConfig } from '@/types/config'

const extPrefix = 'noveler'
const editorPrefix = 'editor'

// 一次性取出一个整体的配置 而非一个一个 (保证配置一致性以及类型可读性)
export const get = () => {
  const userConf = vscode.workspace.getConfiguration().get(extPrefix) as IConfig
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
      .update(`${extPrefix}.${key}`, (config as any)[key], target ?? vscode.ConfigurationTarget.Workspace)
  })
}

const judgeConfigIsCommand = (config: vscode.WorkspaceConfiguration) => {
  let isCommand = true
  isCommand = isCommand && vscode.workspace.getConfiguration(editorPrefix).get('wrappingIndent') === 'none'
  isCommand = isCommand && vscode.workspace.getConfiguration(editorPrefix).get('autoIndent') === 'none'
  return isCommand
}

export const askForPlaintextConf = async () => {
  const plaintextConf = vscode.workspace.getConfiguration('', { languageId: 'plaintext' })
  if (!get().showApplyRecommendPlaintextConf) return
  if (!judgeConfigIsCommand(plaintextConf)) {
    const res = await vscode.window.showErrorMessage(
      '您当前的编辑器配置不适合小说写作，是否应用noveler推荐的配置？',
      '是',
      '否',
      '不再提示',
    )
    if (res === '是') {
      plaintextConf.update(`${editorPrefix}.wrappingIndent`, 'none', vscode.ConfigurationTarget.Workspace, true)
      plaintextConf.update(`${editorPrefix}.autoIndent`, 'none', vscode.ConfigurationTarget.Workspace, true)
    }
    if (res === '不再提示') {
      set({ ...get(), showApplyRecommendPlaintextConf: false })
    }
  }
}
