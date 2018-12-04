import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

function Verify({ getGhostShellsForCurrentUser }) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  getGhostShellsForCurrentUser(code);

  return <Redirect to="/" />;
}

function mapDispatchToProps(dispatch) {
  return {
    getGhostShellsForCurrentUser: code => {
      dispatch.destiny.getGhostShellsForCurrentUser(code);
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Verify);
