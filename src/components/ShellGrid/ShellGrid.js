import React from 'react';
import { connect } from 'react-redux';
import GridList from '@material-ui/core/GridList';

import styles from './ShellGrid.module.css';
import ShellGridTile from '../ShellGridTile';

class ShellGrid extends React.Component {
  state = {
    selectedTileItemInstanceId: null
  };

  handleTileClick = selectedGhostShell => {
    const isCurrentlySelectedShell =
      selectedGhostShell.itemInstanceId === this.state.selectedTileItemInstanceId;

    this.setState({
      selectedTileItemInstanceId: isCurrentlySelectedShell
        ? null
        : selectedGhostShell.itemInstanceId
    });

    this.props.setSelectedShell(isCurrentlySelectedShell ? null : selectedGhostShell);
  };

  render() {
    const { ghostShells, filter, isLoading } = this.props;

    return (
      <div className={styles.gridContainer}>
        {ghostShells.length > 0 ? (
          <GridList>
            {ghostShells.map(ghostShell => (
              <ShellGridTile
                key={ghostShell.itemInstanceId}
                ghostShell={ghostShell}
                filter={filter}
                selected={ghostShell.itemInstanceId === this.state.selectedTileItemInstanceId}
                onTileClick={this.handleTileClick}
                hasHover={this.props.hasHover}
              />
            ))}
          </GridList>
        ) : (
          !isLoading && <div>Sign in to see your Ghost Shells.</div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ghostShells: state.destiny.ghostShells,
    filter: state.destiny.filter,
    hasHover: state.config.hasHover,
    isLoading: state.destiny.isLoading
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSelectedShell: dispatch.destiny.setSelectedShell
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShellGrid);
