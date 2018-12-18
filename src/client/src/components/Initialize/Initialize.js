import React from 'react';

import { connect } from 'react-redux';

class Initialize extends React.Component {
  async componentDidMount() {
    this.props.initializeDestiny();
    this.props.initializeStrings();

    await this.props.initializeConfig();
    this.props.getRaceGenderClassData();
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
    getRaceGenderClassData: dispatch.destiny.getRaceGenderClassData
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Initialize);
