import { type TextDocument } from 'vscode-languageserver-textdocument'

import { type Context } from './context'

const defaultSettings: NovelerSettings = {
	maxNumberOfProblems: 1000,
}
let globalSettings = defaultSettings
const documentSettings = new Map<string, Thenable<NovelerSettings>>()

export const getDocumentSettings =
	({ capabilities, connection }: Context) =>
	(text: TextDocument): Thenable<NovelerSettings> => {
		if (!capabilities.hasConfigurationCapability) return Promise.resolve(globalSettings)
		if (text.languageId !== 'plaintext') return Promise.resolve(globalSettings)

		const result = documentSettings.get(text.uri)
		if (!result) {
			connection.console.log(`Requesting settings for ${text.uri}`)
			const promise = connection.workspace.getConfiguration({
				scopeUri: text.uri,
				section: 'noveler',
			}) as Thenable<NovelerSettings>
			documentSettings.set(text.uri, promise)
			return promise
		}
		return result
	}

export const onDidChangeConfiguration = (cont: Context) => {
	const { connection: conn, capabilities: caps } = cont
	conn.onDidChangeConfiguration((change) => {
		if (caps.hasConfigurationCapability) {
			documentSettings.clear()
		} else {
			globalSettings = (<{ noveler: NovelerSettings | undefined }>change.settings).noveler || defaultSettings
		}
		conn.languages.diagnostics.refresh()
	})
}

/**
 * Only keep settings for open documents
 */
export const deleteClosedDocumentSettings = (cont: Context) => {
	const { documents } = cont
	documents.onDidClose((event) => {
		documentSettings.delete(event.document.uri)
	})
}
