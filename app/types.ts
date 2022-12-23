export enum WebViewConfHandlerEnum {
  fontSize = '字体',
  indentionLength = '缩进',
  spaceLines = '段落空行',
}
export interface WebViewConfHandler {
  target: WebViewConfHandlerEnum
  /**0表示完成，1，-1表示进一步操作 */
  option: number
}
export interface Dto {
  text: string
  scrollPos: number
  maxLine: number
  style: IPreview
}
export interface IPreview {
  fontSize: number
  indentionLength: number
  spaceLines: number
}
