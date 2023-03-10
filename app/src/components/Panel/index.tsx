import React, { useState } from 'react'
import { Input } from 'antd'

const { TextArea } = Input

export default () => {
  const [value, setValue] = useState('')
  return (
    <div>
      <div style={{ paddingBottom: '100px' }}>
        <TextArea
          value={value}
          bordered={false}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Controlled autosize'
          autoSize={{ minRows: 3 }}
        />
      </div>
    </div>
  )
}
