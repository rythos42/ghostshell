import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import MuiDrawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from '@material-ui/icons/Menu';
import { withStyles } from '@material-ui/core/styles';

import ShellGrid from '../ShellGrid';
import Drawer from '../Drawer';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  }
});

class Main extends React.Component {
  constructor(props) {
    super(props);

    props.getAllGhostModTypes();
  }

  state = {
    mobileOpen: false
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="css">
            <MuiDrawer
              variant="temporary"
              anchor="left"
              open={this.state.mobileOpen}
              onClose={this.handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              classes={{
                paper: classes.drawerPaper
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
                paper: classes.drawerPaper
              }}
            >
              <Drawer />
            </MuiDrawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <AppBar color="default" position="static">
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerToggle}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" color="inherit">
                GhostShell
                <a href="https://www.bungie.net/en/OAuth/Authorize?client_id=25539&response_type=code&state=asdf">
                  Sign in with Bungie
                </a>
              </Typography>
            </Toolbar>
          </AppBar>
          <Card>
            <ShellGrid />
          </Card>
        </main>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getAllGhostModTypes: dispatch.destiny.getAllGhostModTypes
  };
}

export default compose(
  withStyles(styles),
  connect(
    null,
    mapDispatchToProps
  )
)(Main);
