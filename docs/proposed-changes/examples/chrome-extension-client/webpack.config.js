const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: {
    'content-script': './src/tracker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
  },
  mode: 'production',
  plugins: [
    // Load .env file and inject variables at build time
    new Dotenv(),
    // Also support explicit env vars (CI/CD)
    new webpack.DefinePlugin({
      'process.env.REACT_APP_AOA_CLIENT_ID': JSON.stringify(process.env.REACT_APP_AOA_CLIENT_ID || ''),
      'process.env.REACT_APP_AOA_CLIENT_SECRET': JSON.stringify(process.env.REACT_APP_AOA_CLIENT_SECRET || ''),
      'process.env.REACT_APP_AOA_API_URL': JSON.stringify(process.env.REACT_APP_AOA_API_URL || ''),
    }),
  ],
  // Copy static files to build directory
  module: {
    rules: [],
  },
}
