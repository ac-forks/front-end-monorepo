const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { DuplicatesPlugin } = require('inspectpack/plugin')
const path = require('path')
const PeerDepsExternalsPlugin = require('peer-deps-externals-webpack-plugin')

const plugins = [
  new CleanWebpackPlugin(),
  new PeerDepsExternalsPlugin()
]

if (process.env.ANALYZE === 'true') {
  plugins.push(new DuplicatesPlugin())
}

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    library: '@zooniverse/react-components',
    libraryTarget: 'umd',

    // Workaround for webpack/webpack#6522
    globalObject: `typeof self !== 'undefined' ? self : this`
  },
  plugins,
  resolve: {
    alias: {
      inherits: path.resolve(__dirname, '../../node_modules/inherits'),
    },
    extensions: ['.js', '.jsx', '.json']
  }
}
