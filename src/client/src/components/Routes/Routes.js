import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Main from '../Main';
import Verify from '../OAuth/Verify';

class Routes extends React.Component {
  render() {
    return (
      <BrowserRouter basename={this.props.baseName}>
        <Switch>
          <Route path="/" exact component={Main} />
          <Route path="/api/oauth/verify" exact component={Verify} />
        </Switch>
      </BrowserRouter>
    );
  }
}

function mapStateToProps({ config: { baseName } }) {
  return { baseName };
}

export default connect(mapStateToProps)(Routes);
