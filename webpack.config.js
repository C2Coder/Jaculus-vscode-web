//@ts-check
'use strict';

const path = require('path');
const copy = require('copy-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const webpack = require('webpack');

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const common = {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            process: "process/browser"
         },
        fallback: {
            "fs": false,
            "path": require.resolve("path-browserify"),
            "zlib": false,
            "crypto": false,
            "stream": false,
            "util": require.resolve('util/'),
            "assert": false,
            "buffer": false,
            "https": false,
            "http": false,
            "os": false,

        }
    },
    externals: {
        vscode: 'commonjs vscode'
    },
    plugins: [
        new NodePolyfillPlugin({
            excludeAliases: ["console", "process"]
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        }),
        new copy({
            patterns: [
                {
                    from: 'node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js'
                }
            ]
        }),
    ]
};

/** @type WebpackConfig[] */
module.exports = [
    {
        ...common,
        target: 'webworker',
        entry: {
            extension: './src/browser/extension.ts'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist', 'browser'),
            libraryTarget: 'commonjs'
        }
    },
    {
        ...common,
        target: 'web',
        entry: {
            devices: './src/views/webusb-view.ts'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist', 'views')
        },
        // plugins: [
        //     new copy({
        //         patterns: [
        //             {
        //                 from: 'node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js'
        //             }
        //         ]
        //     }),
        // ]
    }
];
