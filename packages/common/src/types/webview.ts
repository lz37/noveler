import * as vscode from 'vscode'
import { IPreview } from './config'

export type NovelerRouter = '/' | '/preview' | '/panel'

export interface IBaseDTO {
  time: number
  uuid: string
}

export interface IWebviewBaseDTO {
  sentUUID?: string
  sentTime?: number
}

export enum WebviewStatus {
  UNKNOWN,
  PREPARE_DONE,
  TO_INIT_CONFIG,
  TO_INIT_TEXT,
  TO_INIT_THEME,
  TO_UPDATE_CONFIG,
  INIT_DONE,
  WORKING,
  SUCCESS,
}

export interface IWebviewStatusDTO {
  status: WebviewStatus
}

export enum ExtCommandToWebview {
  TO_INIT,
  INIT_TEXT,
  INIT_CONFIG,
  INIT_THEME,
  UPDATE_TEXT,
  UPDATE_THEME,
  UPDATE_SCROLL,
  UPDATE_CONFIG,
  NONE,
}

export interface IExtCommandDTO {
  command: ExtCommandToWebview
}

export interface IPreviewConfigDTO {
  previewConfig?: Partial<IPreview>
}

export interface IEditorTextDTO {
  text?: string
  eol?: '\n' | '\r\n'
}

export interface IThemeDTO {
  theme?: keyof typeof vscode.ColorThemeKind
}

export interface IScrollDTO {
  scrollTop?: number
  lineCount?: number
}

export interface IDTO extends IBaseDTO, IExtCommandDTO, IEditorTextDTO, IThemeDTO, IScrollDTO, IPreviewConfigDTO {}
export interface IWebviewDTO extends IBaseDTO, IWebviewBaseDTO, IThemeDTO, IWebviewStatusDTO, IPreviewConfigDTO {}
