import * as vscode from 'vscode'

const updateConfAndGetItems = (conf?: ICompletion[]) => {
	const completionItems: vscode.CompletionItem[] = []
	conf?.forEach((completion) => {
		// 正则检查是否包含${...}
		const needSnippet = completion.context.search(/\$\{.*\}/) !== -1
		const text = needSnippet ? new vscode.SnippetString(completion.context) : completion.context
		completionItems.push({
			label: completion.title,
			kind: vscode.CompletionItemKind[completion.kind],
			insertText: text,
			documentation: new vscode.MarkdownString(completion.context),
			command: {
				command: 'noveler.triggerSuggest.after',
				title: 'triggerSuggest.after',
				arguments: [needSnippet],
			},
		})
	})
	return completionItems
}

const updateRolesAndGetItems = (conf?: IRole[]) => {
	const completionItems: vscode.CompletionItem[] = []
	conf?.forEach((role) => {
		completionItems.push({
			label: role.name,
			kind: vscode.CompletionItemKind.User,
			insertText: role.name,
			documentation: new vscode.MarkdownString(role.description),
			command: { command: 'noveler.triggerSuggest.after', title: 'triggerSuggest.after' },
		})
	})
	return completionItems
}

export const updateAndGetProvider = (conf: IConfig) => {
	const userItems = updateConfAndGetItems(conf.completions)
	const rolesItem = updateRolesAndGetItems(conf.roles)
	return vscode.languages.registerCompletionItemProvider('plaintext', {
		provideCompletionItems(document, position, token, context) {
			return [...userItems, ...rolesItem]
		},
	})
}
let suggestPos: vscode.Position | undefined
let isSuggesting = false
export const triggerSuggest = {
	before: vscode.commands.registerCommand('noveler.triggerSuggest.before', () => {
		// 记录光标位置
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}
		// 只对languageId为plaintext的文档生效
		if (editor.document.languageId !== 'plaintext') {
			return
		}
		if (!isSuggesting) {
			isSuggesting = true
			suggestPos = editor.selection.active
			// 插入一个空格，否则suggest为空
			editor.edit((editBuilder) => {
				editBuilder.insert(suggestPos!, ' ')
			})
			// 触发suggest
			vscode.commands.executeCommand('editor.action.triggerSuggest')
		} else {
			vscode.commands.executeCommand('toggleSuggestionDetails')
		}
	}),
	after: vscode.commands.registerCommand('noveler.triggerSuggest.after', (isSnippetString = false) => {
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}
		// 只对languageId为plaintext的文档生效
		if (editor.document.languageId !== 'plaintext') {
			return
		}
		if (!suggestPos) {
			return
		}
		if (isSuggesting) {
			// 删除suggestPos后的空格
			editor.edit((editBuilder) => {
				editBuilder.delete(new vscode.Range(suggestPos!, suggestPos!.translate(0, 1)))
			})
			isSuggesting = false
		}
		if (isSnippetString) {
			// 触发suggest
			vscode.commands.executeCommand('editor.action.triggerSuggest')
		}
	}),
}
