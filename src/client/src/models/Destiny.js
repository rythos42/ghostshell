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
    }
  },
  effects: dispatch => ({
    async getGhostShellsForCurrentUser(code) {
      const config = await dispatch.config.getConfig();
      const apiKey = config.apiKey;
      const clientId = config.clientId;
      const manifestServiceUrl = config.manifestServiceUrl;

      const oAuthToken = await DestinyApi.getOAuthToken({ code, apiKey, clientId });
      const membershipInfo = await DestinyApi.getMembershipInfo(oAuthToken);
      const memberships = membershipInfo.destinyMemberships;

      memberships.forEach(async membership => {
        const characters = await DestinyApi.getCharacterInventories({
          membershipId: membership.membershipId,
          membershipType: membership.membershipType,
          accessToken: oAuthToken.accessToken,
          apiKey: apiKey
        });

        const ghostShellData = [];
        for (let characterId in characters) {
          if (!characters.hasOwnProperty(characterId)) continue;

          const character = characters[characterId];
          for (let itemIndex = 0; itemIndex < character.items.length; itemIndex++) {
            const item = character.items[itemIndex];
            if (item.bucketHash === 4023194814) {
              ghostShellData.push({
                itemHash: item.itemHash,
                itemInstanceId: item.itemInstanceId
              });
            }
          }
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
        dispatch.destiny.addGhostShells(ghostShells);
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
