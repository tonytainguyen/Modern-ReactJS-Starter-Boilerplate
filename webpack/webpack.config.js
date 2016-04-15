import path from 'path'
import merge from 'webpack-merge'
import cssnano from 'cssnano'

import webpackDevConfig from './dev.config'
import webpackProdConfig from './prod.config'

const CONFIG = {
	env: process.env.NODE_ENV || 'development',
	target: process.env.npm_lifecycle_event,
	appPath:  path.join(__dirname, '../app'),
	buildPath: path.join(__dirname, '../build'),
	htmlPath: path.join(__dirname, '../app/index.html'),
}

process.env.BABEL_ENV = CONFIG.target;

const webpackConfig = {
	devtool: 'source-map',
	node: {
		fs: 'empty',
	},
	resolve: {
		extensions: ['', 'json', '.js', '.jsx'],
	},
	module: {},
}

webpackConfig.entry = {
	app: [
		'webpack-hot-middleware/client',
		CONFIG.appPath,
	],
}

webpackConfig.output = {
	path: CONFIG.buildPath,
	filename: 'bundle.js',
	publicPath: '/',
}

webpackConfig.module.loaders = [
	{
		test: /\.jsx?$/,
		exclude: /node_modules/,
		loader: 'babel',
		query: {
			cacheDirectory: true,
			plugins: ['transform-runtime'],
			presets: ['es2015', 'react', 'stage-0'],
			env: {
				development: {
					plugins: [
						['react-transform', {
							transforms: [{
								transform: 'react-transform-hmr',
								imports: ['react'],
								locals: ['module']
							}, {
								transform: 'react-transform-catch-errors',
								imports: ['react', 'redbox-react']
							}]
						}]
					]
				},
				production: {
					plugins: [
						'transform-react-remove-prop-types',
						'transform-react-constant-elements'
					]
				}
			}
		}
	},
	{
		test: /\.json$/,
		loaders: ['json'],
	},
	{
		test: /\.[s]css$/,
		loaders: ['style', 'css', 'postcss', 'sass?sourceMap'],
		include: CONFIG.appPath,
	},
]

webpackConfig.postcss = [
	cssnano({
		autoprefixer: {
			add: true,
			remove: true,
			browsers: ['last 2 versions'],
		},
		discardComments: {
			removeAll: true,
		},
		discardUnused: true,
		mergeIdents: false,
		reduceIdents: false,
		safe: true,
		sourcemap: true,
	})
]

if(CONFIG.target === 'start' || !CONFIG.target) {
	module.exports = merge(webpackConfig, webpackDevConfig(CONFIG))
}

if(CONFIG.target === 'build' && CONFIG.env === 'production') {
	console.log("IN PRODUCTION")
	module.exports = merge(webpackConfig, webpackProdConfig(CONFIG))
}

export default webpackConfig