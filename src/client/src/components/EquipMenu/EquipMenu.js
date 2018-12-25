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
import { EquipItemErrorCodes } from './../../models/Destiny';

class EquipMenu extends React.Component {
  state = {
    anchorElement: null,
    snackBarOpen: false,
    accessTokenExpiredDialogOpen: false,
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

    if (this.props.accessTokenExpired && !prevProps.accessTokenExpired)
      this.setState({ accessTokenExpiredDialogOpen: true });
  }

  handleSnackbarClose = () => {
    this.props.resetEquipItemResponse();
  };

  handleOpenMenu = event => {
    this.setState({ anchorElement: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorElement: null });
  };

  handleCharacterClick = (characterId, membershipType) => () => {
    if (this.props.selectedGhostShell.location !== characterId) {
      this.setState({ noEquipDialogOpen: true });
      return;
    }

    this.props.equipSelectedShellToCharacter({ characterId, membershipType });
    this.setState({ anchorElement: null });
  };

  handleAccessTokenExpiredDialogClose = () => {
    this.setState({ accessTokenExpiredDialogOpen: false });
    this.props.resetEquipItemResponse();
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
          open={this.state.accessTokenExpiredDialogOpen}
          onClose={this.handleAccessTokenExpiredDialogClose}
          aria-labelledby="access-expired-title"
          aria-describedby="access-expired-description"
        >
          <DialogTitle id="access-expired-title">Access Expired</DialogTitle>
          <DialogContent>
            <DialogContentText id="access-expired-description">
              Your access to Bungie through this app has expired and must be refreshed before you
              can equip.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAccessTokenExpiredDialogClose} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
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
              vault or another character there's a lot that needs to happen so this is a middle
              step.
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
    equipItemMessage:
      destiny.equipItemResponse.bungieResponse.ErrorCode === 1
        ? 'Equipped'
        : destiny.equipItemResponse.bungieResponse.Message,
    oAuthToken: destiny.oAuthToken,
    hasShellSelected: destiny.selectedGhostShell !== null,
    selectedGhostShell: destiny.selectedGhostShell,
    accessTokenExpired: destiny.equipItemResponse.error === EquipItemErrorCodes.AccessTokenExpired
  };
}

function mapDispatchToProps(dispatch) {
  return {
    equipSelectedShellToCharacter: dispatch.destiny.equipSelectedShellToCharacter,
    resetEquipItemResponse: dispatch.destiny.resetEquipItemResponse
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EquipMenu);
