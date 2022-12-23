import * as vscode from 'vscode'
import defaultConf from './DefaultConf'
import { IConfig } from './types'

const ProjectName = 'noveler'

let conf = defaultConf

export const getConf = () => {
  return conf
}

export const update = () => {
  conf = vscode.workspace.getConfiguration().get(ProjectName) as IConfig
  return conf
}

export const updateSettingsJson = (setting: IConfig) => {
  vscode.workspace.getConfiguration().update(ProjectName, setting, vscode.ConfigurationTarget.Workspace)
  update()
}

export const init = () => {
  conf = update()
  if (Object.keys(conf).length === 0) {
    vscode.workspace.getConfiguration().update(ProjectName, defaultConf, vscode.ConfigurationTarget.Workspace)
    conf = defaultConf
  }
}

const wordSeparators = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?，。‘’“”：；·《》？！…—￥{}【】（）'.split('')

const judgeConfigIsCommand = (config: vscode.WorkspaceConfiguration) => {
  let isCommand = true
  isCommand = isCommand && config.get('editor.wrappingIndent') === 'none'
  isCommand = isCommand && config.get('editor.autoIndent') === 'none'
  const wordSeparatorsSetting = config.get('editor.wordSeparators') as string
  isCommand = isCommand && wordSeparatorsSetting.split('').every((item) => wordSeparators.includes(item))
  return isCommand
}

export const askForplaintextConf = async () => {
  const plaintextConf = vscode.workspace.getConfiguration('', { languageId: 'plaintext' })
  if (judgeConfigIsCommand(plaintextConf)) {
    const res = await vscode.window.showErrorMessage(
      '您当前的编辑器配置不适合小说写作，是否应用noveler推荐的配置？',
      '是',
      '否',
    )
    if (res === '是') {
      plaintextConf.update('editor.wrappingIndent', 'none', vscode.ConfigurationTarget.Workspace, true)
      plaintextConf.update('editor.autoIndent', 'none', vscode.ConfigurationTarget.Workspace, true)
      plaintextConf.update('editor.wordSeparators', wordSeparators.join(''), vscode.ConfigurationTarget.Workspace, true)
    }
  }
}
