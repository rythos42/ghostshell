import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

function Verify({ getOAuthToken }) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  getOAuthToken(code);

  return <Redirect to="/" />;
}

function mapDispatchToProps(dispatch) {
  return {
    getOAuthToken: code => {
      dispatch.destiny.getOAuthToken(code);
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Verify);
