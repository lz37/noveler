import { type TextDocument } from 'vscode-languageserver-textdocument'
import {
	DiagnosticSeverity,
	DocumentDiagnosticReport,
	DocumentDiagnosticReportKind,
	type Diagnostic,
} from 'vscode-languageserver/node'

import { getDocumentSettings } from './config'
import { type Context } from './context'

export const diagnostics = (context: Context) => {
	const { documents, connection } = context
	connection.languages.diagnostics.on(async (params) => {
		const document = documents.get(params.textDocument.uri)
		if (document !== undefined) {
			return {
				kind: DocumentDiagnosticReportKind.Full,
				items: await validateTextDocument(context)(document),
			} satisfies DocumentDiagnosticReport
		} else {
			// We don't know the document. We can either try to read it from disk
			// or we don't report problems for it.
			return {
				kind: DocumentDiagnosticReportKind.Full,
				items: [],
			} satisfies DocumentDiagnosticReport
		}
	})
	// The content of a text document has changed. This event is emitted
	// when the text document first opened or when its content has changed.
	documents.onDidChangeContent((change) => {
		void validateTextDocument(context)(change.document)
	})
}

const validateTextDocument =
	(context: Context) =>
	async (textDocument: TextDocument): Promise<Diagnostic[]> => {
		// In this simple example we get the settings for every validate run.
		const settings = await getDocumentSettings(context)(textDocument)

		// The validator creates diagnostics for all uppercase words length 2 and more
		const text = textDocument.getText()
		const pattern = /\b[A-Z]{2,}\b/g
		let m: RegExpExecArray | null

		let problems = 0
		const diagnostics: Diagnostic[] = []
		while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
			problems++
			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Warning,
				range: {
					start: textDocument.positionAt(m.index),
					end: textDocument.positionAt(m.index + m[0].length),
				},
				message: `${m[0]} is all uppercase.`,
				source: '666',
			}
			if (context.capabilities.hasDiagnosticRelatedInformationCapability) {
				diagnostic.relatedInformation = [
					{
						location: {
							uri: textDocument.uri,
							range: Object.assign({}, diagnostic.range),
						},
						message: 'Spelling matters',
					},
					{
						location: {
							uri: textDocument.uri,
							range: Object.assign({}, diagnostic.range),
						},
						message: 'Particularly for names',
					},
				]
			}
			diagnostics.push(diagnostic)
		}
		return diagnostics
	}
