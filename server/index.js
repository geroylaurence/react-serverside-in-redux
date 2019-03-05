require('isomorphic-fetch');
const cookieParser = require('cookie-parser');
const express = require('express');
const webpack = require('webpack');
const noFavicon = require('express-no-favicons');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackHotServerMiddleware = require('webpack-hot-server-middleware');
const clientConfig = require('../webpack/webpack.dev.client.js');
const serverConfig = require('../webpack/webpack.dev.server.js');

// eslint-disable-next-line prefer-destructuring
const publicPath = clientConfig.output.publicPath;
const outputPath = clientConfig.output.path;
const DEV = process.env.NODE_ENV === 'development';
const app = express();
app.use(noFavicon());
app.use(cookieParser());

let isBuilt = false;
const PORT = process.env.PORT || 3000;

const done = () =>
  !isBuilt &&
  app.listen(PORT, () => {
    isBuilt = true;
    console.log(`${process.env.NODE_ENV} BUILD COMPLETE -- Listening @ http://localhost:${PORT}`);
  });

if (DEV) {
  const compiler = webpack([clientConfig, serverConfig]);
  const clientCompiler = compiler.compilers[0];
  const options = { publicPath, stats: { colors: true } };

  app.use(webpackDevMiddleware(compiler, options));
  app.use(webpackHotMiddleware(clientCompiler));
  app.use(webpackHotServerMiddleware(compiler));

  compiler.plugin('done', done);
}