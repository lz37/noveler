import * as vscode from 'vscode'
import * as utils from '../common/utils'
import * as command from '../common/commands'
import * as state from '../common/state'
import * as R from 'ramda'
import * as config from '../config'
import * as infos from '../config/infos'
import * as decoration from '../modules/decoration'
import * as defaultConf from '../common/state/defaultConfig'
import { RenderOptions, CSVContent, DealedRenderOptions } from '../common/types'

export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) => {
  context.subscriptions.push(onChangeConf, onChangeDocument, onChangeEditor, reloadCommand(roots))
}

const onChangeEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (!editor) return
  if (!state.funcTarget.decoration.includes(editor.document.languageId)) return
  if (!utils.isNovelDoc(editor.document)(config.get())) return
  decoration.updateDecorations(editor)(dealedRenderOptionsMapHandle(false)())
})

const onChangeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return
  if (!state.funcTarget.decoration.includes(event.document.languageId)) return
  if (!utils.isNovelDoc(editor.document)(config.get())) return
  decoration.updateDecorations(editor)(dealedRenderOptionsMapHandle(false)())
})

const onChangeConf = vscode.workspace.onDidChangeConfiguration(async (event) => {
  if (event.affectsConfiguration(`${state.extPrefix}.customHighlight`))
    await vscode.commands.executeCommand(command.Noveler.RELOAD_DECORATION)
})

const reloadCommand = (roots: readonly vscode.WorkspaceFolder[]) =>
  vscode.commands.registerTextEditorCommand(command.Noveler.RELOAD_DECORATION, async (editor) => {
    // 销毁
    dealedRenderOptionsMapHandle(true)()
    R.pipe(
      getRenderOptionsMap(config.get().customHighlight ?? {}),
      (map) => {
        defaultConf.decorations.forEach((value, key) => {
          if (map.has(key)) return
          map.set(key, value)
        })
        return map
      },
      decoration.createDecorations,
      // 添加
      dealedRenderOptionsMapHandle(true),
      (map) => {
        if (!state.funcTarget.decoration.includes(editor.document.languageId)) return
        if (!utils.isNovelDoc(editor.document)(config.get(true))) return
        decoration.updateDecorations(editor)(map)
      },
    )(await infos.getInfosFromAllWorkspaces(roots)(false))
  })

type DealedRenderOption2Itself = (map?: Map<RegExp, DealedRenderOptions>) => Map<RegExp, DealedRenderOptions>
const dealedRenderOptionsMapHandle = (() => {
  let map = new Map<RegExp, DealedRenderOptions>()
  /**
   * @param set 是否更新缓存， false 给了参数也没用 true 不给参数就销毁
   */
  return (set: boolean) => {
    return R.ifElse(
      () => set,
      (): DealedRenderOption2Itself => (newMap?: Map<RegExp, DealedRenderOptions>) => {
        map.forEach((value) => {
          value.hoverMsg = undefined
          value.decorationType.dispose()
        })
        map = newMap ?? new Map()
        return map
      },
      (): DealedRenderOption2Itself => () => map,
    )()
  }
})()

const getRenderOptionsMap =
  (customHighlight: { [key: string]: vscode.DecorationRenderOptions }) =>
  (csvContentsMap: Map<string, Map<string, CSVContent>>) => {
    const map = R.pipe(customHighlightIntoRenderOptionsMap(customHighlight), (map) => {
      csvContentsMap.forEach((value) => {
        value.forEach((value, key) => {
          CSVContentIntoRenderOptionsMap(key, value)(map)
        })
      })
      return map
    })(new Map<RegExp, RenderOptions>())
    return map
  }

const customHighlightIntoRenderOptionsMap =
  (customHighlight: { [key: string]: vscode.DecorationRenderOptions }) => (map: Map<RegExp, RenderOptions>) =>
    Object.entries(customHighlight).reduce((acc, [key, value]) => {
      acc.set(new RegExp(key), {
        renderOpts: value,
      })
      return acc
    }, map)

const CSVContentIntoRenderOptionsMap =
  (filename: string, csvContent: CSVContent) => (map: Map<RegExp, RenderOptions>) => {
    const onceGetRandomColorLight = R.once(utils.getRandomColorLight)
    const onceGetRandomColorDark = R.once(utils.getRandomColorDark)
    const { data, decorationRenderOptions } = csvContent
    data.forEach((value, key) => {
      map.set(new RegExp(value.alias ? `(${key})|${value.alias.map((item) => `(${item})`).join('|')}` : key, 'g'), {
        renderOpts: decorationRenderOptions ?? {
          dark: {
            color: onceGetRandomColorLight(filename),
          },
          light: {
            color: onceGetRandomColorDark(filename),
          },
          cursor: 'pointer',
        },
        hoverMsg: value.hover,
      })
    })
    return map
  }
