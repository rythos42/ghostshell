import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import styles from './Drawer.module.css';

class Drawer extends React.Component {
  state = {
    filter: {}
  };

  handleWhereChange = event => {
    const newState = { filter: { ...this.state.filter } };

    newState.filter[event.target.value] = !newState.filter[event.target.value];

    this.setState(newState);

    const onlyTrueValues = {};
    Object.keys(newState.filter).forEach(filterKey => {
      if (newState.filter[filterKey]) onlyTrueValues[filterKey] = true;
    });

    this.props.setFilter(onlyTrueValues);
  };

  clearFilter = () => {
    const state = { filter: {} };
    this.setState(state);
    this.props.setFilter(state.filter);
  };

  getStringForEnum = enumValue => {
    const resourceString = this.props.enumStrings[enumValue];
    return resourceString ? resourceString : enumValue;
  };

  getStringForCategory = categoryKey => {
    const resourceString = this.props.categoryStrings[categoryKey];
    return resourceString ? resourceString : categoryKey;
  };

  render() {
    return (
      <div className={styles.drawer}>
        <AppBar color="default" position="static">
          <Toolbar className={styles.toolbar}>
            <Typography variant="h6">Filter</Typography>
            <div className={styles.end}>
              <Button color="primary" size="small" onClick={this.clearFilter}>
                CLEAR
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        {Object.keys(this.props.ghostModTypeCategories).map(key => (
          <ExpansionPanel key={key}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              classes={{
                root: styles.expansionPanelSummary,
                content: styles.expansionPanelSummary,
                expandIcon: styles.expansionPanelSummary
              }}
            >
              <Typography>{this.getStringForCategory(key)}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails classes={{ root: styles.expansionPanelDetails }}>
              <List>
                {this.props.ghostModTypeCategories[key].map(modType => (
                  <ListItem key={modType} className={styles.listItem}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.filter[modType] || ''}
                          onChange={this.handleWhereChange}
                          value={modType.toString()}
                        />
                      }
                      label={this.getStringForEnum(modType)}
                    />
                  </ListItem>
                ))}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ))}

        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{
              root: styles.expansionPanelSummary,
              content: styles.expansionPanelSummary,
              expandIcon: styles.expansionPanelSummary
            }}
          >
            <Typography>About</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={{ root: styles.expansionPanelDetails }}>
            <Typography variant="caption">
              Designed and developed by <a href="mailto:rythos42@gmail.com">Craig Fleming</a>.
              E-mail for bugs or feature requests!{' '}
              <a href="https://github.com/rythos42/GhostShell">GitHub</a> pull requests welcomed!
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ghostModTypeCategories: state.ghostModTypes.categories,
    hasSignedIn: state.destiny.hasSignedIn,
    enumStrings: state.strings.enums,
    categoryStrings: state.strings.categories
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setFilter: dispatch.destiny.setFilter
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Drawer);
