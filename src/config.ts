import * as vscode from 'vscode'
import * as _ from 'lodash'

class Config {
	public readonly value: IConfig
	public constructor(extension = ProjectName) {
		this.value = vscode.workspace.getConfiguration().get(extension) as IConfig
		if (_.isEmpty(this.value)) {
			// @todo 使用默认配置初始化
		}
	}
}

export default new Config()
