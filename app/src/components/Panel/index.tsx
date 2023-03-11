import React, { useState, useEffect } from 'react'
import { Input, Button, Affix, Row, Col } from 'antd'
import ReactMarkdown from 'react-markdown'
import {
  PanelDto,
  PanelDtoStatus,
  PanelExtRecDto,
  Theme,
} from 'noveler/src/types/webvDto'
import './style.css'

const { TextArea } = Input
const handlePostMsg = (signal: PanelExtRecDto) => {
  vscode.postMessage(signal)
}

export default () => {
  const [isEdit, setIsEdit] = useState(false)
  const [value, setValue] = useState<PanelDto>({
    status: PanelDtoStatus.NoEditor,
    content: '',
    path: '',
    workSpaceRoot: '',
  })
  const [theme, setTheme] = useState<Theme>('light')
  const [replace, setReplace] = useState('')
  const listen = (event: MessageEvent<PanelDto>) => {
    setValue(event.data)
    if (event.data.themeKind) {
      setTheme(event.data.themeKind)
    }
    switch (event.data.status) {
      case PanelDtoStatus.NoEditor:
        setReplace('*无活动编辑器*')
        break
      case PanelDtoStatus.OutlineFile:
        setReplace('*此文件为保存的大纲文件*')
        break
      case PanelDtoStatus.NoFile:
        setReplace('*此文件没有保存的大纲*')
        break
      default:
        setReplace('')
        break
    }
    setIsEdit(false)
  }
  useEffect(() => {
    window.addEventListener('message', listen)
    return () => {
      window.removeEventListener('message', listen)
    }
  }, [])
  useEffect(() => {
    handlePostMsg({
      needLoad: true,
      status: value.status,
      content: value.content,
      path: value.path,
      workSpaceRoot: value.workSpaceRoot,
    })
  }, [])
  const save = (dto: PanelDto) => {
    const { content, path, workSpaceRoot, status } = dto
    handlePostMsg({
      needLoad: false,
      status,
      content,
      path,
      workSpaceRoot,
    })
  }
  return (
    <>
      {!isEdit && (
        <div
          className='markdown-container'
          onClick={() => {
            if (
              value.status !== PanelDtoStatus.NoEditor &&
              value.status !== PanelDtoStatus.OutlineFile
            ) {
              setValue({ ...value, status: PanelDtoStatus.Valid })
              setIsEdit(true)
            }
          }}>
          <ReactMarkdown>
            {value.status === PanelDtoStatus.Valid ? value.content : replace}
          </ReactMarkdown>
        </div>
      )}
      {isEdit && (
        <Row>
          <Col xs={{ order: 2, span: 24 }} sm={{ order: 1, span: 22 }}>
            <div className='textarea-container'>
              <TextArea
                className={`textarea panel-edit-${theme}`}
                value={value.content}
                bordered={false}
                onChange={(e) =>
                  setValue({ ...value, content: e.target.value })
                }
                autoSize={true}
              />
            </div>
          </Col>
          <Col xs={{ order: 1, span: 24 }} sm={{ order: 2, span: 2 }}>
            <Affix offsetTop={0} className='panel-affix'>
              <div className='button-container'>
                <Button
                  type='text'
                  onClick={() => {
                    setIsEdit(false)
                    save(value)
                  }}>
                  <span className={`panel-save-${theme}`}>保存</span>
                </Button>
              </div>
            </Affix>
          </Col>
        </Row>
      )}
    </>
  )
}
