import { Context } from './context'

export const onDidChangeWatchedFiles = (cont: Context) => {
	const { connection } = cont
	connection.onDidChangeWatchedFiles(({ changes }) => {
		changes.map((change) => {
			connection.console.log(`We received a file change event: ${change.uri}`)
		})
		// Monitored files have change in VSCode
		connection.console.log('We received a file change event')
	})
}
