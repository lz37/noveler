import * as vscode from 'vscode'
import * as _ from 'lodash'
import defaultConf from './DefaultConf'

const ProjectName = 'noveler'

class Config {
	update = (extension = ProjectName) => {
		this._value = vscode.workspace.getConfiguration().get(extension) as IConfig
		return this.value
	}
	updateSettingsJson = (setting: IConfig, extension = ProjectName) => {
		vscode.workspace.getConfiguration().update(extension, setting, vscode.ConfigurationTarget.Workspace)
		this.update()
	}
	private _value: IConfig
	get value() {
		return this._value
	}
	constructor(extension = ProjectName) {
		this._value = this.update(extension)
		if (_.isEmpty(this.value)) {
			vscode.workspace.getConfiguration().update(extension, defaultConf, vscode.ConfigurationTarget.Workspace)
			this._value = defaultConf
			const plaintestConf = vscode.workspace.getConfiguration('', { languageId: 'plaintext' })
			plaintestConf.update('editor.wrappingIndent', 'none', vscode.ConfigurationTarget.Workspace, true)
			plaintestConf.update('editor.autoIndent', 'none', vscode.ConfigurationTarget.Workspace, true)
		}
	}
}

export default new Config(ProjectName)
