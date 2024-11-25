import { constants } from 'common'
import { cosmiconfig } from 'cosmiconfig'
import { loadToml } from 'cosmiconfig-toml-loader'
import { none, type Option } from 'fp-ts/Option'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { createConnection, ProposedFeatures, TextDocuments, type WorkspaceFolder } from 'vscode-languageserver/node'

export const context = {
	connection: createConnection(ProposedFeatures.all),
	documents: new TextDocuments(TextDocument),
	capabilities: {
		hasConfigurationCapability: false,
		hasWorkspaceFolderCapability: false,
		hasDiagnosticRelatedInformationCapability: false,
	},
	workspaceFolders: <Option<WorkspaceFolder[]>>none,
	explorer: cosmiconfig(constants.moduleName, {
		searchPlaces: constants.configPaths,
		searchStrategy: 'global',
		loaders: {
			'.toml': loadToml,
		},
	}),
	moduleName: constants.moduleName,
}

export type Context = typeof context
