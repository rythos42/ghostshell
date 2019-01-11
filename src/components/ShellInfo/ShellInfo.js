import React from 'react';
import Typography from '@material-ui/core/Typography';

import styles from './ShellInfo.module.css';

export default class ShellInfo extends React.Component {
  render() {
    const { ghostShell } = this.props;
    return (
      <div className={styles.tooltip}>
        <Typography color="inherit" variant="subtitle1" gutterBottom>
          {ghostShell.name}
        </Typography>
        <Typography color="inherit" variant="subtitle2" gutterBottom>
          {ghostShell.locationString}
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
