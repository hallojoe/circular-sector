const path = require('path');
module.exports = {
    watch: true,
    entry: {
        demo: path.join(__dirname, './demo/Index.ts'), 
        dist: path.join(__dirname, './src/Functions.ts')
    },
    output: {
        filename: './[name]/index.js',
        path: __dirname,
        libraryTarget: 'umd'
    },
    devServer: {
        port: 8081,
    },    
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
}
