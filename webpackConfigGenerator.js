'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin')
const { CheckerPlugin } = require('awesome-typescript-loader')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const path = require('path')
const fs = require('fs')

const htmlLoader = minimize => {
	return {
		loader: 'html-loader',
		options: {
			minimize: minimize,
			removeComments: minimize
		}
	}
}

const cssLoaders = (hotReload, sourceMap) => [
	{
		loader: MiniCssExtractPlugin.loader,
		options: {
			hmr: hotReload
		}
	},
	'css-loader',
	{
		loader: 'postcss-loader',
		options: {
			sourceMap: sourceMap,
			plugins: loader => [
				require('autoprefixer')({
					overrideBrowserslist: ['last 2 versions']
				})
			]
		}
	}
]

const jsLoader = {
	loader: 'babel-loader',
	options: {
		presets: ['@babel/preset-env']
	}
}

const fileLoader = (devmode, folder) => {
	return {
		loader: 'file-loader',
		options: {
			name: '[name].[ext]',
			outputPath: folder,
			publicPath: (devmode ? folder : 'dist/' + folder)
		}
	}
}

const WebpackConfigGenerator = config => {
	const devmode = (config.mode === 'development')
	const completeConfig = {
		mode: 'development',
		watch: devmode,
		showErrors: devmode,
		minimize: !devmode,
		sourceMap: false,
		entry: {},
		index: 'src/index.html',
		resourcesFolder: '',
		favicon: false,
		...config
	}
	console.log(completeConfig)
	return {
		mode: completeConfig.mode,
		entry: completeConfig.entry,
		output: {
			path: __dirname + '/dist',
			publicPath: (devmode ? '' : 'dist'),
			filename: '[name].min.js'
		},
		watch: completeConfig.watch,
		devServer: {
			contentBase: './dist'
		},
		devtool: (completeConfig.sourceMap ? 'source-map' : false),
		resolve: {
			modules: [path.resolve(__dirname, 'src'), 'node_modules'],
			extensions: ['.css', '.sass', '.scss', '.js', '.jsx', '.ts', '.tsx', '.json', '.ico', '.png', '.svg', '.jpg', '.jpeg', '.gif', '.webp', '.eot', '.otf', '.ttf', '.woff', '.woff2', '.txt'],
		},
		module: {
			rules: [
				{
					test: /\.html$/i,
					use: htmlLoader(completeConfig.minimize)
				},
				{
					test: /\.css$/i,
					use: cssLoaders(completeConfig.watch, completeConfig.sourceMap)
				},
				{
					test: /\.s(a|c)ss$/i,
					use: [...cssLoaders(completeConfig.watch), 'sass-loader']
				},
				{
					test: /\.tsx?$/i,
					use: [jsLoader, 'awesome-typescript-loader']
				},
				{
					test: /\.(ico|png|svg|jpe?g|gif|webp)$/i,
					use: fileLoader(devmode, completeConfig.resourcesFolder + 'img/')
				},
				{
					test: /\.(eot|otf|ttf|woff2?)$/i,
					use: fileLoader(devmode, completeConfig.resourcesFolder + 'font/')
				},
				{
					test: /\.txt$/i,
					use: 'raw-loader'
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				filename: (devmode ? 'index.html' : '../index.html'),
				template: completeConfig.index,
				minify: completeConfig.minimize,
				cache: true,
				showErrors: completeConfig.showErrors
			}),
			new MiniCssExtractPlugin({
				filename: '[name].min.css',
				chunkFilename: '[id].min.css',
				disable: devmode
			}),
			new OptimizeCssnanoPlugin({
				cssnanoOptions: {
					preset: ['default', {
						discardComments: {
							removeAll: true,
						}
					}]
				}
			}),
			new CheckerPlugin(),
			new UglifyJsPlugin({
				test: /\.js($|\?)/i,
				cache: true,
				parallel: true
			}),
			...(typeof completeConfig.favicon === 'string' ? [
				new FaviconsWebpackPlugin({
					logo: completeConfig.favicon,
					prefix: completeConfig.resourcesFolder + 'img/icons/',
					emitStats: false,
					statsFilename: 'iconstats-[hash].json',
					persistentCache: false,
					inject: true,
					background: '#fff',
					icons: {
						android: true,
						appleIcon: true,
						appleStartup: true,
						coast: false,
						favicons: true,
						firefox: true,
						opengraph: false,
						twitter: true,
						yandex: true,
						windows: true
					}
				})
			] : [])
		]
	}
}

module.exports = WebpackConfigGenerator
