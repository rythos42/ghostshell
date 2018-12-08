import * as DestinyApi from '../api/DestinyApi';
import * as ManifestApi from '../api/ManifestApi';

export default {
  state: {
    ghostShells: [],
    mutuallyExclusiveWhereList: [],
    ghostModTypes: {},
    mutuallyExclusiveWhereFilter: -1
  },
  reducers: {
    addGhostShells(state, ghostShells) {
      return {
        ...state,
        ghostShells
      };
    },
    setMutuallyExclusiveWhereList(state, mutuallyExclusiveWhereList) {
      mutuallyExclusiveWhereList = mutuallyExclusiveWhereList.map(where => {
        return { name: state.ghostModTypes[where], id: where };
      });

      return {
        ...state,
        mutuallyExclusiveWhereList
      };
    },
    setAllGhostModTypes(state, ghostModTypes) {
      return {
        ...state,
        ghostModTypes
      };
    },
    setMutuallyExclusiveWhereFilter(state, whereId) {
      return {
        ...state,
        mutuallyExclusiveWhereFilter: whereId
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

            const itemSockets = await DestinyApi.getItemSockets({
              membershipId: membership.membershipId,
              membershipType: membership.membershipType,
              accessToken: oAuthToken.accessToken,
              itemInstanceId: ghostShell.itemInstanceId,
              apiKey: apiKey
            });

            const socketPlugHashes = itemSockets.map(itemSocket => itemSocket.plugHash);
            const categorizedSockets = await ManifestApi.categorizeSockets(
              manifestServiceUrl,
              socketPlugHashes.filter(socketPlugHash => socketPlugHash != null)
            );

            return {
              itemInstanceId: ghostShell.itemInstanceId,
              name: itemDefinition[0].displayProperties.name,
              icon: `https://www.bungie.net${itemDefinition[0].displayProperties.icon}`,
              sockets: categorizedSockets
            };
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
              icon: vaultShellData.displayProperties.icon
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

            console.log(vaultGhostItem);

            return {
              itemInstanceId: vaultGhostItem.itemInstanceId,
              name: vaultGhostItem.name,
              icon: `https://www.bungie.net${vaultGhostItem.icon}`,
              sockets: vaultGhostItemCategorizedSockets
            };
          })
        );

        dispatch.destiny.addGhostShells(ghostShells.concat(vaultGhostShells));
        dispatch.destiny.setHasSignedIn();
        dispatch.destiny.setIsLoadingGhostShells(false);
      });
    },
    async getMutuallyExclusiveWhereList(manifestServiceUrl) {
      const exclusiveWhereList = await ManifestApi.getMutuallyExclusiveWhere(manifestServiceUrl);
      dispatch.destiny.setMutuallyExclusiveWhereList(exclusiveWhereList);
    },
    async getAllGhostModTypes(manifestServiceUrl) {
      const ghostModTypes = await ManifestApi.getAllGhostModTypes(manifestServiceUrl);
      dispatch.destiny.setAllGhostModTypes(ghostModTypes);
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

export function getItemsFromBucket(bucket, bucketHash) {
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
