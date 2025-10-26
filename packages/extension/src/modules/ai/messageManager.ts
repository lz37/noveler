import { ChatMessage } from 'common/types'

// 会话接口
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

// 消息管理器类
export class MessageManager {
  private sessions: Map<string, ChatSession> = new Map()
  private currentSessionId: string | null = null
  private maxMessagesPerSession = 100 // 每个会话最大消息数量
  private maxContextMessages = 20 // 上下文最大消息数量，用于API调用
  private storageKey = 'ai.chatSessions'
  private isInitialized = false

  // 初始化，从持久化存储加载会话数据
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadSessions()
      this.isInitialized = true
      console.log('消息管理器初始化完成')
    } catch (error) {
      console.error('初始化消息管理器失败:', error)
      // 创建一个默认会话
      this.createSession('默认对话')
      this.isInitialized = true
    }
  }

  // 创建新会话
  createSession(title?: string): ChatSession {
    const sessionId = this.generateId()
    const now = Date.now()
    const session: ChatSession = {
      id: sessionId,
      title: title || `对话 ${this.sessions.size + 1}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }

    this.sessions.set(sessionId, session)
    this.currentSessionId = sessionId
    this.saveSessions()
    return session
  }

  // 获取当前会话
  getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) {
      return this.createSession()
    }
    return this.sessions.get(this.currentSessionId) || null
  }

  // 获取所有会话
  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    )
  }

  // 切换会话
  switchSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.currentSessionId = sessionId
      this.saveSessions()
      return true
    }
    return false
  }

  // 删除会话
  deleteSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId)

      // 如果删除的是当前会话，切换到最新的会话
      if (this.currentSessionId === sessionId) {
        const allSessions = this.getAllSessions()
        this.currentSessionId =
          allSessions.length > 0 ? allSessions[0].id : null
      }

      this.saveSessions()
      return true
    }
    return false
  }

  // 添加消息到当前会话
  addMessage(message: ChatMessage): ChatSession | null {
    const session = this.getCurrentSession()
    if (!session) return null

    session.messages.push(message)
    session.updatedAt = Date.now()

    // 限制消息数量，删除旧消息
    if (session.messages.length > this.maxMessagesPerSession) {
      // 保留系统消息和最新的消息
      const systemMessages = session.messages.filter((m) => m.role === 'system')
      const otherMessages = session.messages.filter((m) => m.role !== 'system')
      const excessCount = session.messages.length - this.maxMessagesPerSession

      if (excessCount > 0) {
        // 删除最早的非系统消息
        session.messages = [
          ...systemMessages,
          ...otherMessages.slice(excessCount),
        ]
      }
    }

    this.saveSessions()
    return session
  }

  // 更新会话标题
  updateSessionTitle(sessionId: string, title: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.title = title
      session.updatedAt = Date.now()
      this.saveSessions()
      return true
    }
    return false
  }

  // 获取用于API请求的上下文消息
  getContextMessages(sessionId?: string, maxMessages?: number): ChatMessage[] {
    const session = sessionId
      ? this.sessions.get(sessionId)
      : this.getCurrentSession()

    if (!session || session.messages.length === 0) return []

    const limit = maxMessages || this.maxContextMessages

    // 包含系统消息和最近的对话
    const systemMessages = session.messages.filter((m) => m.role === 'system')
    const conversationMessages = session.messages
      .filter((m) => m.role !== 'system')
      .slice(-limit)

    return [...systemMessages, ...conversationMessages]
  }

  // 清空当前会话的消息
  clearCurrentSession(): boolean {
    const session = this.getCurrentSession()
    if (session) {
      // 保留系统消息
      const systemMessages = session.messages.filter((m) => m.role === 'system')
      session.messages = systemMessages
      session.updatedAt = Date.now()
      this.saveSessions()
      return true
    }
    return false
  }

  // 保存会话到VS Code存储
  private async saveSessions(): Promise<void> {
    // if (!this.isInitialized) return
    // try {
    //   const sessionsData = JSON.stringify(Array.from(this.sessions.entries()))
    //   await vscode.workspace
    //     .getConfiguration('noveler')
    //     .update(this.storageKey, sessionsData, vscode.ConfigurationTarget.Global)
    // } catch (error) {
    //   console.error('保存会话失败:', error)
    // }
  }

  // 从VS Code存储加载会话
  private async loadSessions(): Promise<void> {
    this.sessions = new Map()
    // 创建一个默认会话
    this.createSession('默认对话')
    return
    // try {
    //   const sessionsData = vscode.workspace
    //     .getConfiguration('noveler')
    //     .get<string>(this.storageKey)

    //   if (sessionsData) {
    //     const entries = JSON.parse(sessionsData) as [string, ChatSession][]
    //     this.sessions = new Map(entries)

    //     // 设置当前会话为最近更新的会话
    //     const allSessions = this.getAllSessions()
    //     if (allSessions.length > 0) {
    //       this.currentSessionId = allSessions[0].id
    //     }
    //   } else {
    //     // 如果没有保存的会话，创建一个默认会话
    //     this.createSession('默认对话')
    //   }
    // } catch (error) {
    //   console.error('加载会话失败:', error)
    //   this.sessions = new Map()
    //   // 创建一个默认会话
    //   this.createSession('默认对话')
    // }
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // 获取会话统计信息
  getSessionStats(sessionId?: string): {
    messageCount: number
    userMessageCount: number
    assistantMessageCount: number
    lastActivity: number
  } | null {
    const session = sessionId
      ? this.sessions.get(sessionId)
      : this.getCurrentSession()

    if (!session) return null

    const userMessageCount = session.messages.filter(
      (m) => m.role === 'user',
    ).length
    const assistantMessageCount = session.messages.filter(
      (m) => m.role === 'assistant',
    ).length

    return {
      messageCount: session.messages.length,
      userMessageCount,
      assistantMessageCount,
      lastActivity: session.updatedAt,
    }
  }

  // 删除会话中的特定消息
  deleteMessage(sessionId: string, messageId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      const index = session.messages.findIndex((m) => m.id === messageId)
      if (index !== -1) {
        session.messages.splice(index, 1)
        session.updatedAt = Date.now()
        this.saveSessions()
        return true
      }
    }
    return false
  }

  // 更新会话中的特定消息
  updateMessage(
    sessionId: string,
    messageId: string,
    content: string,
  ): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      const message = session.messages.find((m) => m.id === messageId)
      if (message) {
        message.content = content
        session.updatedAt = Date.now()
        this.saveSessions()
        return true
      }
    }
    return false
  }

  // 搜索消息
  searchMessages(
    query: string,
    sessionId?: string,
  ): { sessionId: string; message: ChatMessage }[] {
    const sessions = sessionId
      ? ([this.sessions.get(sessionId)].filter(Boolean) as ChatSession[])
      : this.getAllSessions()
    const results: { sessionId: string; message: ChatMessage }[] = []

    for (const session of sessions) {
      for (const message of session.messages) {
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({ sessionId: session.id, message })
        }
      }
    }

    return results
  }

  // 导出会话数据
  exportSession(
    sessionId: string,
  ): { session: ChatSession; messages: ChatMessage[] } | null {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return null
    }

    return {
      session: { ...session },
      messages: [...session.messages],
    }
  }

  // 导入会话数据
  importSession(sessionData: {
    session: ChatSession
    messages: ChatMessage[]
  }): boolean {
    try {
      const { session, messages } = sessionData

      // 确保没有ID冲突
      if (this.sessions.has(session.id)) {
        return false
      }

      // 创建新会话
      const newSession: ChatSession = {
        ...session,
        messages: [...messages],
        updatedAt: Date.now(),
      }

      this.sessions.set(newSession.id, newSession)
      this.saveSessions()
      return true
    } catch (error) {
      console.error('导入会话失败:', error)
      return false
    }
  }

  // 设置配置
  setConfig(config: {
    maxMessagesPerSession?: number
    maxContextMessages?: number
  }): void {
    if (config.maxMessagesPerSession !== undefined) {
      this.maxMessagesPerSession = config.maxMessagesPerSession
    }
    if (config.maxContextMessages !== undefined) {
      this.maxContextMessages = config.maxContextMessages
    }
  }

  // 获取配置
  getConfig(): { maxMessagesPerSession: number; maxContextMessages: number } {
    return {
      maxMessagesPerSession: this.maxMessagesPerSession,
      maxContextMessages: this.maxContextMessages,
    }
  }

  // 导出所有会话数据
  exportAllSessions(): {
    sessions: ChatSession[]
    currentSessionId: string | null
  } {
    return {
      sessions: Array.from(this.sessions.values()),
      currentSessionId: this.currentSessionId,
    }
  }

  // 导入所有会话数据
  async importAllSessions(data: {
    sessions: ChatSession[]
    currentSessionId?: string | null
  }): Promise<boolean> {
    try {
      // 清空当前会话
      this.sessions.clear()
      this.currentSessionId = null

      // 导入新会话
      for (const session of data.sessions) {
        this.sessions.set(session.id, { ...session })
      }

      if (data.currentSessionId) {
        this.currentSessionId = data.currentSessionId
      } else if (data.sessions.length > 0) {
        this.currentSessionId = data.sessions[0].id
      }

      await this.saveSessions()
      return true
    } catch (error) {
      console.error('导入所有会话失败:', error)
      return false
    }
  }
}

// 导出单例实例
export const messageManager = new MessageManager()
