import * as DestinyApi from '../api/DestinyApi';
import * as ManifestApi from '../api/ManifestApi';

export default {
  state: {
    oAuthToken: {},
    ghostShells: [],
    characters: [],
    ghostModTypes: { categorized: {} },
    filter: {},
    equipItemResponse: {},
    selectedGhostShell: null
  },
  reducers: {
    addGhostShells(state, ghostShells) {
      global.localStorage.setItem('ghostShells', JSON.stringify(ghostShells));
      return {
        ...state,
        ghostShells
      };
    },
    setCharacters(state, characters) {
      global.localStorage.setItem('characters', JSON.stringify(characters));
      return {
        ...state,
        characters
      };
    },
    setAllGhostModTypes(state, ghostModTypes) {
      return {
        ...state,
        ghostModTypes
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
    setOAuthToken(state, oAuthToken) {
      global.localStorage.setItem('oAuthToken', JSON.stringify(oAuthToken));
      return {
        ...state,
        oAuthToken: oAuthToken
      };
    },
    setEquipItemResponse(state, equipItemResponse) {
      return {
        ...state,
        equipItemResponse
      };
    }
  },
  effects: dispatch => ({
    async getOAuthTokenAndGhostShells(code) {
      await dispatch.destiny.getOAuthToken(code);
      await dispatch.destiny.getGhostShellsForCurrentUser();
    },
    async getOAuthToken(code, state) {
      const { apiKey, clientId } = state.config;
      const oAuthToken = await DestinyApi.getOAuthToken({ code, apiKey, clientId });
      dispatch.destiny.setOAuthToken(oAuthToken);
    },
    async getGhostShellsForCurrentUser(args, state) {
      dispatch.destiny.setIsLoading(true);

      const manifestServiceUrl = state.config.manifestServiceUrl;
      const oAuthToken = state.destiny.oAuthToken;
      const apiKey = oAuthToken.apiKey;
      const membershipInfo = await DestinyApi.getMembershipInfo(oAuthToken);
      const memberships = membershipInfo.destinyMemberships;

      memberships.forEach(async membership => {
        const characters = await DestinyApi.getProfileData({
          membershipId: membership.membershipId,
          membershipType: membership.membershipType,
          accessToken: oAuthToken.accessToken,
          apiKey: apiKey
        });

        const characterData = [];
        const characterDescriptions = {};
        const bungieCharacters = characters.characters.data;
        for (let characterId in bungieCharacters) {
          if (!bungieCharacters.hasOwnProperty(characterId)) continue;

          const character = bungieCharacters[characterId];

          const raceString = getByHash(state.manifest.races, character.raceHash).displayProperties
            .name;
          const classString = getByHash(state.manifest.classes, character.classHash)
            .displayProperties.name;
          const genderString = getByHash(state.manifest.genders, character.genderHash)
            .displayProperties.name;

          characterDescriptions[
            characterId
          ] = `${classString.toUpperCase()} ${raceString} ${genderString}`;

          characterData.push({
            characterId: characterId,
            emblemBackgroundPath: character.emblemBackgroundPath,
            membershipType: membership.membershipType,
            raceString: raceString,
            classString: classString,
            genderString: genderString
          });
        }
        dispatch.destiny.setCharacters(characterData);

        let ghostShellData = [];
        const types = ['characterInventories', 'characterEquipment'];
        for (let inventoryTypeIndex = 0; inventoryTypeIndex < types.length; inventoryTypeIndex++) {
          const characterInventory = characters[types[inventoryTypeIndex]].data;
          for (let characterId in characterInventory) {
            if (!characterInventory.hasOwnProperty(characterId)) continue;
            ghostShellData = ghostShellData.concat(
              getItemsFromBucket(
                characterInventory[characterId].items,
                4023194814,
                characterId,
                characterDescriptions[characterId]
              )
            );
          }
        }

        const socketData = characters.itemComponents.sockets.data;
        const ghostShells = await getGhostShellsFromItems({
          items: ghostShellData,
          inventory: state.manifest.inventory,
          socketData,
          manifestServiceUrl
        });

        const vaultItems = getItemsFromBucket(
          characters.profileInventory.data.items,
          138197802,
          'vault',
          'Vault'
        );

        const vaultGhostShells = await getGhostShellsFromItems({
          items: vaultItems,
          inventory: state.manifest.inventory,
          socketData,
          manifestServiceUrl
        });

        dispatch.destiny.addGhostShells(ghostShells.concat(vaultGhostShells));
        dispatch.destiny.setHasSignedIn();
        dispatch.destiny.setIsLoading(false);
      });
    },
    async getAllGhostModTypes(arg, state) {
      const ghostModTypes = await ManifestApi.getAllGhostModTypes(state.config.manifestServiceUrl);
      dispatch.destiny.setAllGhostModTypes(ghostModTypes);
    },
    initialize() {
      function getObject(key) {
        const json = global.localStorage.getItem(key);
        return json ? JSON.parse(json) : null;
      }

      const ghostShells = getObject('ghostShells');
      if (ghostShells) {
        dispatch.destiny.addGhostShells(ghostShells);
        dispatch.destiny.setHasSignedIn();
      }

      const characters = getObject('characters');
      if (characters) dispatch.destiny.setCharacters(characters);

      const oAuthToken = getObject('oAuthToken');
      if (oAuthToken) dispatch.destiny.setOAuthToken(oAuthToken);
    },
    async equipSelectedShellToCharacter({ characterId, membershipType }, state) {
      const selectedGhostShell = state.destiny.selectedGhostShell;
      const accessToken = state.destiny.oAuthToken.accessToken;
      const apiKey = state.config.apiKey;

      const response = await DestinyApi.equipItem({
        characterId,
        membershipType,
        accessToken,
        apiKey,
        itemId: selectedGhostShell.itemInstanceId
      });

      dispatch.destiny.setEquipItemResponse(response);
    },
    resetEquipItemResponse() {
      dispatch.destiny.setEquipItemResponse({});
    }
  })
};

function getItemsFromBucket(bucket, bucketHash, location, locationString) {
  const array = [];
  for (let itemIndex = 0; itemIndex < bucket.length; itemIndex++) {
    const item = bucket[itemIndex];
    if (item.bucketHash === bucketHash) {
      array.push({
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId,
        location,
        locationString
      });
    }
  }
  return array;
}

function getByHash(array, hash) {
  return array[hash] || array[hash - 4294967296];
}

async function getGhostShellsFromItems({ items, inventory, socketData, manifestServiceUrl }) {
  const ghostShells = await Promise.all(
    items.map(async ghostShell => {
      const itemDefinition = getByHash(inventory, ghostShell.itemHash);
      if (!itemDefinition) return null;
      ghostShell.name = itemDefinition.displayProperties.name;
      ghostShell.icon = itemDefinition.displayProperties.icon;
      ghostShell.description = itemDefinition.displayProperties.description;

      const socketPlugHashes = socketData[ghostShell.itemInstanceId].sockets
        .map(itemSocket => itemSocket.plugHash)
        .filter(socketPlugHash => socketPlugHash != null);
      const categorizedSockets = await ManifestApi.categorizeSockets(
        manifestServiceUrl,
        socketPlugHashes
      );

      return {
        itemInstanceId: ghostShell.itemInstanceId,
        name: ghostShell.name,
        icon: `https://www.bungie.net${ghostShell.icon}`,
        sockets: categorizedSockets,
        location: ghostShell.location,
        locationString: ghostShell.locationString
      };
    })
  );
  return ghostShells.filter(vaultGhostItem => vaultGhostItem);
}
