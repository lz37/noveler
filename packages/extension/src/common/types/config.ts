import * as vscode from 'vscode'
import { StatusItem } from './statusbar'

export interface IConfig {
  showApplyRecommendPlaintextConf: boolean
  autoIndent: boolean
  autoIndentSpaces: number
  autoIndentLines: number
  usePangu: boolean
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
  customHighlight?: { [key: string]: vscode.DecorationRenderOptions }
  completionChar: string
  outlinesDir: string
  diagnosticDir: string
  infoDir: string
  novelDir: string
  statusItems: StatusItem[]
  statusTimeUnit: number
  statusIncludingSpace: boolean
  statusShow: boolean
}
