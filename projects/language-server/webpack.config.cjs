'use strict'

const withDefaults = require('../../shared.webpack.config.cjs')
const path = require('path')

module.exports = withDefaults({
	context: path.join(__dirname),
	entry: {
		extension: './src/main.ts',
	},
	resolve: {
		symlinks: false,
	},
	output: {
		filename: 'main.js',
		path: path.join(__dirname, '..', '..', 'dist', 'server'),
	},
})
