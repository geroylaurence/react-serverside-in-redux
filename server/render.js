import { createMemoryHistory } from 'history';
import { parsePath } from 'history/PathUtils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import { flushChunkNames } from 'react-universal-component/server';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { ServerStyleSheet, StyleSheetManager, ThemeProvider } from 'styled-components';
import flushChunks from 'webpack-flush-chunks';

import App from '../client/app';
import appReducers from '../redux/reducers';
import theme from '../client/ui/styles/theme';

const normalizeCSS = require('normalize.css/normalize.css').toString();

function sendResponse(res, reduxStore, history, clientStats) {
  const context = {};
  const stylesheet = new ServerStyleSheet();
  const markup = (hasError = false) => (
    <Provider store={reduxStore}>
      <StaticRouter location={history.location.pathname} context={context}>
        <StyleSheetManager sheet={stylesheet.instance}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </StyleSheetManager>
      </StaticRouter>
    </Provider>
  );
  let app;
  try {
    // Render the app.
    app = ReactDOMServer.renderToString(markup());
  } catch (error) {
    console.log(error);
    // Render the app but mark that there is an error.
    app = ReactDOMServer.renderToString(markup(true));
  }

  if (context.url) {
    console.log(`Redirecting to: ${context.url}`);

    res.redirect(302, context.url);
  } else {
    const reduxState = reduxStore.getState();
    const styleTags = stylesheet.getStyleTags();
    const chunkNames = flushChunkNames();

    const {
      js,
      // styles,
      // cssHash,
      scripts,
      // stylesheets,
    } = flushChunks(clientStats, {
      before: ['common'],
      chunkNames,
    });

    // console.log('PATH', req.path);
    console.log('DYNAMIC CHUNK NAMES RENDERED', chunkNames);
    console.log('SCRIPTS SERVED', scripts);
    // console.log('STYLESHEETS SERVED', stylesheets);

    // Check for changed status code.
    if (context.status) {
      res.status(context.status);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TourHeart</title>
          <style>
          ${normalizeCSS}

          html {
            background-color: ${theme.colors.offWhite};
            box-sizing: border-box;
            font-family: ${theme.font.family.primary};
            font-size: 13px;
            margin: 0;
            padding: 0;
          }
          *, *:before, *:after {
            box-sizing: inherit;
          }

          #app, body, html {
            height: 100%;
          }

          </style>
          ${styleTags}

          <!-- jQuery -->
          <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
        </head>
        <body>
          <div id="app">${app}</div>
          <script>
            ${context.status ? `window.__ERROR_CODE__ = ${context.status};` : ''}
            window.__REDUX_STATE__ = ${JSON.stringify(reduxState).replace(/</g, '\\u003c')}
          </script>
          ${js}
        </body>
      </html>
    `);
  }
}

export default ({ clientStats }) => (req, res) => {
  console.log(`Request for: ${req.url}`);

  const initialLocation = parsePath(req.url);

  const history = createMemoryHistory({
    initialEntries: [initialLocation],
    initialIndex: 0,
  });

  // Redux
  const reduxStore = createStore(
    appReducers,
    history
  )

  sendResponse(res, reduxStore, history, clientStats);
}