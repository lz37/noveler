import { Context } from './context'

let clientStarted = false

export const isClientStarted = (arg: Context | Context['connection']) => {
	const connection = arg instanceof Context ? arg.connection : arg
	connection.onNotification('noveler/client', () => {
		clientStarted = true
	})
	return clientStarted
}
