import context, { Context } from './context'

const main = (cont: Context) => {
	cont.documents.listen(context.connection)
	cont.connection.listen()
}

main(context)
