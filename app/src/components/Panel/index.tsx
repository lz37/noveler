import React, { useState, useEffect } from 'react'
import { Input, Button, Affix } from 'antd'
import ReactMarkdown from 'react-markdown'
import { PanelDto, PanelExtRecDto } from 'noveler/src/types/webvDto'

const { TextArea } = Input

export default () => {
  const [isEdit, setIsEdit] = useState(false)
  const [value, setValue] = useState<PanelDto>({
    content: '',
    path: '',
    workSpaceRoot: '',
  })
  const listen = (event: MessageEvent<PanelDto>) => {
    setValue(event.data)
  }
  useEffect(() => {
    window.addEventListener('message', listen)
    return () => {
      window.removeEventListener('message', listen)
    }
  }, [])
  const handleReloadWebview = (signal: PanelExtRecDto) => {
    vscode.postMessage(signal)
  }
  const save = (dto: PanelDto) => {
    const { content, path, workSpaceRoot } = dto
    handleReloadWebview({
      content,
      path,
      workSpaceRoot,
    })
  }
  return (
    <div>
      {!isEdit && (
        <div
          style={{ padding: '1em 2em 0 2em' }}
          onClick={() => {
            setIsEdit(true)
          }}>
          <ReactMarkdown>{value.content}</ReactMarkdown>
        </div>
      )}
      {isEdit && (
        <div style={{ padding: '0.5em 1em 0 1em', height: '100%' }}>
          <TextArea
            value={value.content}
            bordered={false}
            onChange={(e) => setValue({ ...value, content: e.target.value })}
            autoSize={{ minRows: 1 }}
          />
          <Affix
            offsetBottom={10}
            style={{ position: 'absolute', bottom: '10px', right: '2em' }}>
            <Button
              type='text'
              onClick={() => {
                setIsEdit(false)
                save(value)
              }}>
              保存
            </Button>
          </Affix>
        </div>
      )}
    </div>
  )
}
