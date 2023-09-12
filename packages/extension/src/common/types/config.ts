import * as vscode from 'vscode'
import { StatusItem } from './statusbar'

export interface IFlags {
  showApplyRecommendPlaintextConf: boolean
}

export interface IAutoIndent {
  autoIndent: boolean
  autoIndentSpaces: number
  autoIndentLines: number
}

export interface IFormat extends IAutoIndent {
  usePangu: boolean
}

export interface IPreview {
  previewFontSize: number
  previewIndentionLength: number
  previewSpaceLines: number
}

export interface ICustomHighlight {
  customHighlight?: { [key: string]: vscode.DecorationRenderOptions }
}

export interface ICompletion {
  completionChar: string
}

export interface IPairCompletion {
  pairCompletion: boolean
  pairCompletionChars: string[]
  pairDeletion: boolean
}

export interface IDirs {
  outlinesDir: string
  diagnosticDir: string
  infoDir: string
  novelDir: string
}

export interface IStatusBar {
  statusItems: StatusItem[]
  statusTimeUnit: number
  statusIncludingSpace: boolean
  statusShow: boolean
}

export interface IConfig
  extends IFlags,
    IAutoIndent,
    IFormat,
    IPreview,
    ICustomHighlight,
    ICompletion,
    IPairCompletion,
    IDirs,
    IStatusBar {}
