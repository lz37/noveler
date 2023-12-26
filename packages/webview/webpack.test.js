const commonConf = require('./webpack.common')
const path = require('path')
/** @type {import('webpack').Configuration} WebpackConfig **/
module.exports = {
  ...commonConf,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../out', 'app'),
  },
}
