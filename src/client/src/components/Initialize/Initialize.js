import React from 'react';

import { connect } from 'react-redux';

class Initialize extends React.Component {
  componentDidMount() {
    this.props.initializeConfig();
    this.props.initializeStrings();
    this.props.initializeDestiny();
  }

  render() {
    return null;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    initializeConfig: dispatch.config.initialize,
    initializeStrings: dispatch.strings.initialize,
    initializeDestiny: dispatch.destiny.initialize
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Initialize);
