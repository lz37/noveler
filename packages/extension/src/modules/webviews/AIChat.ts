import * as vscode from 'vscode'
import { createWebviewHtml } from 'common/utils'
import {
  AIChatDto,
  AIChatExtRecDto,
  ChatMessage,
  Commands,
  Theme,
  ApiProvider,
  Model,
} from 'common/types'
import {
  newAIResponse,
  getAIConfig,
  colorThemeKind2Theme,
  stopCurrentRequest,
} from '../ai'
import { messageManager, ChatSession } from '../ai/messageManager'
import { log } from 'console'

let currentPanel: vscode.WebviewPanel | undefined = undefined
let context: vscode.ExtensionContext | undefined = undefined
let disposables: vscode.Disposable[] | undefined = undefined

// 获取选中文本及其上下文
const getSelectedTextWithContext = (): string | null => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return null

  const selection = editor.selection
  if (selection.isEmpty) return null

  const selectedText = editor.document.getText(selection)
  const document = editor.document

  // 获取选中文本的起始和结束位置
  const startLine = selection.start.line
  const endLine = selection.end.line

  // 计算上下文范围（前后各100字）
  const contextStartChar = Math.max(0, selection.start.character - 100)
  const contextEndChar = Math.min(
    document.lineAt(endLine).text.length,
    selection.end.character + 100,
  )

  // 如果选中文本在同一行
  if (startLine === endLine) {
    const lineText = document.lineAt(startLine).text
    return lineText.substring(contextStartChar, contextEndChar)
  }

  // 如果选中文本跨越多行
  let contextText = ''

  // 第一行（从上下文起始位置到行尾）
  contextText +=
    document.lineAt(startLine).text.substring(contextStartChar) + '\n'

  // 中间的所有行
  for (let i = startLine + 1; i < endLine; i++) {
    contextText += document.lineAt(i).text + '\n'
  }

  // 最后一行（从行首到上下文结束位置）
  contextText += document.lineAt(endLine).text.substring(0, contextEndChar)

  return contextText
}

// 获取当前激活编辑器的所有文本
const getContentText = (): string | null => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return null

  return editor.document.getText()
}

// 获取当前段落文本
const getParagraphText = (): string | null => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return null

  const document = editor.document
  const position = editor.selection.active

  // 获取当前行
  const currentLine = document.lineAt(position.line)

  // 简单的段落定义：以空行分隔的文本块
  // 向上查找段落开始
  let paragraphStart = position.line
  while (paragraphStart > 0) {
    const prevLine = document.lineAt(paragraphStart - 1)
    if (prevLine.text.trim() === '') {
      break
    }
    paragraphStart--
  }

  // 向下查找段落结束
  let paragraphEnd = position.line
  const lineCount = document.lineCount
  while (paragraphEnd < lineCount - 1) {
    const nextLine = document.lineAt(paragraphEnd + 1)
    if (nextLine.text.trim() === '') {
      break
    }
    paragraphEnd++
  }

  // 提取段落文本
  let paragraphText = ''
  for (let i = paragraphStart; i <= paragraphEnd; i++) {
    paragraphText += document.lineAt(i).text
    if (i < paragraphEnd) {
      paragraphText += '\n'
    }
  }

  return paragraphText
}

// 获取选中的文本
const getSelectedText = (): string | null => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return null

  const selection = editor.selection
  if (selection.isEmpty) return null

  return editor.document.getText(selection)
}

// 替换prompt模板中的占位符
const replacePromptPlaceholders = (template: string): string => {
  const selectedText = getSelectedText() || ''
  const selectedTextWithContext = getSelectedTextWithContext() || ''
  const contentText = getContentText() || ''
  const paragraphText = getParagraphText() || ''

  return template
    .replace(/\${selectedText}/g, selectedText)
    .replace(/\${selectedTextWithContext}/g, selectedTextWithContext)
    .replace(/\${contentText}/g, contentText)
    .replace(/\${paragraphText}/g, paragraphText)
}

