const webpack = require('webpack');
const path = require('path');

const BabelPresetEnv = require('@babel/preset-env');

const targets = { browsers: ['> 1%', 'last 2 versions'] };

module.exports = {
  devtool: 'inline-eval-source-map',
  entry: [
    './lib/index.js',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'qs.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      path.join(__dirname, 'node_modules'),
    ],
    alias: {},
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [BabelPresetEnv, { targets }],
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-export-namespace-from',
              '@babel/plugin-proposal-export-default-from',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
            ].map(require.resolve),
          }
        },
      },
    ],
  },
  plugins: [],
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
};
