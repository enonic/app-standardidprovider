const ErrorLoggerPlugin = require('error-logger-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    context: path.join(__dirname, '/src/main/resources/assets'),
    entry: {
        main: './js/main.js'
    },
    output: {
        path: path.join(__dirname, '/build/resources/main/assets/'),
        filename: './js/_all.js'
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { sourceMap: !isProd, importLoaders: 1, url: false } },
                        { loader: 'postcss-loader', options: { sourceMap: !isProd, config: { path: 'postcss.config.js' } } },
                        { loader: 'less-loader', options: { sourceMap: !isProd } }
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
        }),
        ...(isProd ? [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    mangle: false,
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ] : [])
    ],
    devtool: isProd ? false : 'source-map'
};
