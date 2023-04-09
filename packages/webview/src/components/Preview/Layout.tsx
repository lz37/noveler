import React from 'react'
import { Affix } from 'antd'
import { IConfig } from 'common/types'
import { PreviewExtRecDto } from 'common/types'
import './style.css'

const itemMap: {
  name: string
  handler: keyof IConfig
}[] = [
  { name: '字体', handler: 'previewFontSize' },
  { name: '缩进', handler: 'previewIndentionLength' },
  { name: '段落间距', handler: 'previewSpaceLines' },
]

export default () => {
  const options = [-1, 1]
  const handleReloadWebview = (signal: PreviewExtRecDto) => {
    vscode.postMessage(signal)
  }

  return (
    <Affix offsetTop={0}>
      <div className='preview-affix'>
        {itemMap.map((item, index1) => (
          <div key={`${index1}`} className='inline-block'>
            {item.name}
            {options.map((option, index2) => (
              <button
                key={`${index1}-${index2}`}
                className='inline-block'
                onClick={() => {
                  handleReloadWebview({ conf: item.handler, option })
                }}>
                {option > 0 ? '+' : '-'}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Affix>
  )
}
