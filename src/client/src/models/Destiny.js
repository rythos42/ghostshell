import * as DestinyApi from '../api/DestinyApi';
import * as ManifestApi from '../api/ManifestApi';

export default {
  state: {
    oAuthToken: {},
    ghostShells: [],
    characters: [],
    ghostModTypes: { categorized: {} },
    filter: {},
    races: [],
    genders: [],
    classes: [],
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
    setRaces(state, races) {
      return {
        ...state,
        races: [...races]
      };
    },
    setGenders(state, genders) {
      return {
        ...state,
        genders: [...genders]
      };
    },
    setClasses(state, classes) {
      return {
        ...state,
        classes: [...classes]
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
          const raceString = await dispatch.destiny.getRaceString(character.raceHash);
          const classString = await dispatch.destiny.getClassString(character.classHash);
          const genderString = await dispatch.destiny.getGenderString(character.genderHash);
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
        const characterInventory = characters.characterInventories.data;
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

        const characterEquipment = characters.characterEquipment.data;
        for (let characterId in characterEquipment) {
          if (!characterEquipment.hasOwnProperty(characterId)) continue;
          ghostShellData = ghostShellData.concat(
            getItemsFromBucket(
              characterEquipment[characterId].items,
              4023194814,
              characterId,
              characterDescriptions[characterId]
            )
          );
        }

        const socketData = characters.itemComponents.sockets.data;

        const ghostShells = await Promise.all(
          ghostShellData.map(async ghostShell => {
            const itemSockets = socketData[ghostShell.itemInstanceId].sockets;

            const itemDefinition = await ManifestApi.select(
              manifestServiceUrl,
              'DestinyInventoryItemDefinition',
              ghostShell.itemHash
            );
            ghostShell.name = itemDefinition[0].displayProperties.name;
            ghostShell.icon = itemDefinition[0].displayProperties.icon;
            ghostShell.description = itemDefinition[0].displayProperties.description;

            const categorizedSockets = await categorizeSockets({ itemSockets, manifestServiceUrl });
            return createGhostShell(ghostShell, categorizedSockets);
          })
        );

        // this section is currently really inefficient...
        const vaultItems = getItemsFromBucket(
          characters.profileInventory.data.items,
          138197802,
          'vault',
          'Vault'
        );

        const vaultShellsData = await ManifestApi.getGhostShellsFromVault({
          manifestServiceUrl,
          vaultItems
        });

        function isItemGhostShell(vaultShellsData, vaultItem) {
          return vaultShellsData.find(vaultShell => {
            return vaultShell.hash === vaultItem.itemHash;
          });
        }

        const vaultGhostItems = vaultItems
          .filter(vaultItem => isItemGhostShell(vaultShellsData, vaultItem))
          .map(vaultGhostItem => {
            const vaultShellData = vaultShellsData.find(vaultShell => {
              return vaultShell.hash === vaultGhostItem.itemHash;
            });
            return {
              ...vaultGhostItem,
              name: vaultShellData.displayProperties.name,
              icon: vaultShellData.displayProperties.icon,
              description: vaultShellData.displayProperties.description
            };
          });

        const vaultGhostShells = await Promise.all(
          vaultGhostItems.map(async vaultGhostItem => {
            const itemSockets = socketData[vaultGhostItem.itemInstanceId].sockets;
            const categorizedSockets = await categorizeSockets({ itemSockets, manifestServiceUrl });
            return createGhostShell(vaultGhostItem, categorizedSockets);
          })
        );

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
    async getRaceGenderClassData(arg, state) {
      const { races, genders, classes } = await ManifestApi.getRaceGenderClassData(
        state.config.manifestServiceUrl
      );
      dispatch.destiny.setRaces(races);
      dispatch.destiny.setGenders(genders);
      dispatch.destiny.setClasses(classes);
    },
    getRaceString(raceHash, state) {
      const race = state.destiny.races.find(race => race.hash === raceHash);
      return race.displayProperties.name;
    },
    getClassString(classHash, state) {
      const destinyClass = state.destiny.classes.find(
        destinyClass => destinyClass.hash === classHash
      );
      return destinyClass.displayProperties.name;
    },
    getGenderString(genderHash, state) {
      const gender = state.destiny.genders.find(gender => gender.hash === genderHash);
      return gender.displayProperties.name;
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

async function categorizeSockets({ itemSockets, manifestServiceUrl }) {
  const socketPlugHashes = itemSockets.map(itemSocket => itemSocket.plugHash);
  return await ManifestApi.categorizeSockets(
    manifestServiceUrl,
    socketPlugHashes.filter(socketPlugHash => socketPlugHash != null)
  );
}

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

function createGhostShell(ghostShell, sockets) {
  return {
    itemInstanceId: ghostShell.itemInstanceId,
    name: ghostShell.name,
    icon: `https://www.bungie.net${ghostShell.icon}`,
    sockets: sockets,
    location: ghostShell.location,
    locationString: ghostShell.locationString
  };
}
