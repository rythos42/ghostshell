import React from 'react';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';

import styles from './AppBar.module.css';
import EquipMenu from '../EquipMenu';

export default class AppBar extends React.Component {
  render() {
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
            <a
              href={`https://www.bungie.net/en/OAuth/Authorize?client_id=${
                this.props.clientId
              }&response_type=code&state=asdf`}
              onClick={this.handleSignInClick}
            >
              {this.props.isReturningUser ? (
                <IconButton>
                  <RefreshIcon />
                </IconButton>
              ) : (
                <Typography color="inherit">Sign in with Bungie</Typography>
              )}
            </a>
          </div>
        </Toolbar>
        {this.props.showProgressBar && <LinearProgress variant="query" />}
      </MuiAppBar>
    );
  }
}
