import axios from 'axios';

export default {
  state: {
    apiKey: '',
    manifestServiceUrl: '',
    clientId: ''
  },
  reducers: {
    set(state, config) {
      return createConfig(config, state);
    }
  },
  effects: dispatch => ({
    async initialize() {
      const config = await dispatch.config.getConfig();
      await dispatch.destiny.getAllGhostModTypes(config.manifestServiceUrl);
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
    clientId: configData.bungieClientId,
    manifestServiceUrl: configData.manifestServiceUrl
  };
}
