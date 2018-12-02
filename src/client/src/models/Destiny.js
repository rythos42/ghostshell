export default {
  state: {
    ghostShellIcons: []
  },
  reducers: {
    addGhostShellIcons(state, ghostShellIcons) {
      return {
        ...state,
        ghostShellIcons: ghostShellIcons.slice()
      };
    }
  }
};
