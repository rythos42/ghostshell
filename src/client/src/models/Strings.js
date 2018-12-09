import axios from 'axios';

export default {
  state: {
    enums: {},
    categories: {}
  },
  reducers: {
    set(state, strings) {
      return {
        ...state,
        enums: { ...strings.enums },
        categories: { ...strings.categories }
      };
    }
  },
  effects: dispatch => ({
    async initialize() {
      const axiosConfig = { headers: { 'Content-Type': 'application/json' } };
      const strings = await axios.get('strings.json', axiosConfig);
      dispatch.strings.set(strings.data);
      return strings.data;
    }
  })
};
