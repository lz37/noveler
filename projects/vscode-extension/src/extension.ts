/* eslint-disable functional/no-expression-statements */
import * as path from 'path'
import { ExtensionContext, workspace } from 'vscode'
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node'

// eslint-disable-next-line functional/no-let
let client: LanguageClient | undefined = undefined

export async function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(path.join('dist', 'server', 'main.js'))

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
	}

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher('**/.noveler.toml'),
		},
	}

	// Create the language client and start the client.
	client = new LanguageClient('noveler', 'Noveler', serverOptions, clientOptions)

	// Start the client. This will also launch the server
	await client.start()

	void client.sendNotification('noveler/client', 'start')
}

// eslint-disable-next-line functional/functional-parameters
export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined
	}
	return client.stop()
}
