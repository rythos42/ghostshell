import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import styles from './EquipMenu.module.css';

class EquipMenu extends React.Component {
  state = {
    anchorElement: null,
    snackBarOpen: false,
    noEquipDialogOpen: false
  };

  getCharacter = characterId => {
    const found = this.props.characters.find(character => character.characterId === characterId);
    if (!found) return {};
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.equipItemMessage && this.props.equipItemMessage)
      this.setState({ snackBarOpen: true });

    if (prevProps.equipItemMessage && !this.props.equipItemMessage)
      this.setState({ snackBarOpen: false });
  }

  handleSnackbarClose = () => {
    this.props.resetApiResponseToUser();
  };

  handleOpenMenu = event => {
    this.setState({ anchorElement: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorElement: null });
  };

  handleCharacterClick = (characterId, membershipType) => () => {
    const { location } = this.props.selectedGhostShell;
    if (location !== characterId && location !== 'vault') {
      this.setState({ noEquipDialogOpen: true });
      return;
    }

    this.props.equipSelectedShellToCharacter({ characterId, membershipType });
    this.setState({ anchorElement: null });
  };

  handleNoEquipDialogClose = () => {
    this.setState({ noEquipDialogOpen: false });
  };

  render() {
    const anchorElement = this.state.anchorElement;
    return (
      <>
        <Button
          aria-owns={anchorElement ? 'characterMenu' : undefined}
          aria-haspopup="true"
          onClick={this.handleOpenMenu}
          disabled={!this.props.hasShellSelected}
        >
          Equip to...
        </Button>
        <Menu
          id="characterMenu"
          anchorEl={anchorElement}
          open={Boolean(anchorElement)}
          onClose={this.handleCloseMenu}
          className={styles.menu}
        >
          {this.props.characters.map(character => (
            <MenuItem
              className={styles.menuItem}
              value={character.characterId}
              key={character.characterId}
              onClick={this.handleCharacterClick(character.characterId, character.membershipType)}
            >
              <img
                alt="Character"
                src={`https://www.bungie.net/${character.emblemBackgroundPath}`}
              />
              <div className={styles.menuItemText}>
                <div>{character.classString.toUpperCase()}</div>
                <div>
                  {character.raceString} {character.genderString}
                </div>
              </div>
            </MenuItem>
          ))}
        </Menu>
        <Snackbar
          open={this.state.snackBarOpen}
          autoHideDuration={4000}
          onClose={this.handleSnackbarClose}
          message={this.props.equipItemMessage}
        />
        <Dialog
          open={this.state.noEquipDialogOpen}
          onClose={this.handleNoEquipDialogClose}
          aria-labelledby="no-equip-title"
          aria-describedby="no-equip-description"
        >
          <DialogTitle id="no-equip-title">Can't Equip</DialogTitle>
          <DialogContent>
            <DialogContentText id="no-equip-description">
              You cannot equip this to that character at this time. Unfortunately, to equip from
              another character there's a lot that needs to happen so this is a middle step.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleNoEquipDialogClose} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

function mapStateToProps({ destiny }) {
  return {
    characters: destiny.characters,
    equipItemMessage: destiny.apiResponse.message
      ? destiny.apiResponse.message
      : destiny.apiResponse.bungieResponse.Message,
    hasShellSelected: destiny.selectedGhostShell !== null,
    selectedGhostShell: destiny.selectedGhostShell
  };
}

function mapDispatchToProps(dispatch) {
  return {
    equipSelectedShellToCharacter: dispatch.destiny.equipSelectedShellToCharacter,
    resetApiResponseToUser: dispatch.destiny.resetApiResponseToUser
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EquipMenu);
