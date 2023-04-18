import { CSVOption, IConfig, RenderOptions, TXTOptions } from '../types'

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
  novelDir: '.',
}

export const csvOpt: CSVOption = {
  nameKey: 'name',
  description: '',
}

export const txtOpt: TXTOptions = {
  message: '敏感词',
  diagnosticSeverity: 'Error',
}

export const decorations = new Map<RegExp, RenderOptions>([
  [
    new RegExp('\\d+(\\.\\d+)?', 'g'),
    {
      renderOpts: {
        color: { id: 'number' },
      },
    },
  ],
  [
    new RegExp('《.*?》', 'g'),
    {
      renderOpts: {
        textDecoration: 'underline',
      },
    },
  ],
  [
    new RegExp('“.*?”', 'g'),
    {
      renderOpts: {
        fontStyle: 'italic',
        opacity: '0.7',
      },
    },
  ],
  [
    new RegExp('【.*?】', 'g'),
    {
      renderOpts: {
        fontWeight: 'bold',
        opacity: '0.7',
      },
    },
  ],
])
