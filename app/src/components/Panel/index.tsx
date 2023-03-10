import React, { useState, useEffect } from 'react'
import { Input, Button, Affix } from 'antd'
import ReactMarkdown from 'react-markdown'
import {
  PanelDto,
  PanelDtoStatus,
  PanelExtRecDto,
} from 'noveler/src/types/webvDto'

const { TextArea } = Input

export default () => {
  const [isEdit, setIsEdit] = useState(false)
  const [value, setValue] = useState<PanelDto>({
    status: PanelDtoStatus.NoEditor,
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
    const { content, path, workSpaceRoot, status } = dto
    handleReloadWebview({
      status,
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
            if (
              value.status !== PanelDtoStatus.NoEditor &&
              value.status !== PanelDtoStatus.OutlineFile
            ) {
              setValue({ ...value, status: PanelDtoStatus.Valid })
              setIsEdit(true)
            }
          }}>
          {value.status === PanelDtoStatus.Valid && (
            <ReactMarkdown>{value.content}</ReactMarkdown>
          )}
          {value.status === PanelDtoStatus.NoEditor && (
            <ReactMarkdown>*无活动编辑器*</ReactMarkdown>
          )}
          {value.status === PanelDtoStatus.NoFile && (
            <ReactMarkdown>*此文件没有保存的大纲*</ReactMarkdown>
          )}
          {value.status === PanelDtoStatus.OutlineFile && (
            <ReactMarkdown>*此文件为保存的大纲文件*</ReactMarkdown>
          )}
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
