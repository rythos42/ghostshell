import React from 'react';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import MuiDrawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';

import ShellGrid from '../ShellGrid';
import Drawer from '../Drawer';
import styles from './Main.module.css';

class Main extends React.Component {
  state = {
    mobileOpen: false,
    isReturningUser: false
  };

  componentDidMount() {
    const isReturningUser = global.localStorage.getItem('isReturningUser');
    this.setState({ isReturningUser: isReturningUser });
  }

  state = {
    mobileOpen: false
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  handleSignInClick = () => {
    global.localStorage.setItem('isReturningUser', true);
    this.setState({ isReturningUser: true });
  };

  render() {
    return (
      <div className={styles.container}>
        <nav className={styles.drawer}>
          <Hidden smUp implementation="css">
            <MuiDrawer
              variant="temporary"
              anchor="left"
              open={this.state.mobileOpen}
              onClose={this.handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              classes={{
                paper: styles.drawerPaper
              }}
            >
              <Drawer />
            </MuiDrawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <MuiDrawer
              variant="permanent"
              open
              classes={{
                paper: styles.drawerPaper
              }}
            >
              <Drawer />
            </MuiDrawer>
          </Hidden>
        </nav>
        <main className={styles.main}>
          <AppBar color="default" position="static">
            <Toolbar className={styles.toolbar}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerToggle}
                className={styles.menubutton}
              >
                <MenuIcon />
              </IconButton>
              <div className={styles.end}>
                <a
                  href={`https://www.bungie.net/en/OAuth/Authorize?client_id=${
                    this.props.clientId
                  }&response_type=code&state=asdf`}
                  onClick={this.handleSignInClick}
                >
                  {this.state.isReturningUser ? (
                    <RefreshIcon />
                  ) : (
                    <Typography color="inherit">Sign in with Bungie</Typography>
                  )}
                </a>
              </div>
            </Toolbar>
            {this.props.isLoadingGhostShells && <LinearProgress variant="query" />}
          </AppBar>
          <Card className={styles.content}>
            <ShellGrid />
          </Card>
        </main>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    clientId: state.config.clientId,
    isLoadingGhostShells: state.destiny.isLoadingGhostShells
  };
}

export default connect(mapStateToProps)(Main);
