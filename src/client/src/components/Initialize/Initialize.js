import React from 'react';

import { connect } from 'react-redux';

class Initialize extends React.Component {
  async componentDidMount() {
    this.props.initializeDestiny();
    this.props.initializeStrings();
    await this.props.initializeManifest();
    this.props.initializeConfig();
  }

  render() {
    return null;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    initializeConfig: dispatch.config.initialize,
    initializeStrings: dispatch.strings.initialize,
    initializeDestiny: dispatch.destiny.initialize,
    initializeManifest: dispatch.manifest.initialize
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Initialize);
