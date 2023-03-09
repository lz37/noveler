import { IConfig } from './config'

export interface Dto {
  /**if undefined will not take effect */
  text?: string
  /**if <0 will not take effect */
  scrollPos: number
  /**if <0 will not take effect */
  maxLine: number
  conf: IConfig
}

export interface WebViewConfHandler {
  /**只有 preview开头的才能被处理 */
  target: keyof IConfig
  /**0表示完成，1，-1表示进一步操作 */
  option: number
}
