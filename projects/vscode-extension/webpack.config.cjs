'use strict'

const withDefaults = require('../../shared.webpack.config.cjs')
const path = require('path')

module.exports = withDefaults({
	context: path.join(__dirname),
	entry: {
		extension: './src/extension.ts',
	},
	resolve: {
		symlinks: false,
	},
	output: {
		filename: 'extension.js',
		path: path.join(__dirname, '..', '..', 'dist', 'client'),
	},
})
