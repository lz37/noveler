import React, { useState, useEffect, useRef } from 'react'
import ApiConfig, { ApiConfigRef } from './ApiConfig'
import PromptConfig, { PromptConfigRef } from './PromptConfig'
import { ApiProvider, Model } from './types'

interface ConfigPanelProps {
  isVisible: boolean
  onClose: () => void
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ isVisible, onClose }) => {
  // 配置面板标签页状态
  const [configTab, setConfigTab] = useState<'api' | 'prompt'>('api')

  // 提示词配置状态，初始化为默认结构，将从配置中加载
  const [promptConfig, setPromptConfig] = useState<any>({
    randomName: {
      withSelection: '',
      withoutSelection: '',
    },
    wordReplace: {
      withSelection: '',
      withoutSelection: '',
    },
    continueWriting: {
      withSelection: '',
      withoutSelection: '',
    },
    characterDesign: {
      withSelection: '',
      withoutSelection: '',
    },
  })

  // API配置组件的引用
  const apiConfigRef = useRef<ApiConfigRef>(null)

  // 提示词配置组件的引用
  const promptConfigRef = useRef<PromptConfigRef>(null)

  // 组件初始化时获取配置
  useEffect(() => {
    if (isVisible) {
      // 请求获取 AI 配置和提示词配置
      const vscode = (window as any).vscode
      if (vscode) {
        vscode.postMessage({ type: 'getConfig' })
        vscode.postMessage({ type: 'getPromptConfig' })
      }
    }
  }, [isVisible])

  // 监听来自 VSCode 扩展的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      // 处理配置消息
      if (message && message.type === 'config') {
        if (message.config && apiConfigRef.current) {
          // 将配置加载到ApiConfig组件中
          console.log('message.config ', message.config)

          apiConfigRef.current.loadConfig({
            apiProviders: message.config.apiProviders || [],
            selectedProviderId: message.config.selectedProviderId || '',
            selectedModelId: message.config.selectedModelId || '',
          })

          // 将提示词配置加载到PromptConfig组件中
          if (message.config.prompts && promptConfigRef.current) {
            promptConfigRef.current.loadConfig(message.config.prompts)
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // 更新提示词配置的函数
  const updatePromptConfig = (
    category: string,
    field: 'withSelection' | 'withoutSelection',
    value: string,
  ) => {
    setPromptConfig((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      // 验证API配置
      const validation = apiConfigRef.current?.validateConfig()

      if (validation && !validation.isValid) {
        return
      }

      // 获取API配置
      const apiConfig = apiConfigRef.current?.getConfig()

      // 获取提示词配置
      const promptsConfig = promptConfigRef.current?.getConfig()

      // 发送配置到主进程
      const vscode = (window as any).vscode
      if (vscode) {
        vscode.postMessage({
          type: 'saveConfig',
          config: {
            apiProviders: apiConfig?.apiProviders,
            selectedProviderId: apiConfig?.selectedProviderId,
            selectedModelId: apiConfig?.selectedModelId,
            prompts: promptsConfig,
          },
        })
      }

      // 关闭配置面板
      onClose()
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  // 如果组件不可见，则不渲染
  if (!isVisible) {
    return null
  }

  return (
    <div className='config-panel'>
      <div className='config-tabs'>
        <button
          className={`tab-button ${configTab === 'api' ? 'active' : ''}`}
          onClick={() => setConfigTab('api')}>
          API 配置
        </button>
        <button
          className={`tab-button ${configTab === 'prompt' ? 'active' : ''}`}
          onClick={() => setConfigTab('prompt')}>
          提示词配置
        </button>
      </div>

      <div style={{ display: configTab === 'api' ? 'block' : 'none' }}>
        <ApiConfig ref={apiConfigRef} />
      </div>

      <div style={{ display: configTab === 'prompt' ? 'block' : 'none' }}>
        <PromptConfig
          ref={promptConfigRef}
          promptConfig={promptConfig}
          updatePromptConfig={updatePromptConfig}
        />
      </div>

      <div className='form-actions'>
        <button className='save-config-button' onClick={handleSaveConfig}>
          保存配置
        </button>
        <button className='cancel-config-button' onClick={onClose}>
          取消
        </button>
      </div>
    </div>
  )
}

export default ConfigPanel
