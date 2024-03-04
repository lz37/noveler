import React, { Fragment, useEffect, useState } from 'react'
import { genWebviewDTO } from '@common/utils/webview'
import {
  ExtCommandToWebview,
  IDTO,
  IEditorTextDTO,
  IPreview,
  IPreviewConfigDTO,
  IThemeDTO,
  WebviewStatus,
} from '@common/types'
import * as utils from '@common/utils/webview'
import * as R from 'ramda'
import { config as defaultConfig } from '@common/state/defaultConfig'
import styled from 'styled-components'
import { Affix, Menu } from 'antd'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'

const SizedDiv = styled.div<{ $fontSize: number }>`
  font-size: ${({ $fontSize }) => $fontSize}px;
`

const Text = styled.div`
  padding: 20px;
`

const WhiteText = styled(Text)`
  color: #fff;
`

const DarkText = styled(Text)`
  color: #000;
`

const ParagraphSpacing = styled.div<{ $height: number }>`
  height: ${({ $height }) => $height}px;
`

const BackgroundColoredMenu = styled(Menu)`
  background: var(--vscode-editor-background);
`

const changeConfig = (config: Partial<IPreviewConfigDTO['previewConfig']>) =>
  vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.TO_UPDATE_CONFIG, previewConfig: config }))

const ConfigController = (props: {
  config: IPreviewConfigDTO['previewConfig']
  configKey: keyof IPreview
  delta?: number
}) => (
  <>
    <PlusCircleOutlined
      onClick={() => {
        changeConfig({
          ...props.config,
          [props.configKey]: (props.config?.[props.configKey] ?? defaultConfig[props.configKey]) + (props.delta ?? 1),
        })
      }}
    />
    <MinusCircleOutlined
      onClick={() => {
        changeConfig({
          ...props.config,
          [props.configKey]: (props.config?.[props.configKey] ?? defaultConfig[props.configKey]) - (props.delta ?? 1),
        })
      }}
    />
  </>
)

export default () => {
  const [text, setText] = useState('')
  const [eol, setEol] = useState<IEditorTextDTO['eol']>('\n')
  const [theme, setTheme] = useState<IThemeDTO['theme']>('Light')
  const [config, setConfig] = useState<IPreviewConfigDTO['previewConfig']>(defaultConfig)
  const [menuCurrent, setMenuCurrent] = useState<keyof IPreview>()
  const messageListener = ({ data: message }: MessageEvent<IDTO>) =>
    R.cond([
      [
        R.equals(ExtCommandToWebview.TO_INIT),
        () => {
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.TO_INIT_THEME }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.INIT_THEME),
        () => {
          setTheme(message?.theme || 'Light')
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.TO_INIT_CONFIG }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.INIT_CONFIG),
        () => {
          setConfig(message?.previewConfig || defaultConfig)
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.TO_INIT_TEXT }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.INIT_TEXT),
        () => {
          setText(message?.text || '')
          setEol(message?.eol || '\n')
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.INIT_DONE }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.UPDATE_THEME),
        () => {
          setTheme(message?.theme || 'Light')
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.SUCCESS }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.UPDATE_TEXT),
        () => {
          setText(message?.text || '')
          setEol(message?.eol || '\n')
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.SUCCESS }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.UPDATE_SCROLL),
        () => {
          const { scrollHeight } = document.documentElement
          const { scrollTop = 0, lineCount = 1 } = message
          window.scrollTo(0, (scrollHeight * scrollTop) / lineCount)
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.SUCCESS }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.UPDATE_CONFIG),
        () => {
          setConfig(message?.previewConfig || defaultConfig)
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.SUCCESS }, message))
        },
      ],
      [
        R.equals(ExtCommandToWebview.NONE),
        () => {
          vscodeApi.postMessage(utils.genWebviewDTO({ status: WebviewStatus.WORKING }, message))
        },
      ],
    ])(message.command)
  useEffect(() => {
    window.addEventListener('message', messageListener)
    vscodeApi.postMessage(genWebviewDTO({ status: WebviewStatus.PREPARE_DONE }))
    return () => {
      window.removeEventListener('message', messageListener)
    }
  }, [])
  return (
    <div>
      <Affix>
        <BackgroundColoredMenu
          mode='horizontal'
          theme={theme?.search('Light') !== -1 ? 'light' : 'dark'}
          onClick={({ key }) => setMenuCurrent(key as keyof IPreview)}
          onBlur={() => setMenuCurrent(undefined)}
          selectedKeys={menuCurrent ? [menuCurrent] : []}
          items={[
            {
              key: 'previewFontSize',
              label: '字体',
              title: '字体',
              icon: <ConfigController config={config} configKey='previewFontSize' />,
            },
            {
              key: 'previewIndentionLength',
              label: '缩进',
              title: '缩进',
              icon: <ConfigController config={config} configKey='previewIndentionLength' />,
            },
            {
              key: 'previewSpaceLines',
              label: '段落间距',
              title: '段落间距',
              icon: <ConfigController config={config} configKey='previewSpaceLines' delta={0.1} />,
            },
          ]}
        />
      </Affix>
      <SizedDiv $fontSize={config?.previewFontSize ?? defaultConfig.previewFontSize}>
        {R.pipe(
          () =>
            text
              .split(eol || '\n')
              .map(R.trim)
              .filter(Boolean)
              .map((p, i, arr) => (
                <Fragment key={`paragraph-group-${i}`}>
                  <div>
                    {'\u00A0'.repeat(config?.previewIndentionLength ?? defaultConfig.previewIndentionLength)} {p}
                  </div>
                  {i !== arr.length - 1 && (
                    <ParagraphSpacing
                      $height={
                        (config?.previewSpaceLines ?? defaultConfig.previewSpaceLines) *
                        (config?.previewFontSize ?? defaultConfig.previewFontSize)
                      }
                    />
                  )}
                </Fragment>
              )),
          (t) => (theme?.search('Light') !== -1 ? <DarkText>{t}</DarkText> : <WhiteText>{t}</WhiteText>),
        )()}
      </SizedDiv>
    </div>
  )
}
