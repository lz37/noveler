import * as vscode from 'vscode'
import defaultConf from './DefaultConf'

const ProjectName = 'noveler'

class Config {
	/**更新this.value */
	update = (extension = ProjectName) => {
		this._value = vscode.workspace.getConfiguration().get(extension) as IConfig
		return this.value
	}
	/**更新workplace的settings.json文件 */
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
		if (Object.keys(this.value).length===0) {
			vscode.workspace.getConfiguration().update(extension, defaultConf, vscode.ConfigurationTarget.Workspace)
			this._value = defaultConf
			const plaintestConf = vscode.workspace.getConfiguration('', { languageId: 'plaintext' })
			plaintestConf.update('editor.wrappingIndent', 'none', vscode.ConfigurationTarget.Workspace, true)
			plaintestConf.update('editor.autoIndent', 'none', vscode.ConfigurationTarget.Workspace, true)
		}
	}
}

export default new Config(ProjectName)
