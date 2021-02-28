const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

module.exports = {
	// モード値を production に設定すると最適化された状態で、
	// development に設定するとソースマップ有効でJSファイルが出力される
	mode: (process.env.NODE_ENV.trim()) === "development" ? "development" : "production",
	// メインとなるJavaScriptファイル（エントリーポイント）
	entry: path.resolve(__dirname, "src", "main.tsx"),
	output: {
		//  出力ファイルのディレクトリ名
		path: path.resolve(__dirname, "dist"),
		// 出力ファイル名
		filename: "main.js"
	},
	module: {
		rules: [
			{
				// 拡張子 .ts もしくは .tsx の場合
				test: /\.tsx?$/,
				// TypeScript をコンパイルする
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	// import 文で .ts や .tsx ファイルを解決するため
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	plugins: [
		new HtmlWebpackPlugin({ 
			inject: true, 
			inlineSource: '.(js|css|ts|tsx)$', 
			template: "./public/index.html",
			minify: false 
		}),
		new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
	],
	devtool: 'inline-source-map',
	devServer: {
		host: '0.0.0.0',
		open: true,
		port: 8000
	}
}
