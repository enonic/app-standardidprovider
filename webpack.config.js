const ErrorLoggerPlugin = require('error-logger-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: `${__dirname}/src/main/resources/assets`,
    entry: {
        main: './js/main.js'
    },
    output: {
        path: `${__dirname}/build/resources/main/assets/`,
        filename: './js/_all.js'
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { url: false, sourceMap: true, importLoaders: 1 } },
                        { loader: 'postcss-loader', options: { sourceMap: true, config: { path: 'postcss.config.js' } } },
                        { loader: 'less-loader', options: { sourceMap: true } }
                    ]
                })
            }
        ]
    },
    plugins: [
        new ErrorLoggerPlugin(),
        new ExtractTextPlugin({
            filename: './styles/_all.css',
            allChunks: true,
            disable: false
        })
    ]
};
