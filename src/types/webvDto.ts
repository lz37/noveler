import { IConfig } from './config'
import * as vscode from 'vscode'

export type NovelerRouter = '/' | '/preview' | '/panel'
export interface PreviewDto {
  /**if undefined will not take effect */
  text?: string
  /**if <0 will not take effect */
  scrollPos: number
  /**if <0 will not take effect */
  maxLine: number
  conf: IConfig
}

export interface PreviewExtRecDto {
  /**只有 preview开头的才能被处理 */
  conf: keyof IConfig
  /**0表示完成，1，-1表示进一步操作 */
  option: number
}

export enum PanelDtoStatus {
  NoEditor,
  NoFile,
  Valid,
  OutlineFile,
}

export type Theme = 'light' | 'dark'

export interface PanelDto {
  status: PanelDtoStatus
  workSpaceRoot: string
  path: string
  content: string
  themeKind?: Theme
}

export interface PanelExtRecDto {
  status: PanelDtoStatus
  workSpaceRoot: string
  path: string
  content: string
}
