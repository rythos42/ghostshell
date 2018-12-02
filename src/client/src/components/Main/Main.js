import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';

import ShellGrid from '../ShellGrid';

function Main() {
  return (
    <div>
      <AppBar position="static" color="default">
        <Toolbar>
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
    </div>
  );
}

export default Main;
