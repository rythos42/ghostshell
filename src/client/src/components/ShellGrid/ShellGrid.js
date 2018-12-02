import React from 'react';
import { connect } from 'react-redux';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Tooltip from '@material-ui/core/Tooltip';

class ShellGrid extends React.Component {
  makeTooltip(ghostShell) {
    return (
      <div>
        <strong>{ghostShell.name}</strong>
        <ul>
          {ghostShell.perks.map(perk => (
            <li key={perk.hash}>{perk.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { ghostShells } = this.props;

    return (
      <div>
        <GridList cellHeight={160}>
          {ghostShells.map(ghostShell => (
            <GridListTile key={ghostShell.itemInstanceId}>
              <Tooltip title={this.makeTooltip(ghostShell)} aria-label={ghostShell.name}>
                <img src={ghostShell.icon} alt="Shell" />
              </Tooltip>
            </GridListTile>
          ))}
        </GridList>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ghostShells: state.destiny.ghostShells
  };
}

export default connect(mapStateToProps)(ShellGrid);
