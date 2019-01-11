import axios from 'axios';
import detectHover from 'detect-hover';

export default {
  state: {
    apiKey: '',
    clientId: '',
    hasHover: detectHover.hover === true
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
    clientId: configData.bungieClientId,
    hasHover: detectHover.hover === true
  };
}
