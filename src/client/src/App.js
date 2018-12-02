import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './Store';
import Main from './components/Main';
import Verify from './components/OAuth/Verify';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          <Route path="/" exact component={Main} />
          <Route path="/api/oauth/verify" exact component={Verify} />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
