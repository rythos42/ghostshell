import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    width: 500,
    height: 450
  },
  subheader: {
    width: '100%'
  }
});

function ShellGrid({ classes, ghostShellIcons }) {
  return (
    <div className={classes.root}>
      <GridList cellHeight={160} className={classes.gridList} cols={3}>
        {ghostShellIcons.map(ghostShellIcon => (
          <GridListTile cols={1} key={ghostShellIcon}>
            <img src={ghostShellIcon} alt="Shell" />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    ghostShellIcons: state.destiny.ghostShellIcons
  };
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps)
)(ShellGrid);
