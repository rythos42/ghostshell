import { default as DestinyApi, BungieCodes } from '../api/DestinyApi';

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
    setEquipped(state, itemInstanceId) {
      return {
        ...state,
        ghostShells: state.ghostShells.map(ghostShell => ({
          ...ghostShell,
          isEquipped: ghostShell.itemInstanceId === itemInstanceId
        }))
      };
    },
    setLocation(state, { itemInstanceId, location, locationString }) {
      return {
        ...state,
        ghostShells: state.ghostShells.map(ghostShell => ({
          ...ghostShell,
          location: ghostShell.itemInstanceId === itemInstanceId ? location : ghostShell.location,
          locationString:
            ghostShell.itemInstanceId === itemInstanceId
              ? locationString
              : ghostShell.locationString
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

      memberships.forEach(async membership => {
        const characters = await destinyApi.getProfileData({
          membershipId: membership.membershipId,
          membershipType: membership.membershipType
        });

        const characterData = [];
        const characterDescriptions = {};
        const bungieCharacters = characters.characters.data;
        for (let characterId in bungieCharacters) {
          if (!bungieCharacters.hasOwnProperty(characterId)) continue;

          const character = bungieCharacters[characterId];

          const raceString = getName(state.manifest.races, character.raceHash);
          const classString = getName(state.manifest.classes, character.classHash);
          const genderString = getName(state.manifest.genders, character.genderHash);

          const locationString = `${classString.toUpperCase()} ${raceString} ${genderString}`;
          characterDescriptions[characterId] = locationString;

          characterData.push({
            characterId: characterId,
            emblemBackgroundPath: character.emblemBackgroundPath,
            membershipType: membership.membershipType,
            raceString: raceString,
            classString: classString,
            genderString: genderString,
            locationString: locationString
          });
        }
        dispatch.destiny.setCharacters(characterData);

        let ghostShellData = [];
        const types = ['characterInventories', 'characterEquipment'];
        for (let inventoryTypeIndex = 0; inventoryTypeIndex < types.length; inventoryTypeIndex++) {
          const inventoryType = types[inventoryTypeIndex];
          const characterInventory = characters[inventoryType].data;
          for (let characterId in characterInventory) {
            if (!characterInventory.hasOwnProperty(characterId)) continue;

            ghostShellData = ghostShellData.concat(
              getItemsFromBucket({
                bucket: characterInventory[characterId].items,
                bucketHash: 4023194814,
                location: characterId,
                locationString: characterDescriptions[characterId],
                isEquipped: inventoryType === 'characterEquipment'
              })
            );
          }
        }

        const socketData = characters.itemComponents.sockets.data;
        const ghostShells = await getGhostShellsFromItems({
          items: ghostShellData,
          inventory: state.manifest.inventory,
          socketData,
          dispatch
        });

        const vaultItems = getItemsFromBucket({
          bucket: characters.profileInventory.data.items,
          bucketHash: 138197802,
          location: 'vault',
          locationString: 'Vault',
          isEquipped: false
        });

        const vaultGhostShells = await getGhostShellsFromItems({
          items: vaultItems,
          inventory: state.manifest.inventory,
          socketData,
          dispatch
        });

        dispatch.destiny.addGhostShells(ghostShells.concat(vaultGhostShells));
        dispatch.destiny.setHasSignedIn();
        dispatch.destiny.setIsLoading(false);
      });
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

      const destinyApi = getObject('destinyApi');
      if (destinyApi) dispatch.destiny.setDestinyApi(new DestinyApi(destinyApi));
    },
    async equipSelectedShellToCharacter({ characterId, membershipType }, state) {
      const { selectedGhostShell, destinyApi } = state.destiny;
      let response = {};
      const equipItem = destinyApi.createEquipItem({ characterId, membershipType });

      try {
        response = await equipItem(selectedGhostShell);
      } catch (e) {
        dispatch.destiny.setApiResponseToUser({
          bungieResponse: {},
          message:
            'Your access to Bungie through this app has expired and must be refreshed before you can equip.'
        });
        return;
      }

      // not on character to equip
      switch (response.ErrorCode) {
        case BungieCodes.Success:
          dispatch.destiny.setEquipped(selectedGhostShell.itemInstanceId);
          break;
        case BungieCodes.ItemNotFound:
          const success = await dispatch.destiny.transferTo({ characterId, membershipType });
          if (success) response = await equipItem(selectedGhostShell);
          break;
        case BungieCodes.CharacterNotInTower:
          if (selectedGhostShell.location !== characterId) {
            const success = await dispatch.destiny.transferTo({ characterId, membershipType });
            if (success) {
              dispatch.destiny.setApiResponseToUser({
                bungieResponse: response,
                message:
                  'Cannot equip as you are not in social space, orbit or logged off. Transferred item to inventory instead.'
              });
              return;
            }
          }
          break;
        default:
          break;
      }

      dispatch.destiny.setApiResponseToUser({
        bungieResponse: response,
        message: response.ErrorCode === BungieCodes.Success ? 'Equipped' : response.Message
      });
    },
    resetApiResponseToUser() {
      dispatch.destiny.setApiResponseToUser({ bungieResponse: {}, message: '' });
    },
    async transferTo({ characterId, membershipType }, state) {
      const { selectedGhostShell, destinyApi } = state.destiny;
      const transferItem = destinyApi.createTransferItem({ characterId, membershipType });
      const response = await transferItem({ shell: selectedGhostShell, toVault: false });
      const character = state.destiny.characters.find(
        character => character.characterId === characterId
      );

      switch (response.ErrorCode) {
        case BungieCodes.Success:
          dispatch.destiny.setLocation({
            itemInstanceId: selectedGhostShell.itemInstanceId,
            location: characterId,
            locationString: character.locationString
          });
          return true;

        case BungieCodes.NoRoomInDestination:
          // can't transfer to character -- transfer a non-equipped shell from character to vault then try again
          const nonEquippedShell = state.destiny.ghostShells.find(
            ghostShell => ghostShell.location === characterId && !ghostShell.isEquipped
          );

          const respToVault = await transferItem({ shell: nonEquippedShell, toVault: true });
          if (respToVault.ErrorCode !== BungieCodes.Success) {
            dispatch.destiny.setApiResponseToUser({
              bungieResponse: respToVault,
              message:
                'Could not transfer from character to vault to make space to transfer to character.'
            });
            return false;
          }
          dispatch.destiny.setLocation({
            itemInstanceId: nonEquippedShell.itemInstanceId,
            location: 'vault',
            locationString: 'Vault'
          });

          // try the transfer again
          const respToCharacter = await transferItem({ shell: selectedGhostShell, toVault: false });
          if (respToCharacter.ErrorCode !== BungieCodes.Success) {
            dispatch.destiny.setApiResponseToUser({ bungieResponse: respToCharacter });
            return false;
          }

          dispatch.destiny.setLocation({
            itemInstanceId: selectedGhostShell.itemInstanceId,
            location: characterId,
            locationString: character.locationString
          });

          return true;

        case BungieCodes.ItemNotFound:
          // trying to transfer guardian-to-guardian
          break;

        default:
          return false;
      }
    }
  })
};

function getItemsFromBucket({ bucket, bucketHash, location, locationString, isEquipped }) {
  const array = [];
  for (let itemIndex = 0; itemIndex < bucket.length; itemIndex++) {
    const item = bucket[itemIndex];
    if (item.bucketHash === bucketHash) {
      array.push({
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId,
        location,
        locationString,
        isEquipped
      });
    }
  }
  return array;
}

function getName(array, hash) {
  return getByHash(array, hash).displayProperties.name;
}

function getByHash(array, hash) {
  return array[hash] || array[hash - 4294967296];
}

async function getGhostShellsFromItems({ items, inventory, socketData, dispatch }) {
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

      const categorizedSockets = await dispatch.ghostModTypes.categorizeSockets(socketPlugHashes);

      return {
        ...ghostShell,
        icon: `https://www.bungie.net${ghostShell.icon}`,
        sockets: categorizedSockets
      };
    })
  );
  return ghostShells.filter(vaultGhostItem => vaultGhostItem);
}
