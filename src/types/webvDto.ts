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

export interface PanelDto {
  workSpaceRoot: string
  path: string
  content: string
}

// maybe different from PanelDto so use a new type
export interface PanelExtRecDto {
  workSpaceRoot: string
  path: string
  content: string
}
