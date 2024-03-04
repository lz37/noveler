import * as vscode from 'vscode'
import * as defaultConfig from '@common/state/defaultConfig'
import { extPrefix } from '@common/state'
import * as osPath from 'path'
import * as R from 'ramda'
import { IConfig } from '@common/types'

export const get = R.pipe(
  (languageId?: string) =>
    vscode.workspace.getConfiguration(undefined, languageId ? { languageId } : undefined).get(extPrefix) as IConfig,
  (conf) => ({ ...defaultConfig.config, ...conf }),
  R.cond([
    [
      ({ infoDir, outlinesDir, diagnosticDir }) =>
        [infoDir, outlinesDir, diagnosticDir].map((dir) => !osPath.isAbsolute(dir)).includes(false),
      () => {
        throw new Error('请确保noveler的infoDir、outlinesDir、diagnosticDir都是相对路径')
      },
    ],
    [R.T, R.identity<typeof defaultConfig.config & IConfig>],
  ]),
)

/**
 *
 * @param config
 * @param keys 传入：只覆盖未定义的选中key 不传入：涉及到的key全覆盖
 * @param target 默认为工作区
 * @returns
 */
export const set = (
  config: Partial<IConfig>,
  keys?: (keyof IConfig)[],
  target = vscode.ConfigurationTarget.Workspace,
) => {
  ;(keys ?? R.keys(config)).forEach(
    R.pipe(
      (key) => {
        return keys && config[key] ? key : undefined
      },
      (key) => key && vscode.workspace.getConfiguration().update(`${extPrefix}.${key}`, config[key], target),
    ),
  )
}

const judgeConfigIsRecommended = (config: vscode.WorkspaceConfiguration) =>
  R.pipe(
    () => true,
    (isCommand) => isCommand && config.get('wrappingIndent') === 'none',
    (isCommand) => isCommand && config.get('autoIndent') === 'none',
    (isCommand) => isCommand && config.get('wordWrap') !== 'off',
  )()

export const askForPlaintextConf = async () =>
  R.cond([
    [() => !get().showApplyRecommendPlaintextConf, () => undefined],
    [() => !vscode.workspace.workspaceFolders, () => undefined],
    [
      (plaintextEditorConf: vscode.WorkspaceConfiguration) => !judgeConfigIsRecommended(plaintextEditorConf),
      (plaintextEditorConf) =>
        vscode.window
          .showErrorMessage(
            '您当前的编辑器配置不适合小说写作，是否应用noveler推荐的配置？',
            '是',
            '否',
            '不再提示(工作区)',
            '不再提示(全局)',
          )
          .then((res) =>
            R.cond([
              [
                () => res === '是',
                () =>
                  [
                    ['wrappingIndent', 'none'],
                    ['autoIndent', 'none'],
                    ['wordWrap', 'bounded'],
                  ].forEach(([key, value]) => {
                    plaintextEditorConf.update(key, value, vscode.ConfigurationTarget.Workspace, true)
                  }),
              ],
              [
                () => res === '不再提示(工作区)',
                () => set({ ...get(), showApplyRecommendPlaintextConf: false }, ['showApplyRecommendPlaintextConf']),
              ],
              [
                () => res === '不再提示(全局)',
                () =>
                  set(
                    { ...get(), showApplyRecommendPlaintextConf: false },
                    ['showApplyRecommendPlaintextConf'],
                    vscode.ConfigurationTarget.Global,
                  ),
              ],
            ])(),
          ),
    ],
  ])(
    vscode.workspace.getConfiguration('editor', {
      languageId: 'plaintext',
    }),
  )
