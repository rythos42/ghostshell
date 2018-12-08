import React from 'react';

import { connect } from 'react-redux';

class Initialize extends React.Component {
  componentDidMount() {
    this.props.initialize();
  }

  render() {
    return null;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    initialize: dispatch.config.initialize
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Initialize);
