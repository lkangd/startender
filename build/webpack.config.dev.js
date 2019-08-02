const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');

module.exports = merge(baseWebpackConfig, {
  watch: true,
  mode: 'development',
  devtool: 'inline-source-map',
});
