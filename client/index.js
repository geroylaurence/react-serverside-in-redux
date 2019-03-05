import 'babel-polyfill';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { routerMiddleware } from 'react-router-redux';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { ThemeProvider } from 'styled-components';

import App from './app';
import appReducers from '../redux/reducers';
import theme from './ui/styles/theme';

const history = createBrowserHistory();

// Redux
const routingMiddleware = routerMiddleware(history);
const initialReduxState = window.__REDUX_STATE__;
delete window.__REDUX_STATE__;
const reduxStore = createStore(
  appReducers,
  initialReduxState,
  // redux completion setup
);

// Check for an error.
const errorCode = window.__ERROR_CODE__;
delete window.__ERROR_CODE__;

const render = (AppComponent) => {
  ReactDOM.hydrate(
    <Provider store={reduxStore}>
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <AppComponent />
        </ThemeProvider>
      </Router>
    </Provider>,
    document.getElementById('app'),
  );
};

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./app.js', () => {
    const AppHMR = require('./app').default;
    render(AppHMR);
  });
}

render(App);
