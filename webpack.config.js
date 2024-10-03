const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const zlib = require("zlib");
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

let input = path.join(__dirname, '/src/main/resources/assets');
let output = path.join(__dirname, '/build/resources/main/assets');
module.exports = {
    context: input,
    entry: {
        main: './js/main.js'
    },
    output: {
        path: output,
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
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            }),
            new ImageMinimizerPlugin({
                generator: [
                    {
                        filter: (source, sourcePath) => sourcePath.match(/images\/background\.jpg$/),
                        type: "asset",
                        implementation: ImageMinimizerPlugin.sharpGenerate,
                        options: {
                            encodeOptions: {
                                webp: {
                                    effort: isProd ? 6 : 0,
                                    preset: 'photo',
                                },
                            },
                        },
                    },
                ],
            }),
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './styles/_all.css',
            chunkFilename: './styles/_all.css'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: path.join(input, 'icons/favicons'), to: path.join(output, 'icons/favicons')},
                {from: path.join(input, 'images'), to: path.join(output, 'images')},
            ],
        }),
        ...(isProd ?  [
                new CompressionPlugin({
                    test: /\.(js|css|svg|ttf|json|ico)$/,
                    algorithm: "gzip",
                    minRatio: Number.MAX_SAFE_INTEGER,
                }),
                new CompressionPlugin({
                    test: /\.(js|css|svg|ttf|json|ico)$/,
                    algorithm: "brotliCompress",
                    compressionOptions: {
                        params: {
                            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                        },
                    },
                    minRatio: Number.MAX_SAFE_INTEGER,
                }),
            ] : []
        ),
    ],
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    performance: {hints: false}
};
