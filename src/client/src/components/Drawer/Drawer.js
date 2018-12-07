import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';

import styles from './Drawer.module.css';

class Drawer extends React.Component {
  state = {
    where: -1
  };

  handleWhereChange = event => {
    this.setState({ where: event.target.value });
    this.props.setMutuallyExclusiveWhereFilter(event.target.value);
  };

  render() {
    return (
      <div className={styles.drawer}>
        <List>
          <ListItem>
            <Typography variant="h6">Filter</Typography>
          </ListItem>
          <ListItem>
            <FormControl className={styles.formControl}>
              <InputLabel shrink htmlFor="mutuallyExclusiveWhere">
                Where
              </InputLabel>
              <Select
                value={this.state.where}
                onChange={this.handleWhereChange}
                id="mutuallyExclusiveWhere"
                disabled={!this.props.hasSignedIn}
              >
                <MenuItem value="-1">None</MenuItem>
                {this.props.mutuallyExclusiveWhereList.map(where => (
                  <MenuItem value={where.id} key={where.id}>
                    {where.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    mutuallyExclusiveWhereList: state.destiny.mutuallyExclusiveWhereList,
    hasSignedIn: state.destiny.hasSignedIn
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setMutuallyExclusiveWhereFilter: dispatch.destiny.setMutuallyExclusiveWhereFilter
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Drawer);