const init = async (cnt: vscode.ExtensionContext) => {
  context = cnt
  disposables = []

  // 初始化消息管理器
  await messageManager
    .initialize()
    .then(() => {
      console.log('消息管理器初始化完成')
    })
    .catch((error) => {
      console.error('消息管理器初始化失败:', error)
    })

  const panel = vscode.window.createWebviewPanel(
    'NovelerAIChat',
    'AI 助手',
    vscode.ViewColumn.Two, // 改为右侧显示
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  )

  panel.webview.html = createWebviewHtml('/ai-chat', panel.webview, context)

  // 等待一秒，确保webview完全加载
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 发送初始数据
  const themeKind = colorThemeKind2Theme(vscode.window.activeColorTheme.kind)
  sendInitialData(themeKind)

  panel.webview.onDidReceiveMessage(
    (message: AIChatExtRecDto) => {
      handleWebviewMessage(message)
    },
    null,
    disposables,
  )

  panel.onDidDispose(
    () => {
      currentPanel = undefined
      // Clean up our resources
      panel.dispose()
      while (disposables?.length) {
        const x = disposables.pop()
        if (x) x.dispose()
      }
    },
    null,
    disposables,
  )

  // 监听主题变化
  vscode.window.onDidChangeActiveColorTheme(
    () => {
      const themeKind = colorThemeKind2Theme(
        vscode.window.activeColorTheme.kind,
      )
      sendThemeUpdate(themeKind)
    },
    null,
    disposables,
  )

  return panel
}

const showWebview = async (context: vscode.ExtensionContext) => {
  // 获取当前编辑器的列位置
  const activeEditorColumn = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : vscode.ViewColumn.One

  if (currentPanel) {
    // 如果面板已存在，显示在右侧，并保持当前编辑器焦点
    currentPanel.reveal(vscode.ViewColumn.Two)

    // 保持当前编辑器的焦点
    if (vscode.window.activeTextEditor) {
      await vscode.window.showTextDocument(
        vscode.window.activeTextEditor.document,
        activeEditorColumn,
      )
    }
  } else {
    currentPanel = await init(context)

    // 创建面板后，保持当前编辑器的焦点
    if (vscode.window.activeTextEditor) {
      await vscode.window.showTextDocument(
        vscode.window.activeTextEditor.document,
        activeEditorColumn,
      )
    }
  }
}

const postQuestion = async (question: string) => {
  // 发送问题到 webview
  if (currentPanel) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }

    // 发送用户消息到 webview
    currentPanel.webview.postMessage({
      type: 'message',
      message: message,
    })

    console.log('postMessage', question, message)

    // 添加到消息管理器并处理
    messageManager.addMessage(message)
    const session = messageManager.getCurrentSession()
    if (session) {
      newAIResponse(message, currentPanel!, session.messages)
    }
  }
}

const sendInitialData = (themeKind: Theme) => {
  if (currentPanel) {
    let session = messageManager.getCurrentSession()

    // 如果没有当前会话，创建一个默认会话
    if (!session) {
      session = messageManager.createSession('默认对话')
    }

    const dto: AIChatDto = {
      messages: session ? session.messages : [],
      themeKind,
    }
    currentPanel.webview.postMessage(dto)
  }
}

const sendThemeUpdate = (themeKind: Theme) => {
  if (currentPanel) {
    currentPanel.webview.postMessage({
      type: 'theme-update',
      themeKind,
    })
  }
}

