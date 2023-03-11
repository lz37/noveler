const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const commonConf = require('./webpack.common')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap({
  ...commonConf,
  plugins: [...commonConf.plugins, new BundleAnalyzerPlugin()],
})
