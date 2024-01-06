const path = require('path');
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopywebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Define your MQTT broker URL here
const mqttBrokerUrl = JSON.stringify('mqtt://localhost:1883');

module.exports = {
    context: __dirname,
    entry: {
        app: './src/index.js'
    },
    mode: 'development',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        sourcePrefix: ''
    },
    amd: {
        toUrlUndefined: true
    },
    node: {
        global: false
    },
    resolve: {
        alias: {
            cesium: path.resolve(__dirname, cesiumSource),
            //mqtt : require.resolve("mqtt/dist/mqtt"),
        },
        fallback: {
            "zlib": require.resolve("browserify-zlib"),
            "https": require.resolve("https-browserify"),
            "http": require.resolve("stream-http"),
            "assert": require.resolve("assert/"),
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "fs" : require.resolve("browserfs"),
            
        }
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: ['url-loader']
        }, {
            test: /\.(glb|gltf)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    outputPath: 'CADS/',
                },
            }, ],
        }, ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CopywebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' },
            ]
        }),
        new webpack.DefinePlugin({
            CESIUM_BASE_URL: JSON.stringify(''),
            MQTT_BROKER_URL: mqttBrokerUrl, // Define MQTT broker URL
        })
    ],
};
