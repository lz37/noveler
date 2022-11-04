import { IConfig } from './types/types'
export default {
	roles: [
		{
			name: '张三',
			color: {
				light: '#000000',
				dark: '#ffffff',
			},
			description: '在此处添加角色描述，支持markdown语法',
		},
	],
	autoInsert: {
		enabled: false,
		indentionLength: 4,
		spaceLines: 1,
	},
	statusBar: {
		enabled: false,
		timeUnit: 10,
	},
	preview: {
		fontSize: 14,
		indentionLength: 4,
		spaceLines: 1,
	},
} as IConfig
