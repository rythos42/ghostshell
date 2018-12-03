import * as DestinyApi from '../api/DestinyApi';
import { select, categorizeSockets } from '../api/ManifestApi';

export default {
  state: {
    ghostShells: []
  },
  reducers: {
    addGhostShells(state, ghostShells) {
      return {
        ...state,
        ghostShells
      };
    }
  },
  effects: dispatch => ({
    async getOAuthToken(code) {
      const oAuthToken = await DestinyApi.getOAuthToken(code);
      const membershipInfo = await DestinyApi.getMembershipInfo(oAuthToken);
      const memberships = membershipInfo.destinyMemberships;

      memberships.forEach(async membership => {
        const characters = await DestinyApi.getCharacterInventories({
          membershipId: membership.membershipId,
          membershipType: membership.membershipType,
          accessToken: oAuthToken.accessToken
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
            const itemDefinition = await select(
              'DestinyInventoryItemDefinition',
              ghostShell.itemHash
            );

            const itemSockets = await DestinyApi.getItemSockets({
              membershipId: membership.membershipId,
              membershipType: membership.membershipType,
              accessToken: oAuthToken.accessToken,
              itemInstanceId: ghostShell.itemInstanceId
            });

            const socketPlugHashes = itemSockets.map(itemSocket => itemSocket.plugHash);
            const categorizedSockets = await categorizeSockets(
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
    }
  })
};
