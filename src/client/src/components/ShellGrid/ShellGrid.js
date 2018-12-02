import React from 'react';
import { connect } from 'react-redux';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Tooltip from '@material-ui/core/Tooltip';

function ShellGrid({ classes, ghostShells }) {
  return (
    <div>
      <GridList cellHeight={160}>
        {ghostShells.map(ghostShell => (
          <GridListTile key={ghostShell.icon}>
            <Tooltip title={ghostShell.name} aria-label={ghostShell.name}>
              <img src={ghostShell.icon} alt="Shell" />
            </Tooltip>
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    ghostShells: state.destiny.ghostShells
  };
}

export default connect(mapStateToProps)(ShellGrid);
