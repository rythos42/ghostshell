import { default as DestinyApi } from '../api/DestinyApi';
import transferTo from '../managers/TransferManager';
import equipTo from '../managers/EquipManager';
import assembleCharacters from '../managers/MembershipManager';
import assembleShells from '../managers/ShellsManager';
import { getJsonObject } from '../util/WebUtil';

export default {
  state: {
    ghostShells: [],
    characters: [],
    filter: {},
    apiResponse: { bungieResponse: {}, message: '' },
    selectedGhostShell: null,
    destinyApi: null
  },
  reducers: {
    clearUserData(state) {
      return {
        ...state,
        ghostShells: [],
        characters: [],
        selectedGhostShell: null,
        apiResponse: { bungieResponse: {}, message: '' }
      };
    },
    addGhostShells(state, ghostShells) {
      const newGhostShells = [...state.ghostShells, ...ghostShells];
      global.localStorage.setItem('ghostShells', JSON.stringify(newGhostShells));
      return {
        ...state,
        ghostShells: newGhostShells
      };
    },
    addCharacters(state, characters) {
      const newCharacters = [...state.characters, ...characters];
      global.localStorage.setItem('characters', JSON.stringify(newCharacters));
      return {
        ...state,
        characters: newCharacters
      };
    },
    setHasSignedIn(state) {
      return {
        ...state,
        hasSignedIn: true
      };
    },
    setIsLoading(state, isLoading) {
      return {
        ...state,
        isLoading: isLoading
      };
    },
    setFilter(state, filter) {
      return {
        ...state,
        filter: { ...filter }
      };
    },
    setSelectedShell(state, selectedGhostShell) {
      return {
        ...state,
        selectedGhostShell: selectedGhostShell
      };
    },
    setApiResponseToUser(state, apiResponse) {
      if (!apiResponse.bungieResponse) apiResponse.bungieResponse = {};
      if (!apiResponse.message) apiResponse.message = '';

      return {
        ...state,
        apiResponse
      };
    },
    setDestinyApi(state, destinyApi) {
      global.localStorage.setItem('destinyApi', JSON.stringify(destinyApi));
      return {
        ...state,
        destinyApi
      };
    },
    setEquipped(state, { characterId, itemInstanceId }) {
      return {
        ...state,
        ghostShells: state.ghostShells.map(ghostShell =>
          characterId !== ghostShell.location.characterId
            ? ghostShell
            : {
                ...ghostShell,
                isEquipped: ghostShell.itemInstanceId === itemInstanceId
              }
        )
      };
    },
    setLocation(state, { itemInstanceId, location }) {
      return {
        ...state,
        ghostShells: state.ghostShells.map(ghostShell => ({
          ...ghostShell,
          location: ghostShell.itemInstanceId === itemInstanceId ? location : ghostShell.location
        }))
      };
    }
  },
  effects: dispatch => ({
    async getOAuthTokenAndGhostShells(code, state) {
      dispatch.destiny.setIsLoading(true);

      const destinyApi = new DestinyApi(state.config.apiKey);
      const oAuthToken = await destinyApi.getOAuthToken({ code, clientId: state.config.clientId });
      destinyApi.setAccessToken(oAuthToken.accessToken);
      destinyApi.setDestinyMembershipId(oAuthToken.destinyMembershipId);
      await dispatch.destiny.setDestinyApi(destinyApi);

      const membershipInfo = await destinyApi.getMembershipInfo();
      const memberships = membershipInfo.destinyMemberships;

      dispatch.destiny.clearUserData();

      memberships.forEach(async membership => {
        const { membershipId, membershipType } = membership;
        const profile = await destinyApi.getProfileData({ membershipId, membershipType });

        const characterData = assembleCharacters({ membershipType, profile, state });
        dispatch.destiny.addCharacters(characterData);

        const ghostShells = assembleShells({ profile, state, membershipType });

        dispatch.destiny.addGhostShells(ghostShells);
        dispatch.destiny.setHasSignedIn();
        dispatch.destiny.setIsLoading(false);
      });
    },
    initialize() {
      dispatch.destiny.clearUserData();

      const ghostShells = getJsonObject('ghostShells');
      if (ghostShells) {
        dispatch.destiny.addGhostShells(ghostShells);
        dispatch.destiny.setHasSignedIn();
      }

      const characters = getJsonObject('characters');
      if (characters) dispatch.destiny.addCharacters(characters);

      const destinyApi = getJsonObject('destinyApi');
      if (destinyApi) dispatch.destiny.setDestinyApi(new DestinyApi(destinyApi));
    },
    resetApiResponseToUser() {
      dispatch.destiny.setApiResponseToUser({ bungieResponse: {}, message: '' });
    },
    async equipSelectedShellToCharacter({ characterId, membershipType }, state) {
      const response = await equipTo({
        equipShell: state.destiny.selectedGhostShell,
        characterId,
        membershipType,
        state,
        dispatch
      });

      dispatch.destiny.setApiResponseToUser(response);
    },
    async transferTo({ characterId, membershipType }, state) {
      const response = await transferTo({
        transferShell: state.destiny.selectedGhostShell,
        characterId,
        membershipType,
        dispatch,
        state
      });

      dispatch.destiny.setApiResponseToUser(response);
    },
    getLocationString(location, state) {
      if (location.inVault) return 'Vault';

      const foundCharacter = state.destiny.characters.find(
        character => character.characterId === location.characterId
      );
      return foundCharacter ? foundCharacter.description : null;
    }
  })
};
