import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
});

class Drawer extends React.Component {
  state = {
    where: -1
  };

  handleWhereChange = event => {
    this.setState({ where: event.target.value });
    this.props.setMutuallyExclusiveWhereFilter(event.target.value);
  };

  render() {
    const { classes, mutuallyExclusiveWhereList } = this.props;

    return (
      <div className={classes.root}>
        <List>
          <ListItem>
            <Select value={this.state.where} onChange={this.handleWhereChange}>
              <MenuItem value="-1">None</MenuItem>
              {mutuallyExclusiveWhereList.map(where => (
                <MenuItem value={where.id} key={where.id}>
                  {where.name}
                </MenuItem>
              ))}
            </Select>
          </ListItem>
        </List>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    mutuallyExclusiveWhereList: state.destiny.mutuallyExclusiveWhereList
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
