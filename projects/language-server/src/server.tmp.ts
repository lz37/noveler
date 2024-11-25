import { completion } from './completion'
import { deleteClosedDocumentSettings, onDidChangeConfiguration } from './config'
import context, { Context } from './context'
import { diagnostics } from './diagnostics'
import { onInitialize, onInitialized } from './initial'
import { listen } from './listen'
import { onDidChangeWatchedFiles } from './watchFiles'

const main = (cont: Context) => {
	onInitialized(cont)
	onDidChangeConfiguration(cont)
	deleteClosedDocumentSettings(cont)
	diagnostics(cont)
	onDidChangeWatchedFiles(cont)
	completion(cont)
	onInitialize(cont)

	listen(cont)
}

main(context)
