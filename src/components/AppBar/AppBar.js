import React from 'react';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';

import styles from './AppBar.module.css';
import EquipMenu from '../EquipMenu';

export default class AppBar extends React.Component {
  render() {
    const href = `https://www.bungie.net/en/OAuth/Authorize?client_id=${
      this.props.clientId
    }&response_type=code&state=asdf`;
    return (
      <MuiAppBar color="default" position="static">
        <Toolbar className={styles.toolbar}>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={this.props.onMenuIconClick}
            className={styles.menubutton}
          >
            <MenuIcon />
          </IconButton>
          <div className={styles.end}>
            <EquipMenu />
            {this.props.isReturningUser ? (
              <IconButton href={href}>
                <RefreshIcon />
              </IconButton>
            ) : (
              <Button href={href}>Sign in with Bungie</Button>
            )}
          </div>
        </Toolbar>
        {this.props.showProgressBar && <LinearProgress variant="query" />}
      </MuiAppBar>
    );
  }
}
