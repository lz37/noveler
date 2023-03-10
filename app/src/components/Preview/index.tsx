import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import defaultConfig from 'noveler/src/state/DefaultConfig'
import { PreviewDto, PreviewExtRecDto } from 'noveler/src/types/webvDto'

export default () => {
  const [dto, setDto] = useState<PreviewDto>({
    text: '',
    scrollPos: 0,
    maxLine: 0,
    conf: defaultConfig,
  })
  let lastDto = dto

  const handleReloadWebview = (signal: PreviewExtRecDto) => {
    vscode.postMessage(signal)
  }

  const listen = (event: MessageEvent<PreviewDto>) => {
    const message = event.data
    if (message.text !== undefined) {
      lastDto = message
      setDto(message)
    } else {
      lastDto = { ...lastDto, conf: message.conf }
      setDto(lastDto)
    }
    // 获取页面高度
    const { scrollHeight } = document.body
    window.scrollTo(0, (scrollHeight * lastDto.scrollPos) / lastDto.maxLine)
  }

  useEffect(() => {
    handleReloadWebview({
      /* 这个参数随便*/ conf: 'previewFontSize',
      option: 0,
    })
    window.addEventListener('message', listen)
    return () => {
      window.removeEventListener('message', listen)
    }
  }, [])

  return (
    <>
      <Layout />
      <div
        style={{
          width: '95%',
          margin: '0 auto',
        }}>
        {dto
          .text!.split('\n')
          .join('\r')
          .split('\r\r')
          .join('\r')
          .split('\r')
          .map((text) => text.trim())
          .map((message, index) => {
            if (message) {
              return (
                <>
                  {/* 插入dto.style.fontSize倍行距 */}
                  <div
                    key={'spaceLine' + index}
                    style={{
                      height:
                        dto.conf.previewFontSize * dto.conf.previewSpaceLines,
                    }}
                  />
                  <div
                    key={'paragraph' + index}
                    style={{
                      fontSize: dto.conf.previewFontSize,
                    }}>
                    {`${'\u00A0'.repeat(
                      dto.conf.previewIndentionLength,
                    )}${message}`}
                  </div>
                </>
              )
            }
          })}
      </div>
    </>
  )
}
