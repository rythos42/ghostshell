import React from 'react';
import GridListTile from '@material-ui/core/GridListTile';
import Tooltip from '@material-ui/core/Tooltip';

import styles from './ShellGridTile.module.css';
import ShellInfo from '../ShellInfo';

class ShellGridTile extends React.Component {
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
          title={<ShellInfo ghostShell={ghostShell} />}
          aria-label={ghostShell.name}
          enterTouchDelay={0}
          disableTouchListener={!this.props.hasHover}
          disableHoverListener={!this.props.hasHover}
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
