import React from 'react';
import { Provider } from 'react-redux';
import { create } from 'jss';
import JssProvider from 'react-jss/lib/JssProvider';
import {
  createGenerateClassName,
  jssPreset,
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import store from './Store';
import Routes from './components/Routes';

const jss = create(jssPreset());
jss.options.insertionPoint = document.getElementById('jss-insertion-point');
const theme = createMuiTheme({ typography: { useNextVariants: true } });
const generateClassName = createGenerateClassName();

function App() {
  return (
    <Provider store={store}>
      <JssProvider jss={jss} generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Routes />
        </MuiThemeProvider>
      </JssProvider>
    </Provider>
  );
}

export default App;
