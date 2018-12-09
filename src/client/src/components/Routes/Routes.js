import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Main from '../Main';
import Verify from '../OAuth/Verify';

class Routes extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Main} />
          <Route path="/api/oauth/verify" exact component={Verify} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default Routes;
