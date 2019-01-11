import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import MuiDrawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';

import ShellGrid from '../ShellGrid';
import Drawer from '../Drawer';
import AppBar from '../AppBar';
import ShellInfo from '../ShellInfo';
import styles from './Main.module.css';

class Main extends React.Component {
  state = {
    mobileOpen: false
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { hasHover, selectedGhostShell } = this.props;

    return (
      <div className={styles.container}>
        <header>
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
          <AppBar
            isReturningUser={this.props.hasSignedIn}
            showProgressBar={this.props.isLoading}
            clientId={this.props.clientId}
            onMenuIconClick={this.handleDrawerToggle}
          />
        </header>
        <main className={styles.main}>
          <Card className={styles.content}>
            <ShellGrid />
          </Card>
        </main>
        {!hasHover && selectedGhostShell && (
          <footer className={styles.shellInfoFooter}>
            <ShellInfo ghostShell={selectedGhostShell} />
          </footer>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    clientId: state.config.clientId,
    isLoading: state.destiny.isLoading,
    hasSignedIn: state.destiny.destinyApi !== null,
    selectedGhostShell: state.destiny.selectedGhostShell,
    hasHover: state.config.hasHover
  };
}

export default connect(mapStateToProps)(Main);
