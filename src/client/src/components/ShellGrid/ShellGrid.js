import React from 'react';
import { connect } from 'react-redux';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Tooltip from '@material-ui/core/Tooltip';

import styles from './ShellGrid.module.css';

class ShellGrid extends React.Component {
  makeTooltip(ghostShell) {
    return (
      <div>
        <strong>{ghostShell.name}</strong>
        <ul>
          {ghostShell.sockets.map(socket => (
            <li key={socket.hash}>{socket.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  isFilteredOut(ghostShell, filteredOutId) {
    if (filteredOutId === -1) return false;

    for (let i = 0; i < ghostShell.sockets.length; i++) {
      const socket = ghostShell.sockets[i];
      if (socket.ghostModTypes.indexOf(filteredOutId) !== -1) return false;
    }

    return true;
  }

  render() {
    const { ghostShells } = this.props;

    return (
      <div className={styles.gridContainer}>
        {ghostShells.length > 0 ? (
          <GridList className={styles.grid}>
            {ghostShells.map(ghostShell => (
              <GridListTile
                key={ghostShell.itemInstanceId}
                classes={{ root: styles.tile, tile: styles.tile }}
              >
                {this.isFilteredOut(ghostShell, this.props.filteredOutId) && (
                  <div className={styles.overlay} />
                )}
                <Tooltip title={this.makeTooltip(ghostShell)} aria-label={ghostShell.name}>
                  <img src={ghostShell.icon} alt="Shell" />
                </Tooltip>
              </GridListTile>
            ))}
          </GridList>
        ) : (
          <div>Sign in or refresh to see your Ghost Shells.</div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ghostShells: state.destiny.ghostShells,
    filteredOutId: state.destiny.mutuallyExclusiveWhereFilter
  };
}

export default connect(mapStateToProps)(ShellGrid);
