import * as vscode from 'vscode'
import { ICustomHighlightConf } from '.'
export interface IConfig {
  showApplyRecommendPlaintextConf: boolean
  autoIndentSpaces: number
  autoIndentLines: number
  spaceBetweenChEn: boolean
  statusShow: boolean
  statusTimeUnit: number
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
  customHighlight?: ICustomHighlightConf
  confCSVFiles?: [
    { path: string; key: string; hoverKey?: string; decorationRenderOptions: vscode.DecorationRenderOptions },
  ]
}

export const defaultConfig: IConfig = {
  showApplyRecommendPlaintextConf: true,
  autoIndentLines: 0,
  autoIndentSpaces: 4,
  spaceBetweenChEn: true,
  previewFontSize: 16,
  previewIndentionLength: 4,
  previewSpaceLines: 1,
  statusShow: true,
  statusTimeUnit: 10,
}
