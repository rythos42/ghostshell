import React from 'react';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';

import styles from './ShellInfo.module.css';

class ShellInfo extends React.Component {
  state = {
    locationString: ''
  };

  async componentDidMount() {
    const locationString = await this.props.getLocationString(this.props.ghostShell.location);
    this.setState({ locationString: locationString });
  }

  render() {
    if (!this.state.locationString) return null;

    const { ghostShell } = this.props;
    return (
      <div className={styles.tooltip}>
        <Typography color="inherit" variant="subtitle1" gutterBottom>
          {ghostShell.name}
        </Typography>
        <Typography color="inherit" variant="subtitle2" gutterBottom>
          {this.state.locationString}
          {ghostShell.isEquipped && ' - Equipped'}
        </Typography>
        {ghostShell.sockets.map(socket => (
          <div key={socket.hash}>
            <Typography color="inherit">{socket.name}</Typography>
            <ul>
              <li>
                <Typography color="inherit">{socket.description}</Typography>
              </li>
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getLocationString: dispatch.destiny.getLocationString
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ShellInfo);
