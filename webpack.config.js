const webpack = require('webpack') // eslint-disable-line no-unused-vars
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
    context: __dirname,
    entry: {
        main: './main.js',
        index1: './index1.js',
        'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
    },
    mode: 'none',
    output: {
        path: path.join(__dirname, './build/'),
        publicPath: './build/',
        filename: 'script/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(
                        __dirname,
                        './node_modules/pdfjs-dist/cmaps'
                    ),
                    to: 'cmaps'
                }
            ]
        })
    ],
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
}
