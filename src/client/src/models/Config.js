import axios from 'axios';

export default {
  state: {
    apiKey: '',
    manifestServiceUrl: ''
  },
  reducers: {
    set(state, config) {
      return {
        ...state,
        baseName: config.baseName,
        apiKey: config.bungieApiKey,
        clientId: config.bungieClientId,
        manifestServiceUrl: config.manifestServiceUrl
      };
    }
  },
  effects: dispatch => ({
    async initialize() {
      const config = await dispatch.config.getConfig();
      await dispatch.destiny.getAllGhostModTypes(config.manifestServiceUrl);
      await dispatch.destiny.getMutuallyExclusiveWhereList(config.manifestServiceUrl);
    },
    async getConfig() {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const config = await axios.get('config.json', axiosConfig);
      dispatch.config.set(config.data);
      return {
        baseName: config.data.baseName,
        apiKey: config.data.bungieApiKey,
        clientId: config.data.bungieClientId,
        manifestServiceUrl: config.data.manifestServiceUrl
      };
    }
  })
};
