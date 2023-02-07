import React, { useEffect, useRef, useState } from 'react'
import Layout from '@app/components/Layout'
import { WebViewConfHandler, Dto } from '@/types/webvDto'
import { defaultConfig } from '@/types/config'

export default () => {
  const [dto, setDto] = useState<Dto>({ text: '', scrollPos: 0, maxLine: 0, conf: defaultConfig })
  let lastDto = dto

  const handleReloadWebview = (signal: WebViewConfHandler) => {
    vscode.postMessage(signal)
  }

  const listen = (event: MessageEvent<Dto>) => {
    const message = event.data
    if (message.text) {
      lastDto = message
      setDto(message)
    } else {
      setDto({ ...lastDto, conf: message.conf })
    }
    // 获取页面高度
    const { scrollHeight } = document.body
    window.scrollTo(0, (scrollHeight * message.scrollPos) / message.maxLine)
  }

  useEffect(() => {
    handleReloadWebview({ /* 这个参数随便*/ target: 'previewFontSize', option: 0 })
    window.addEventListener('message', listen)
    return () => {
      window.removeEventListener('message', listen)
    }
  }, [])

  return (
    <>
      <Layout />
      {dto.text
        .split('\n')
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
                  style={{ height: dto.conf.previewFontSize * dto.conf.previewSpaceLines }}
                />
                <div
                  key={'paragraph' + index}
                  style={{
                    fontSize: dto.conf.previewFontSize,
                  }}>
                  {`${'\u00A0'.repeat(dto.conf.previewIndentionLength)}${message}`}
                </div>
              </>
            )
          }
        })}
    </>
  )
}
