import React from 'react';
import GridListTile from '@material-ui/core/GridListTile';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import styles from './ShellGridTile.module.css';

class ShellGridTile extends React.Component {
  makeTooltip(ghostShell) {
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

  isFilteredOut(ghostShell, filter) {
    // no filter, show everything
    const filterKeys = Object.keys(filter);
    if (filterKeys.length === 0) return false;

    // if it has no sockets types and we're filtering by anything, it's out
    if (ghostShell.sockets.length === 0) return true;

    for (let i = 0; i < filterKeys.length; i++) {
      let filterMatched = false;

      ghostShell.sockets.forEach(socket => {
        socket.ghostModTypes.forEach(socketedModType => {
          if (socketedModType === filterKeys[i]) filterMatched = true;
        });
      });

      if (!filterMatched) return true;
    }

    return false;
  }

  setSelected(selected) {
    this.setState({ selected: selected });
  }

  render() {
    const ghostShell = this.props.ghostShell;
    return (
      <GridListTile
        key={ghostShell.itemInstanceId}
        classes={{
          root: styles.tile + (this.props.selected ? ' ' + styles.selected : ''),
          tile: styles.tile + (this.props.selected ? ' ' + styles.selected : '')
        }}
        onClick={() => this.props.onTileClick(ghostShell)}
      >
        <Tooltip
          title={this.makeTooltip(ghostShell)}
          aria-label={ghostShell.name}
          enterTouchDelay={0}
        >
          <div>
            {this.isFilteredOut(ghostShell, this.props.filter) && (
              <div className={`${styles.overlay} ${styles.filteredOut}`} />
            )}
            <img src={ghostShell.icon} alt="Shell" />
          </div>
        </Tooltip>
      </GridListTile>
    );
  }
}

export default ShellGridTile;
