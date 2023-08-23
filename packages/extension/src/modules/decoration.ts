import * as vscode from 'vscode'
import * as utils from '../common/utils'
import * as command from '../common/commands'
import * as state from '../common/state'
import * as R from 'ramda'
import * as config from '../config'
import * as infos from '../config/infos'
import * as defaultConf from '../common/state/defaultConfig'
import { RenderOptions, CSVContent, DealedRenderOptions } from '../common/types'

export const init = (context: vscode.ExtensionContext, roots: readonly vscode.WorkspaceFolder[]) =>
  context.subscriptions.push(onChangeConf, onChangeDocument, onChangeEditor, reloadCommand(roots))

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
      (map) => {
        defaultConf.decorations.forEach((value, key) => !map.has(key) && map.set(key, value))
        return map
      },
      createDecorations,
      // 添加
      dealedRenderOptionsMapHandle(true),
      (map) =>
        state.funcTarget.decoration.includes(editor.document.languageId) &&
        utils.isNovelDoc(editor.document)(config.get(true)) &&
        updateDecorations(editor)(map),
    )(await infos.getInfosFromAllWorkspaces(roots)(false))
  })

type DealedRenderOption2Itself = (map?: Map<RegExp, DealedRenderOptions>) => Map<RegExp, DealedRenderOptions>
const dealedRenderOptionsMapHandle = (() => {
  let map = new Map<RegExp, DealedRenderOptions>()
  /**
   * @param set 是否更新缓存， false 给了参数也没用 true 不给参数就销毁
   */
  return (set: boolean) =>
    R.ifElse(
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
})()

const getRenderOptionsMap =
  (customHighlight: { [key: string]: vscode.DecorationRenderOptions }) =>
  (csvContentsMap: Map<string, Map<string, CSVContent>>) =>
    R.pipe(customHighlightIntoRenderOptionsMap(customHighlight), (map) => {
      csvContentsMap.forEach((value) => value.forEach((value, key) => CSVContentIntoRenderOptionsMap(key, value)(map)))
      return map
    })(new Map<RegExp, RenderOptions>())

const customHighlightIntoRenderOptionsMap =
  (customHighlight: { [key: string]: vscode.DecorationRenderOptions }) => (map: Map<RegExp, RenderOptions>) =>
    Object.entries(customHighlight).reduce((acc, [key, value]) => {
      acc.set(new RegExp(key), {
        renderOpts: value,
      })
      return acc
    }, map)

const CSVContentIntoRenderOptionsMap =
  (filename: string, csvContent: CSVContent) => (map: Map<RegExp, RenderOptions>) =>
    R.pipe(
      () => ({
        light: R.once(utils.getRandomColorLight),
        dark: R.once(utils.getRandomColorDark),
      }),
      (once) =>
        csvContent.data.forEach((value, key) => {
          map.set(new RegExp(value.alias ? `(${key})|${value.alias.map((item) => `(${item})`).join('|')}` : key, 'g'), {
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
          })
        }),
      () => map,
    )()

/**
 * 不会刷新高亮
 */
export const createDecorations = (map: Map<RegExp, RenderOptions>) => {
  const decorations = new Map<RegExp, DealedRenderOptions>()
  map.forEach((value, key) => {
    const decoration: DealedRenderOptions = {
      decorationType: vscode.window.createTextEditorDecorationType(value.renderOpts),
      hoverMsg: value.hoverMsg,
    }
    decorations.set(key, decoration)
  })
  return decorations
}

export const updateDecorations = (editor: vscode.TextEditor) => (map: Map<RegExp, DealedRenderOptions>) => {
  map.forEach(updateSingleDecoration(editor))
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
