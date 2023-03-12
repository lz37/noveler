import { CSVOptions, IConfig, TXTOptions } from '../types/config'

export default {
  showApplyRecommendPlaintextConf: true,
  autoIndentLines: 0,
  autoIndentSpaces: 4,
  usePangu: true,
  previewFontSize: 16,
  previewIndentionLength: 4,
  previewSpaceLines: 1,
  statusShow: true,
  statusIncludingSpace: false,
  statusItems: ['Time', 'Speed', 'InputWordCount', 'TextWordCount'],
  statusTimeUnit: 10,
  autoIndent: true,
  completionChar: '@',
  outlinesDir: '.noveler/outlines',
} as IConfig

export const CSVOpt: CSVOptions = {
  key: 'name',
  suggestPrefix: '',
}

export const TXTOpt: TXTOptions = {
  message: '敏感词',
  diagnosticSeverity: 'Error',
}
