// API提供商接口
export interface ApiProvider {
  id: string
  name: string
  apiUrl: string
  apiKey: string
  models: Model[]
  isActive: boolean
}

// 模型接口
export interface Model {
  id: string
  name: string
  isActive: boolean
}
