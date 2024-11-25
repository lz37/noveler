import { type Context } from './context'

export const listen = (context: Context) => {
	context.documents.listen(context.connection)
	context.connection.listen()
}
