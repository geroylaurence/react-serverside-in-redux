const path = require('path');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  name: 'client',
  target: 'web',
  devtool: 'eval',
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
    'react-hot-loader/patch',
    'babel-polyfill',
    path.resolve(__dirname, '../client/index.js'),
  ],
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, '../buildClient'),
    publicPath: '/static/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|assets/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      { // Assets
        test: /assets/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/static',
              name: '[name].[ext]'
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.css'],
  },
  plugins: [
    new WriteFilePlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common'], // needed to put webpack bootstrap code before chunks
      filename: '[name].js',
      minChunks: Infinity,
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        HTTP_HEADER_CLIENT_TOKEN: JSON.stringify('web'),
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};
