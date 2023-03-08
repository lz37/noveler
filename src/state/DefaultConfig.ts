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
  statusItems: ['Time', 'Speed'],
  statusTimeUnit: 10,
  autoIndent: true,
  completionChar: '@',
} as IConfig

export const CSVOpt: CSVOptions = {
  key: 'name',
  suggestPrefix: '',
}

export const TXTOpt: TXTOptions = {
  message: '敏感词',
  diagnosticSeverity: 'Error',
}
