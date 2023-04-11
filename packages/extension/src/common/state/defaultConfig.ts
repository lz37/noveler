import { CSVOption, IConfig, TXTOptions } from '../types'

export const config: IConfig = {
  showApplyRecommendPlaintextConf: true,
  autoIndentLines: 0,
  autoIndentSpaces: 4,
  usePangu: true,
  previewFontSize: 16,
  previewIndentionLength: 4,
  previewSpaceLines: 1,
  autoIndent: true,
  completionChar: '@',
  outlinesDir: '.noveler/outlines',
  infoDir: '.noveler/infos',
  diagnosticDir: '.noveler/diagnostics',
}

export const csvOpt: CSVOption = {
  nameKey: 'name',
  suggestPrefix: '',
}

export const txtOpt: TXTOptions = {
  message: '敏感词',
  diagnosticSeverity: 'Error',
}
