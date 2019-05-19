/**
 * Created by taozeyu on 2017/6/4.
 */

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const basic = {

    entry: [
        "./src/index.ts",
    ],

    output: {
        filename: "javascript/index-[hash].js",
        path: __dirname + "/build",
        publicPath: "/",
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".svg"],
    },

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader",
                exclude: [
                    path.resolve(__dirname, "../submodules/white-framework/node_modules")
                ]
            }, {
                test: /\.tsx?$/,
                use: [
                    'ts-loader',
                    {
                        loader: 'ui-component-loader',
                        options: {
                            'lib': 'antd',
                            'libDir': 'es',
                            'style': false,
                        }
                    },
                ],
                exclude: /node_modules/,
            }, {
                test: /\.less$/,
                use: [
                    {loader: "style-loader"}, {loader: "css-loader"}, {loader: "less-loader"}
                ]
            }, {
                test: /\.css$/,
                use: [
                    {loader: "style-loader"}, {loader: "css-loader"}
                ]
            }, {
                test: /\.svg$/,
                exclude: /node_modules/,
                loader: 'svg-react-loader',
                query: {
                    classIdPrefix: '[name]-[hash:8]__',
                    propsMap: {
                        fillRule: 'fill-rule',
                        foo: 'bar'
                    },
                    xmlnsTest: /^xmlns.*$/
                }
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192&name=images/[hash:8].[name].[ext]'
            }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index-template.html",
            filename: "index.html",
            path: __dirname + "/build",
            inject: "body",
        }),
    ]
};

const development = {
    devServer: {
        port: 3000,
        historyApiFallback: true,
        // proxy: {
        //   "/api": {
        //     pathRewrite: {'^/api': '/'},
        //     target: "http://bad006a941144606a2cf5b693c5dddea-cn-hangzhou.alicloudapi.com/",
        //     changeOrigin: true
        //   },
        // },
    },
};

const production = {
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
    ],
};

function merge(conf1, conf2) {
    if (conf1 instanceof Array && conf2 instanceof Array) {
        const array = [];
        conf1.forEach(function (e) {
            array.push(e);
        });
        conf2.forEach(function (e) {
            array.push(e);
        });
        return array;
    }
    const result = {};

    function mergeValue(v1, v2) {
        if (typeof v1 === "object" && typeof v2 === "object") {
            return merge(v1, v2);

        } else if (v1 === undefined) {
            return v2;

        } else {
            return v1;
        }
    }

    for (const key in conf1) {
        result[key] = mergeValue(conf1[key], conf2[key]);
    }
    for (const key in conf2) {
        if (!(key in conf1)) {
            result[key] = mergeValue(conf1[key], conf2[key]);
        }
    }
    return result;
}

module.exports = merge(
    basic,
    process.env.NODE_ENV === 'production' ? production : development
);