import * as DestinyApi from '../api/DestinyApi';
import * as ManifestApi from '../api/ManifestApi';

export default {
  state: {
    ghostShells: [],
    ghostModTypes: { categorized: {} },
    filter: {}
  },
  reducers: {
    addGhostShells(state, ghostShells) {
      global.localStorage.setItem('ghostShells', JSON.stringify(ghostShells));
      return {
        ...state,
        ghostShells
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
    setIsLoadingGhostShells(state, isLoading) {
      return {
        ...state,
        isLoadingGhostShells: isLoading
      };
    },
    setFilter(state, filter) {
      return {
        ...state,
        filter: { ...filter }
      };
    }
  },
  effects: dispatch => ({
    async getGhostShellsForCurrentUser(code) {
      dispatch.destiny.setIsLoadingGhostShells(true);
      const config = await dispatch.config.getConfig();
      const apiKey = config.apiKey;
      const clientId = config.clientId;
      const manifestServiceUrl = config.manifestServiceUrl;

      const oAuthToken = await DestinyApi.getOAuthToken({ code, apiKey, clientId });
      const membershipInfo = await DestinyApi.getMembershipInfo(oAuthToken);
      const memberships = membershipInfo.destinyMemberships;

      memberships.forEach(async membership => {
        const characters = await DestinyApi.getProfileItems({
          membershipId: membership.membershipId,
          membershipType: membership.membershipType,
          accessToken: oAuthToken.accessToken,
          apiKey: apiKey
        });

        let ghostShellData = [];
        const characterInventory = characters.characterInventories.data;
        for (let characterId in characterInventory) {
          if (!characterInventory.hasOwnProperty(characterId)) continue;
          ghostShellData = ghostShellData.concat(
            getItemsFromBucket(characterInventory[characterId].items, 4023194814)
          );
        }

        const characterEquipment = characters.characterEquipment.data;
        for (let characterId in characterEquipment) {
          if (!characterEquipment.hasOwnProperty(characterId)) continue;
          ghostShellData = ghostShellData.concat(
            getItemsFromBucket(characterEquipment[characterId].items, 4023194814)
          );
        }

        const ghostShells = await Promise.all(
          ghostShellData.map(async ghostShell => {
            const itemDefinition = await ManifestApi.select(
              manifestServiceUrl,
              'DestinyInventoryItemDefinition',
              ghostShell.itemHash
            );
            ghostShell.name = itemDefinition[0].displayProperties.name;
            ghostShell.icon = itemDefinition[0].displayProperties.icon;
            ghostShell.description = itemDefinition[0].displayProperties.description;

            const categorizedSockets = await getCategorizedSocketsForItemInstance({
              membershipId: membership.membershipId,
              membershipType: membership.membershipType,
              accessToken: oAuthToken.accessToken,
              itemInstanceId: ghostShell.itemInstanceId,
              apiKey,
              manifestServiceUrl
            });

            return createGhostShell(ghostShell, categorizedSockets);
          })
        );

        // this section is currently really inefficient...
        const vaultItems = getItemsFromBucket(characters.profileInventory.data.items, 138197802);

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
            const vaultGhostItemCategorizedSockets = await getCategorizedSocketsForItemInstance({
              membershipId: membership.membershipId,
              membershipType: membership.membershipType,
              accessToken: oAuthToken.accessToken,
              itemInstanceId: vaultGhostItem.itemInstanceId,
              apiKey,
              manifestServiceUrl
            });

            return createGhostShell(vaultGhostItem, vaultGhostItemCategorizedSockets);
          })
        );

        dispatch.destiny.addGhostShells(ghostShells.concat(vaultGhostShells));
        dispatch.destiny.setHasSignedIn();
        dispatch.destiny.setIsLoadingGhostShells(false);
      });
    },
    async getAllGhostModTypes(manifestServiceUrl) {
      const ghostModTypes = await ManifestApi.getAllGhostModTypes(manifestServiceUrl);
      dispatch.destiny.setAllGhostModTypes(ghostModTypes);
    },
    initialize() {
      const ghostShellsJson = global.localStorage.getItem('ghostShells');
      if (ghostShellsJson) {
        const ghostShells = JSON.parse(ghostShellsJson);
        dispatch.destiny.addGhostShells(ghostShells);
        dispatch.destiny.setHasSignedIn();
      }
    }
  })
};

async function getCategorizedSocketsForItemInstance({
  membershipId,
  membershipType,
  accessToken,
  itemInstanceId,
  apiKey,
  manifestServiceUrl
}) {
  const itemSockets = await DestinyApi.getItemSockets({
    membershipId,
    membershipType,
    accessToken,
    itemInstanceId,
    apiKey
  });

  const socketPlugHashes = itemSockets.map(itemSocket => itemSocket.plugHash);
  return await ManifestApi.categorizeSockets(
    manifestServiceUrl,
    socketPlugHashes.filter(socketPlugHash => socketPlugHash != null)
  );
}

function getItemsFromBucket(bucket, bucketHash) {
  const array = [];
  for (let itemIndex = 0; itemIndex < bucket.length; itemIndex++) {
    const item = bucket[itemIndex];
    if (item.bucketHash === bucketHash) {
      array.push({
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId
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
    sockets: sockets
  };
}
