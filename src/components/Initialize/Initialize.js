import React from 'react';

import { connect } from 'react-redux';

class Initialize extends React.Component {
  state = {
    configLoaded: false
  };

  async componentDidMount() {
    this.props.initializeDestiny();
    this.props.initializeStrings();
    await this.props.initializeManifest();
    await this.props.initializeConfig();

    this.setState({ configLoaded: true });
  }

  render() {
    if (!this.state.configLoaded) return null;
    return this.props.children;
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