const handleWebviewMessage = (message: AIChatExtRecDto) => {
  switch (message.type) {
    case 'getConfig': { // 发送配置到 webview
      const config = getAIConfig()
      if (currentPanel) {
        currentPanel.webview.postMessage({
          type: 'config',
          config,
        })
      }
      break
    }
    case 'saveConfig': {
      // 保存配置
      const configToSave = message.config
      console.log('收到保存配置:', configToSave)

      if (configToSave) {
        // 保存多提供商配置
        if (configToSave.apiProviders) {
          vscode.workspace
            .getConfiguration('noveler')
            .update('ai.apiProviders', configToSave.apiProviders)
        }

        // 保存选中的提供商和模型
        if (configToSave.selectedProviderId !== undefined) {
          vscode.workspace
            .getConfiguration('noveler')
            .update('ai.selectedProviderId', configToSave.selectedProviderId)
        }

        if (configToSave.selectedModelId !== undefined) {
          vscode.workspace
            .getConfiguration('noveler')
            .update('ai.selectedModelId', configToSave.selectedModelId)
        }

        // 保存prompts配置
        if (configToSave.prompts) {
          vscode.workspace
            .getConfiguration('noveler')
            .update('ai.prompts', configToSave.prompts)
        }

        vscode.window.showInformationMessage('AI 配置已保存')
      }
      break
    }
    case 'message':
      // 处理用户消息
      if (message.message) {
        messageManager.addMessage(message.message)
        const session = messageManager.getCurrentSession()
        log(
          '收到用户消息:',
          message.message,
          '所有消息:',
          session ? session.messages : [],
        )

        if (session) {
          newAIResponse(message.message, currentPanel!, session.messages)
        }
      }
      break
    case 'clear':
      // 清空当前会话的消息
      messageManager.clearCurrentSession()
      if (currentPanel) {
        currentPanel.webview.postMessage({
          type: 'cleared',
        })
      }
      break
    case 'newSession':
      // 创建新会话
      createNewSession()
      break
    case 'stop':
      // 停止当前的AI响应
      stopCurrentRequest()
      break
  }
}

// 创建新会话
const createNewSession = () => {
  const session = messageManager.createSession('新对话')
  messageManager.switchSession(session.id)
  // 如果有打开的webview，发送新会话消息
  if (currentPanel) {
    // 添加分割线消息表示新会话开始
    const dividerMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `———————————— ${session.title} ————————————`,
      timestamp: Date.now(),
    }

    // 发送分割线消息到webview
    currentPanel.webview.postMessage({
      type: 'message',
      message: dividerMessage,
    })
  }
  // vscode.window.showInformationMessage(`已创建新对话: ${session.title}`)
}

// 通用AI命令处理函数
const handleAICommand = async (
  context: vscode.ExtensionContext,
  promptType:
    | 'randomName'
    | 'wordReplace'
    | 'continueWriting'
    | 'characterDesign',
) => {
  createNewSession()
  const editor = vscode.window.activeTextEditor

  const config = getAIConfig()
  let prompt = ''

  if (!editor || editor.selection.isEmpty) {
    // 未选中文本的情况
    prompt = config.prompts?.[promptType]?.withoutSelection || ''
  } else {
    // 有选中文本的情况
    prompt = config.prompts?.[promptType]?.withSelection || ''
  }

  // 检查prompt是否为空
  if (prompt === '') {
    vscode.window.showErrorMessage(`配置错误：${promptType} 提示词不能为空`)
    return
  }

  // 替换prompt模板中的占位符
  const question = replacePromptPlaceholders(prompt)

  await showWebview(context)
  await postQuestion(question)
}

export const provider = (context: vscode.ExtensionContext) => {
  return {
    command: vscode.commands.registerCommand(Commands.AIChat, async () => {
      await showWebview(context)
    }),
    commandRandomName: vscode.commands.registerCommand(
      Commands.AIRandomName,
      async () => {
        await handleAICommand(context, 'randomName')
      },
    ),
    commandWordReplace: vscode.commands.registerCommand(
      Commands.AIWordReplace,
      async () => {
        await handleAICommand(context, 'wordReplace')
      },
    ),
    commandContinueWriting: vscode.commands.registerCommand(
      Commands.AIContinueWriting,
      async () => {
        await handleAICommand(context, 'continueWriting')
      },
    ),
    commandCharacterDesign: vscode.commands.registerCommand(
      Commands.AICharacterDesign,
      async () => {
        await handleAICommand(context, 'characterDesign')
      },
    ),
  }
}

// 导出showWebview函数，以便其他模块可以直接调用
export { showWebview }
