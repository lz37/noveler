import * as vscode from 'vscode'
import * as utils from '../common/utils'
import * as command from '../common/commands'
import * as state from '../common/state'
import * as R from 'ramda'
import * as config from '../config'
import * as infos from '../config/infos'
import * as defaultConf from '../common/state/defaultConfig'
import {
  RenderOptions,
  CSVContent,
  DealedRenderOptions,
  RootCSVContentMapMap,
  RegExpRenderOptionsMap as RegExpStrRenderOptionsMap,
  RegExpDealedRenderOptionsMap,
} from '../common/types'

//#region init
export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  context.subscriptions.push(onChangeConf, onChangeDocument, onChangeEditor, reloadCommand(roots))
//#endregion

//#region hooks
const onChangeEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (!editor) return
  if (!state.funcTarget.decoration.includes(editor.document.languageId)) return
  if (!utils.isNovelDoc(editor.document)(config.get())) return
  updateDecorations(editor)(dealedRenderOptionsMapHandle(false)())
})

const onChangeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return
  if (!state.funcTarget.decoration.includes(event.document.languageId)) return
  if (!utils.isNovelDoc(editor.document)(config.get())) return
  updateDecorations(editor)(dealedRenderOptionsMapHandle(false)())
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
      (map) => R.mergeDeepLeft(map, defaultConf.decorations) as RegExpStrRenderOptionsMap,
      createDecorations,
      // 添加
      dealedRenderOptionsMapHandle(true),
      (map) =>
        state.funcTarget.decoration.includes(editor.document.languageId) &&
        utils.isNovelDoc(editor.document)(config.get(true)) &&
        updateDecorations(editor)(map),
    )(await infos.getInfosFromAllWorkspaces(roots)(false))
  })
//#endregion

type DealedRenderOption2Itself = (map?: RegExpDealedRenderOptionsMap) => RegExpDealedRenderOptionsMap
const dealedRenderOptionsMapHandle = (() => {
  let map: RegExpDealedRenderOptionsMap = {}
  /**
   * @param set 是否更新缓存， false 给了参数也没用 true 不给参数就销毁
   */
  return (set: boolean) =>
    R.ifElse(
      () => set,
      (): DealedRenderOption2Itself => (newMap?: RegExpDealedRenderOptionsMap) => {
        R.values(map).forEach((value) => {
          value.hoverMsg = undefined
          value.decorationType.dispose()
        })
        map = newMap ?? {}
        return map
      },
      (): DealedRenderOption2Itself => () => map,
    )()
})()

const getRenderOptionsMap =
  (customHighlight: { [key: string]: vscode.DecorationRenderOptions }) => (csvContentsMap: RootCSVContentMapMap) =>
    R.pipe(
      () => customHighlightIntoRenderOptionsMap(customHighlight),
      (map) => {
        R.values(csvContentsMap).forEach((value) =>
          Object.entries(value).forEach(([key, value]) => {
            CSVContentIntoRenderOptionsMap(key.toString(), value)(map)
          }),
        )
        return map
      },
    )()

const customHighlightIntoRenderOptionsMap = (customHighlight: { [key: string]: vscode.DecorationRenderOptions }) =>
  Object.entries(customHighlight).reduce((acc, [key, value]) => {
    acc[key] = {
      renderOpts: value,
    }
    return acc
  }, {} as RegExpStrRenderOptionsMap)

const CSVContentIntoRenderOptionsMap = (filename: string, csvContent: CSVContent) => (map: RegExpStrRenderOptionsMap) =>
  R.pipe(
    () => ({
      light: R.once(utils.getRandomColorLight),
      dark: R.once(utils.getRandomColorDark),
    }),
    (once) =>
      Object.entries(csvContent.data).forEach(
        ([key, value]) =>
          (map[value.alias ? `(${key})|${value.alias.map((item) => `(${item})`).join('|')}` : key] = {
            renderOpts: csvContent.decorationRenderOptions ?? {
              dark: {
                color: once.light(filename),
              },
              light: {
                color: once.dark(filename),
              },
              cursor: 'pointer',
            },
            hoverMsg: value.hover,
          }),
      ),
    () => map,
  )()

/**
 * 不会刷新高亮
 */
export const createDecorations = (map: RegExpStrRenderOptionsMap) => {
  const decorations: RegExpDealedRenderOptionsMap = {}
  Object.entries(map).forEach(([key, value]) => {
    const decoration: DealedRenderOptions = {
      decorationType: vscode.window.createTextEditorDecorationType(value.renderOpts),
      hoverMsg: value.hoverMsg,
    }
    decorations[key] = decoration
  })
  return decorations
}

export const updateDecorations = (editor: vscode.TextEditor) => (map: RegExpDealedRenderOptionsMap) => {
  Object.entries(map).forEach(([key, value]) => updateSingleDecoration(editor)(value, new RegExp(key, 'g')))
}

const updateSingleDecoration = (editor: vscode.TextEditor) => (opts: DealedRenderOptions, reg: RegExp) => {
  const text = editor.document.getText()
  const options: vscode.DecorationOptions[] = []
  let match: RegExpExecArray | null = null
  while ((match = reg.exec(text))) {
    const startPos = editor.document.positionAt(match.index)
    const endPos = editor.document.positionAt(match.index + match[0].length)
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: opts.hoverMsg,
    }
    options.push(decoration)
  }
  editor.setDecorations(opts.decorationType, options)
}
