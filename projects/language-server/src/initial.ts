import { fromNullable } from 'fp-ts/Option'
import prop from 'ramda/es/prop'
import { DidChangeConfigurationNotification, TextDocumentSyncKind } from 'vscode-languageserver/node'

import { type Context } from './context'

export const onInitialize = (cont: Context) => {
	const { connection: conn, capabilities: caps } = cont
	conn.onInitialize(({ capabilities, workspaceFolders }) => {
		cont.workspaceFolders = fromNullable(workspaceFolders)
		conn.console.log(`[Server(${process.pid})] Started and initialize received`)
		conn.console.log(
			`[Server(${process.pid})] workspaceFolders ${(workspaceFolders?.map(prop('uri')) || []).join(',')}`,
		)
		caps.hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration)
		caps.hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders)
		caps.hasDiagnosticRelatedInformationCapability = !!(
			capabilities.textDocument &&
			capabilities.textDocument.publishDiagnostics &&
			capabilities.textDocument.publishDiagnostics.relatedInformation
		)
		return {
			capabilities: {
				textDocumentSync: TextDocumentSyncKind.Incremental,
				// Tell the client that this server supports code completion.
				completionProvider: {
					resolveProvider: true,
				},
				diagnosticProvider: {
					interFileDependencies: false,
					workspaceDiagnostics: false,
				},
				workspace: caps.hasWorkspaceFolderCapability
					? {
							workspaceFolders: {
								supported: true,
							},
						}
					: undefined,
			},
		}
	})
}

export const onInitialized = (cont: Context) => {
	const { connection: conn, capabilities: caps } = cont
	conn.onInitialized(() => {
		if (caps.hasConfigurationCapability) {
			// Register for all configuration changes.
			void conn.client.register(DidChangeConfigurationNotification.type, undefined)
		}
		if (caps.hasWorkspaceFolderCapability) {
			conn.workspace.onDidChangeWorkspaceFolders((_event) => {
				conn.console.log('Workspace folder change event received.')
				conn.window.showInformationMessage('Workspace folder change event received.')
			})
		}
	})
}
