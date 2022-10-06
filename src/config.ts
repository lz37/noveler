import * as vscode from 'vscode'
import * as _ from 'lodash'

class Config {
	private _value: IConfig
	public get value() {
		return this._value
	}
	private set value(value) {
		this._value = value
	}
	public constructor(extension = ProjectName) {
		this._value = vscode.workspace.getConfiguration().get(extension) as IConfig
		if (_.isEmpty(this.value)) {
			// @todo 使用默认配置初始化
		}
	}
}

export default new Config('noveler')
