import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

function Verify({ getOAuthTokenAndGhostShells, apiKey, clientId }) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!apiKey || !clientId || !code) return null;

  getOAuthTokenAndGhostShells(code);

  return <Redirect to="/" />;
}

function mapStateToProps({ config: { apiKey, clientId } }) {
  return { apiKey, clientId };
}

function mapDispatchToProps(dispatch) {
  return {
    getOAuthTokenAndGhostShells: dispatch.destiny.getOAuthTokenAndGhostShells
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Verify);
