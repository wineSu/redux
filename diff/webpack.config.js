var path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: "./diff.jsx",
    },
    output: {
        filename: "bundle.js",
    },
    resolve:{
        extensions:['.js','.jsx']
    },
    mode:'development',
//  mode:'production',
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/, loaders: 'babel-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            cache:false,
        })
    ],
    devtool: 'inline-source-map',
//  devtool: 'false',
    devServer: {
        historyApiFallback: true,
          hot: true,
        inline: true,
        stats: { colors: true },
        proxy: {
            '/': {
              target: 'http://www.mockhttp.cn',
              pathRewrite: {'^/column' : '/column'},
              changeOrigin: true
            }
         }
    }
}