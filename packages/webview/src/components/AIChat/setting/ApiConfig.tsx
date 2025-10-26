import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { ApiProvider, Model } from './types'

interface ApiConfigProps {
  initialApiProviders?: ApiProvider[]
  initialSelectedProviderId?: string
  initialSelectedModelId?: string
}

export interface ApiConfigRef {
  getConfig: () => {
    apiProviders: ApiProvider[]
    selectedProviderId: string
    selectedModelId: string
  }
  loadConfig: (config: {
    apiProviders: ApiProvider[]
    selectedProviderId: string
    selectedModelId: string
  }) => void
  validateConfig: () => { isValid: boolean; errors: string[] }
}

const ApiConfig = forwardRef<ApiConfigRef, ApiConfigProps>(
  (
    {
      initialApiProviders = [
        {
          id: '',
          name: '',
          apiUrl: '',
          apiKey: '',
          models: [],
          isActive: true,
        },
      ],
      initialSelectedProviderId = '',
      initialSelectedModelId = '',
    },
    ref,
  ) => {
    // API提供商配置状态
    const [apiProviders, setApiProviders] =
      useState<ApiProvider[]>(initialApiProviders)

    // 当前选中的API提供商和模型
    const [selectedProviderId, setSelectedProviderId] = useState(
      initialSelectedProviderId,
    )
    const [selectedModelId, setSelectedModelId] = useState(
      initialSelectedModelId,
    )

    // 验证错误信息状态
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [showValidationErrors, setShowValidationErrors] = useState(false)

    // 当前选中的提供商
    const [currentProviderId, setCurrentProviderId] = useState(
      apiProviders.length > 0 ? apiProviders[0].id : '',
    )

    // 获取当前选中的提供商
    const currentProvider =
      apiProviders.find((p) => p.id === currentProviderId) || apiProviders[0]

    // 切换当前编辑的提供商
    const handleSelectProvider = (providerId: string) => {
      setCurrentProviderId(providerId)
      // 选择提供商时同时设置为激活的提供商
      selectApiProvider(providerId)
      // 切换提供商时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 更新提供商信息
    const handleUpdateProvider = (field: keyof ApiProvider, value: any) => {
      if (currentProvider) {
        const updatedProviders = apiProviders.map((p) =>
          p.id === currentProvider.id ? { ...p, [field]: value } : p,
        )
        setApiProviders(updatedProviders)
        // 更新时隐藏验证错误
        setShowValidationErrors(false)
      }
    }

    // 更新模型信息
    const handleUpdateModel = (
      modelId: string,
      field: keyof Model,
      value: any,
    ) => {
      if (currentProvider) {
        const updatedProviders = apiProviders.map((p) =>
          p.id === currentProvider.id
            ? {
                ...p,
                models: p.models.map((m) =>
                  m.id === modelId ? { ...m, [field]: value } : m,
                ),
              }
            : p,
        )
        setApiProviders(updatedProviders)
        // 更新时隐藏验证错误
        setShowValidationErrors(false)
      }
    }

    // 添加API提供商的函数
    const addApiProvider = () => {
      const newProvider: ApiProvider = {
        id: `provider-${Date.now()}`,
        name: '新API提供商',
        apiUrl: '',
        apiKey: '',
        models: [],
        isActive: false,
      }
      setApiProviders([...apiProviders, newProvider])
      // 添加时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 删除API提供商的函数
    const deleteApiProvider = (providerId: string) => {
      const updatedProviders = apiProviders.filter((p) => p.id !== providerId)
      setApiProviders(updatedProviders)

      // 如果删除的是当前选中的提供商，则选择第一个可用的提供商
      if (selectedProviderId === providerId && updatedProviders.length > 0) {
        setSelectedProviderId(updatedProviders[0].id)
        setCurrentProviderId(updatedProviders[0].id)
      }
      // 删除时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 添加模型的函数
    const addModel = (providerId: string) => {
      const newModel: Model = {
        id: `model-${Date.now()}`,
        name: '',
        isActive: false,
      }
      const updatedProviders = apiProviders.map((p) =>
        p.id === providerId ? { ...p, models: [...p.models, newModel] } : p,
      )
      setApiProviders(updatedProviders)
      // 添加时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 删除模型的函数
    const deleteModel = (providerId: string, modelId: string) => {
      const updatedProviders = apiProviders.map((p) =>
        p.id === providerId
          ? { ...p, models: p.models.filter((m) => m.id !== modelId) }
          : p,
      )
      setApiProviders(updatedProviders)

      // 如果删除的是当前选中的模型，则选择该提供商的第一个可用模型
      if (selectedModelId === modelId) {
        const provider = updatedProviders.find((p) => p.id === providerId)
        if (provider && provider.models.length > 0) {
          setSelectedModelId(provider.models[0].id)
        }
      }
      // 删除时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 设置选中的API提供商
    const selectApiProvider = (providerId: string) => {
      setSelectedProviderId(providerId)
      // 同时选择该提供商的第一个可用模型
      const provider = apiProviders.find((p) => p.id === providerId)
      if (provider && provider.models.length > 0) {
        setSelectedModelId(provider.models[0].id)
      }
      // 选择时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 设置选中的模型
    const selectModel = (modelId: string) => {
      setSelectedModelId(modelId)
      // 选择时隐藏验证错误
      setShowValidationErrors(false)
    }

    // 验证配置数据
    const validateConfig = () => {
      const errors: string[] = []

      // 验证API提供商
      if (apiProviders.length === 0) {
        errors.push('至少需要添加一个API提供商')
      } else {
        apiProviders.forEach((provider, index) => {
          if (!provider.name || provider.name.trim() === '') {
            errors.push(
              `API提供商 ${index + 1} 【${provider.name}】 的名称不能为空`,
            )
          }
          if (!provider.apiUrl || provider.apiUrl.trim() === '') {
            errors.push(
              `API提供商 ${index + 1} 【${provider.name}】 的API URL不能为空`,
            )
          }
          if (!provider.apiKey || provider.apiKey.trim() === '') {
            errors.push(
              `API提供商 ${index + 1} 【${provider.name}】 的API密钥不能为空`,
            )
          }
          if (!provider.models || provider.models.length === 0) {
            errors.push(
              `API提供商 ${index + 1} 【${
                provider.name
              }】 至少需要添加一个模型`,
            )
          } else {
            provider.models.forEach((model, modelIndex) => {
              if (!model.name || model.name.trim() === '') {
                errors.push(
                  `API提供商 ${index + 1} 【${provider.name}】 的模型 ${
                    modelIndex + 1
                  } 名称不能为空`,
                )
              }
            })
          }
        })
      }

      // 验证选中的提供商和模型
      if (
        selectedProviderId &&
        !apiProviders.find((p) => p.id === selectedProviderId)
      ) {
        errors.push('选中的API提供商不存在')
      }

      if (selectedModelId) {
        const provider = apiProviders.find((p) => p.id === selectedProviderId)
        if (
          provider &&
          !provider.models.find((m) => m.id === selectedModelId)
        ) {
          errors.push('选中的模型不存在')
        }
      }

      // 设置错误信息并显示
      setValidationErrors(errors)
      setShowValidationErrors(errors.length > 0)

      return {
        isValid: errors.length === 0,
        errors,
      }
    }

    // 通过ref暴露给父组件的方法
    useImperativeHandle(
      ref,
      () => ({
        getConfig: () => ({
          apiProviders,
          selectedProviderId,
          selectedModelId,
        }),
        loadConfig: (config) => {
          setApiProviders(config.apiProviders)
          setSelectedProviderId(config.selectedProviderId)
          setSelectedModelId(config.selectedModelId)
          setCurrentProviderId(config.selectedProviderId)
          // 加载配置时隐藏验证错误
          setShowValidationErrors(false)
        },
        validateConfig,
      }),
      [apiProviders, selectedProviderId, selectedModelId],
    )

    return (
      <div className='config-content'>
        <h3>AI 配置</h3>
        <div className='config-note'>
          <p>
            提示：点击提供商标签页来选择特定的API提供商和模型。配置后需要重新打开
            AI 助手面板才能生效。
          </p>
        </div>

        {/* 验证错误信息显示 */}
        {showValidationErrors && validationErrors.length > 0 && (
          <div className='validation-errors'>
            <h4>配置验证失败:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* API提供商列表 */}
        <div className='provider-list'>
          <div className='section-header'>
            <h4>API 提供商</h4>
            <button className='add-button' onClick={addApiProvider}>
              添加提供商
            </button>
          </div>

          {apiProviders.length === 0 ? (
            <p className='empty-message'>暂无API提供商，请添加一个</p>
          ) : (
            <div className='provider-tabs'>
              {apiProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`provider-tab ${
                    currentProviderId === provider.id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectProvider(provider.id)}>
                  <span className='provider-name'>{provider.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 当前提供商的配置 */}
        {currentProvider && (
          <div className='provider-config'>
            <div className='provider-header'>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <h4>{currentProvider.name || '未命名提供商'}</h4>
                {apiProviders.length > 1 && (
                  <button
                    className='delete-button'
                    onClick={() => deleteApiProvider(currentProvider.id)}>
                    删除提供商
                  </button>
                )}
              </div>
            </div>
            <div className='config-form'>
              <div className='form-group'>
                <label htmlFor='providerName'>提供商名称:</label>
                <input
                  id='providerName'
                  type='text'
                  value={currentProvider.name}
                  onChange={(e) => handleUpdateProvider('name', e.target.value)}
                  placeholder='例如: OpenAI, Claude, 等'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='apiUrl'>API URL:</label>
                <input
                  id='apiUrl'
                  type='text'
                  value={currentProvider.apiUrl}
                  onChange={(e) =>
                    handleUpdateProvider('apiUrl', e.target.value)
                  }
                  placeholder='https://api.openai.com/v1/chat/completions'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='apiKey'>API 密钥:</label>
                <input
                  id='apiKey'
                  type='password'
                  value={currentProvider.apiKey}
                  onChange={(e) =>
                    handleUpdateProvider('apiKey', e.target.value)
                  }
                  placeholder='您的 API 密钥'
                />
              </div>
            </div>

            {/* 模型列表 */}
            <div className='model-list'>
              <div className='section-header'>
                <h4>模型列表</h4>
                <button
                  className='add-button'
                  onClick={() => addModel(currentProvider.id)}>
                  添加模型
                </button>
              </div>

              {currentProvider.models.length === 0 ? (
                <p className='empty-message'>暂无模型，请添加一个</p>
              ) : (
                <div className='model-items'>
                  {currentProvider.models.map((model) => (
                    <div key={model.id} className='model-item'>
                      <label className='radio-label'>
                        <input
                          type='radio'
                          name='activeModel'
                          checked={selectedModelId === model.id}
                          onChange={() => selectModel(model.id)}
                        />
                        <input
                          type='text'
                          value={model.name}
                          onChange={(e) =>
                            handleUpdateModel(model.id, 'name', e.target.value)
                          }
                          placeholder='模型名称'
                          className='model-name-input'
                        />
                      </label>
                      {currentProvider.models.length > 1 && (
                        <button
                          className='delete-button'
                          onClick={() =>
                            deleteModel(currentProvider.id, model.id)
                          }>
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default ApiConfig
