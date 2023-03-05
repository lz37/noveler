import * as vscode from 'vscode'
import * as confHandler from '@/modules/ConfigHandler'
import Commands from '@/state/Commands'

const targetFiles = ['plaintext', 'markdown']

let context: vscode.ExtensionContext | undefined = undefined
export const setContext = (cont: vscode.ExtensionContext) => {
  context = cont
}

const keys = new Map<
  string,
  {
    desc?: string
    prefix: string
    kind?: vscode.CompletionItemKind
  }
>()
export const reset = () => {
  keys.clear()
}
export const setKeys = (
  key: string,
  prefix: string,
  hoverKey?: string,
  kind?: CompletionItemKindKeys,
) => {
  const completionItemKind = kind ? vscode.CompletionItemKind[kind] : undefined
  keys.set(key, { desc: hoverKey, prefix, kind: completionItemKind })
}

let provider: vscode.Disposable | undefined = undefined
export const updateProvider = () => {
  if (!context) return
  if (provider) provider.dispose()
  const conf = confHandler.get()
  provider = vscode.languages.registerCompletionItemProvider(
    targetFiles,
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
      ) {
        const linePrefix = document
          .lineAt(position)
          .text.substr(0, position.character)
        const conf = confHandler.get()
        if (!linePrefix.endsWith(conf.completionChar)) {
          return undefined
        }
        const command = {
          command: Commands.DeletePrefix,
          title: 'Delete Prefix',
          arguments: [position, conf.completionChar.length],
        }
        const items: vscode.CompletionItem[] = []
        keys.forEach(({ desc, kind, prefix }, key) => {
          const item = new vscode.CompletionItem(`${prefix}${key}`, kind)
          item.command = command
          item.insertText = key
          if (desc) {
            const hover = new vscode.MarkdownString(desc)
            item.documentation = hover
          }
          items.push(item)
        })
        return items
      },
    },
    conf.completionChar,
  )
  context.subscriptions.push(provider)
}

export const deletePrefixCommand = vscode.commands.registerCommand(
  Commands.DeletePrefix,
  (position: vscode.Position, num: number) => {
    const editor = vscode.window.activeTextEditor
    // 删除
    editor?.edit((editBuilder) => {
      editBuilder.delete(
        new vscode.Range(
          new vscode.Position(position.line, position.character - num),
          new vscode.Position(position.line, position.character),
        ),
      )
    })
  },
)
