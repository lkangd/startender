const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    background: ['@babel/polyfill', '@/utils/hot-reload', '@/background'],
    content: ['@babel/polyfill', '@/content'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: path.resolve('/'),
  },
  resolve: {
    extensions: ['.js', '.less', '.vue', '.json', '.png'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, '../src'),
      '@img': path.resolve(__dirname, '../src/assets/img'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            hotReload: false, // 关闭热重载
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/, // 只是节约打包时间，这些文件夹内的js不会babal处理
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@vue/babel-preset-jsx'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: Infinity,
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(less|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../',
            },
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: path.resolve(__dirname, './'),
              },
            },
          },
          {
            loader: 'less-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({ $: 'jquery' }),
    new MiniCssExtractPlugin({ filename: 'main.css', chunkFilename: '[id].css' }),
    new CopyPlugin([
      { from: path.resolve(__dirname, '../static'), to: path.resolve(__dirname, '../dist') },
      { from: path.resolve(__dirname, '../manifest.json'), to: path.resolve(__dirname, '../dist/manifest.json') },
    ]),
  ],
};
