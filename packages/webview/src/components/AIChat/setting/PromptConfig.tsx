import React from 'react'

interface PromptConfigProps {
  promptConfig: {
    randomName: {
      withSelection: string
      withoutSelection: string
    }
    wordReplace: {
      withSelection: string
      withoutSelection: string
    }
    continueWriting: {
      withSelection: string
      withoutSelection: string
    }
    characterDesign: {
      withSelection: string
      withoutSelection: string
    }
  }
  updatePromptConfig: (
    category: string,
    field: 'withSelection' | 'withoutSelection',
    value: string,
  ) => void
}

const PromptConfig: React.FC<PromptConfigProps> = ({
  promptConfig,
  updatePromptConfig,
}) => {
  return (
    <div className='config-content'>
      <h3>提示词配置</h3>
      <div className='config-note'>
        <p>可用占位符：</p>
        <ul>
          <li>${'{selectedText}'} - 选中的文本</li>
          <li>${'{selectedTextWithContext}'} - 选中的文本及上下文</li>
          <li>${'{contentText}'} - 全文</li>
          <li>${'{paragraphText}'} - 当前段落</li>
        </ul>
      </div>
      <div className='prompt-config-form'>
        <div className='prompt-category'>
          <h4>随机取名</h4>
          <div className='form-group'>
            <label>有选中文本时:</label>
            <textarea
              value={promptConfig.randomName.withSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'randomName',
                  'withSelection',
                  e.target.value,
                )
              }
              placeholder='请根据内容：${selectedText}，随机取十个适合小说的人物姓名'
              rows={3}
            />
          </div>
          <div className='form-group'>
            <label>无选中文本时:</label>
            <textarea
              value={promptConfig.randomName.withoutSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'randomName',
                  'withoutSelection',
                  e.target.value,
                )
              }
              placeholder='请随机生成十个适合小说的人物姓名'
              rows={3}
            />
          </div>
        </div>

        <div className='prompt-category'>
          <h4>词汇替换</h4>
          <div className='form-group'>
            <label>有选中文本时:</label>
            <textarea
              value={promptConfig.wordReplace.withSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'wordReplace',
                  'withSelection',
                  e.target.value,
                )
              }
              placeholder='[${paragraphText}]\n${selectedText}能替换成什么？'
              rows={3}
            />
          </div>
          <div className='form-group'>
            <label>无选中文本时:</label>
            <textarea
              value={promptConfig.wordReplace.withoutSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'wordReplace',
                  'withoutSelection',
                  e.target.value,
                )
              }
              placeholder='请为当前段落提供一些词汇替换建议：\n${paragraphText}'
              rows={3}
            />
          </div>
        </div>

        <div className='prompt-category'>
          <h4>续写</h4>
          <div className='form-group'>
            <label>有选中文本时:</label>
            <textarea
              value={promptConfig.continueWriting.withSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'continueWriting',
                  'withSelection',
                  e.target.value,
                )
              }
              placeholder='请根据选中的内容继续续写：\n${selectedText}'
              rows={3}
            />
          </div>
          <div className='form-group'>
            <label>无选中文本时:</label>
            <textarea
              value={promptConfig.continueWriting.withoutSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'continueWriting',
                  'withoutSelection',
                  e.target.value,
                )
              }
              placeholder='请根据以下内容继续续写：\n${contentText}'
              rows={3}
            />
          </div>
        </div>

        <div className='prompt-category'>
          <h4>角色设计</h4>
          <div className='form-group'>
            <label>有选中文本时:</label>
            <textarea
              value={promptConfig.characterDesign.withSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'characterDesign',
                  'withSelection',
                  e.target.value,
                )
              }
              placeholder='请根据以下内容设计一个角色：\n${selectedText}'
              rows={3}
            />
          </div>
          <div className='form-group'>
            <label>无选中文本时:</label>
            <textarea
              value={promptConfig.characterDesign.withoutSelection}
              onChange={(e) =>
                updatePromptConfig(
                  'characterDesign',
                  'withoutSelection',
                  e.target.value,
                )
              }
              placeholder='帮我随机设计一个角色'
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptConfig
