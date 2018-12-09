import React from 'react';
import { connect } from 'react-redux';
import GridList from '@material-ui/core/GridList';

import styles from './ShellGrid.module.css';
import ShellGridTile from '../ShellGridTile';

class ShellGrid extends React.Component {
  render() {
    const { ghostShells, filter } = this.props;

    return (
      <div className={styles.gridContainer}>
        {ghostShells.length > 0 ? (
          <GridList className={styles.grid}>
            {ghostShells.map(ghostShell => (
              <ShellGridTile ghostShell={ghostShell} filter={filter} />
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
