const path                     = require('path')
const HTMLWebpackPlugin        = require('html-webpack-plugin')
const { CleanWebpackPlugin }   = require('clean-webpack-plugin')
const CopyWebpackPlugin        = require('copy-webpack-plugin')
const MiniCssExtractPlugin     = require('mini-css-extract-plugin')
const CssMinimizerWepackPlugin = require('css-minimizer-webpack-plugin')

const isDev  = process.env.NODE_ENV === "development";
const isProd = !isDev

const styleName = isDev ? '[local]__[hash:8]' : '[hash:base64]'
const filename = (ext, isShort=false) => {
  if (isDev) {
    return `[name]${ext}`
  } else {
    return isShort ? `[hash]${ext}` : `[name].[hash]${ext}`
  }
}

const getStyleLoaders = ({ isModule, options, extra }) => {
  const loaders = [
    MiniCssExtractPlugin.loader,
    isModule
    ? {
      loader: 'css-loader',
      options
    }
    : 'css-loader'
  ]
  if (extra) {
    loaders.push(extra)
  }
  return loaders
}

const plugins = [
  new HTMLWebpackPlugin({
    template: './src/index.html'
  }),
  new CleanWebpackPlugin(),
  // new CopyWebpackPlugin({
  //   patterns: [
  //     {
  //       from: path.resolve(__dirname, 'src/assets/favicon.ico'),
  //       to: path.resolve(__dirname, 'dist')
  //     }
  //   ],
  // }),
  new MiniCssExtractPlugin({
      filename: filename('.css'),
  }),
]
if (isProd) plugins.push(new CssMinimizerWepackPlugin())


module.exports = {
  // context: path.resolve(__dirname, 'src'),
  entry: {
    main: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: filename('.js'),
    assetModuleFilename: filename('[ext]', true),
    // publicPath: 'dist/'
  },
  resolve: {
    extensions: ['.js', '.png', 'jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@p': path.resolve(__dirname, 'src/pages'),
      '@s': path.resolve(__dirname, 'src/store'),
      '@c': path.resolve(__dirname, 'src/components')
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // CSS loaders
      {
        test: /\.module\.css$/,
        use: getStyleLoaders({
          isModule: true,
          options: {
            modules: {
              localIdentName: styleName
            }
          },
        })
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: getStyleLoaders({
          isModule: false
        })
      },
      // SCSS loaders
      {
        test: /\.s[ac]ss$/,
        exclude: /\.module\.s[ac]ss$/,
        use: getStyleLoaders({
          isModule: false,
          extra: 'sass-loader'
        })
      },
      {
        test: /\.module\.s[ac]ss$/,
        use: getStyleLoaders({
          isModule: true,
          options: {
            importLoaders: 1,
            modules: {
              localIdentName: styleName
            }
          },
          extra: 'sass-loader'
        })
      },
      {
        test: /\.(png|jpe?g|svg|gif|ttf|woff2?|eot)$/,
        type: 'asset/resource'
      },
    ]
  },
  devServer: {
    port: 4000,
    historyApiFallback: true,
    hot: isDev
  },
  devtool: isDev ? 'source-map' : false
}