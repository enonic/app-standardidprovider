const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    context: path.join(__dirname, '/src/main/resources/assets'),
    entry: {
        main: './js/main.js'
    },
    output: {
        path: path.join(__dirname, '/build/resources/main/assets'),
        filename: './js/_all.js',
        assetModuleFilename: './[file]'
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    {loader: MiniCssExtractPlugin.loader, options: {publicPath: '../'}},
                    {loader: 'css-loader', options: {sourceMap: !isProd, importLoaders: 1}},
                    {loader: 'postcss-loader', options: {sourceMap: !isProd}},
                    {loader: 'less-loader', options: {sourceMap: !isProd}},
                ]
            },
            {
                test: /background.jpg$/,
                type: "asset",
                use: [
                    {
                        loader: ImageMinimizerPlugin.loader,
                        options: {
                            deleteOriginalAssets: true,
                            filename: "[path][name].webp",
                            minimizerOptions: {
                                plugins: ["imagemin-webp"],
                            },
                        },
                    }
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: {
                        drop_console: false
                    },
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './styles/_all.css',
            chunkFilename: './styles/_all.css'
        })
    ],
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map'
};
