import { CSVOption, IConfig, RegExpRenderOptionsMap, RenderOptions, TXTOptions } from '../types'

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
  pairCompletion: true,
  pairCompletionChars: [
    // '""', "''", '（）', '[]', '{}', '《》', '【】', '「」', '『』', '“”', '‘’'
  ],
  pairDeletion: true,
  outlinesDir: '.noveler/outlines',
  infoDir: '.noveler/infos',
  diagnosticDir: '.noveler/diagnostics',
  novelDir: '.',
  statusItems: ['Time', 'InputWordCount', 'TextWordCount', 'Speed'],
  statusIncludingSpace: false,
  statusShow: true,
  statusTimeUnit: 10,
}

export const csvOpt: CSVOption = {
  nameKey: 'name',
  description: '',
}

export const txtOpt: TXTOptions = {
  message: '敏感词',
  diagnosticSeverity: 'Error',
}

export const decorations: RegExpRenderOptionsMap = {
  '\\d+(\\.\\d+)?': {
    renderOpts: {
      color: { id: 'number' },
    },
  },
  '《.*?》': {
    renderOpts: {
      textDecoration: 'underline',
    },
  },
  '“.*?”': {
    renderOpts: {
      fontStyle: 'italic',
      opacity: '0.7',
    },
  },
  '【.*?】': {
    renderOpts: {
      fontWeight: 'bold',
      opacity: '0.7',
    },
  },
}
