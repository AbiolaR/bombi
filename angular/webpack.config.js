const path = require(`path`);
const BrotliPlugin = require(`brotli-webpack-plugin`);
const CompressionPlugin = require(`compression-webpack-plugin`);


module.exports = {
    plugins:[
        new BrotliPlugin({
            asset: '[path].br',
            threshold: 0,
            minRatio: 0.8,
        })

    ]
}