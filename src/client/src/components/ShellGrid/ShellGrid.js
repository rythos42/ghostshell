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

  isFilteredOut(ghostShell, filter) {
    // no filter, show everything
    const filterKeys = Object.keys(filter);
    if (filterKeys.length === 0) return false;

    // if it has no sockets types and we're filtering by anything, it's out
    if (ghostShell.sockets.length === 0) return true;

    for (let i = 0; i < filterKeys.length; i++) {
      const filterModType = parseInt(filterKeys[i], 10);
      let filterMatched = false;

      ghostShell.sockets.forEach(socket => {
        socket.ghostModTypes.forEach(socketedModType => {
          if (socketedModType === filterModType) filterMatched = true;
        });
      });

      if (!filterMatched) return true;
    }

    return false;
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
                {this.isFilteredOut(ghostShell, this.props.filter) && (
                  <div className={styles.overlay} />
                )}
                <Tooltip title={this.makeTooltip(ghostShell)} aria-label={ghostShell.name}>
                  <img src={ghostShell.icon} alt="Shell" />
                </Tooltip>
              </GridListTile>
            ))}
          </GridList>
        ) : (
          <div>Sign in to see your Ghost Shells.</div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ghostShells: state.destiny.ghostShells,
    filter: state.destiny.filter
  };
}

export default connect(mapStateToProps)(ShellGrid);
