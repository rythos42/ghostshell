import axios from 'axios';

export default {
  state: {
    races: {},
    classes: {},
    genders: {},
    inventory: {}
  },
  reducers: {
    set(state, manifest) {
      return {
        ...state,
        races: manifest.race,
        classes: manifest.class,
        genders: manifest.gender,
        inventory: manifest.inventory
      };
    }
  },
  effects: dispatch => ({
    async initialize() {
      const axiosConfig = { headers: { 'Content-Type': 'application/json' } };
      const manifest = await axios.get('destinymanifest.json', axiosConfig);

      dispatch.manifest.set(manifest.data);
    }
  })
};
