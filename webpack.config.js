const webpack = require('webpack') // eslint-disable-line no-unused-vars
const path = require('path')

module.exports = {
    context: __dirname,
    entry: {
        main: './main.js',
        'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
    },
    mode: 'none',
    output: {
        path: path.join(__dirname, './build/script'),
        publicPath: './build/script/',
        filename: '[name].bundle.js'
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
}
