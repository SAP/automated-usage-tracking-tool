const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  mode: 'development',
  plugins: [
    // Inject AOA credentials at build time from environment variables.
    // Run: AOA_CLIENT_ID=xxx AOA_CLIENT_SECRET=yyy npm run build
    new webpack.DefinePlugin({
      'process.env.AOA_CLIENT_ID': JSON.stringify(process.env.AOA_CLIENT_ID || ''),
      'process.env.AOA_CLIENT_SECRET': JSON.stringify(process.env.AOA_CLIENT_SECRET || ''),
      'process.env.AOA_TOKEN_URL': JSON.stringify(process.env.AOA_TOKEN_URL || ''),
      'process.env.AOA_API_URL': JSON.stringify(process.env.AOA_API_URL || ''),
    }),
  ],
}
