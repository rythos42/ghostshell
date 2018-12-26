import axios from 'axios';

export default {
  state: {
    apiKey: '',
    clientId: ''
  },
  reducers: {
    set(state, config) {
      return createConfig(config, state);
    }
  },
  effects: dispatch => ({
    async initialize() {
      await dispatch.config.getConfig();
    },
    async getConfig() {
      const axiosConfig = { headers: { 'Content-Type': 'application/json' } };
      const config = await axios.get('config.json', axiosConfig);
      dispatch.config.set(config.data);
      return createConfig(config.data);
    }
  })
};

function createConfig(configData, state) {
  return {
    ...state,
    apiKey: configData.bungieApiKey,
    clientId: configData.bungieClientId
  };
}
