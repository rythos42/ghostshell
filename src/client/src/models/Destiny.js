import * as DestinyApi from '../api/DestinyApi';
import select from '../api/ManifestApi';

export default {
  state: {
    ghostShellIcons: []
  },
  reducers: {
    addGhostShellIcons(state, ghostShellIcons) {
      return {
        ...state,
        ghostShellIcons
      };
    }
  },
  effects: dispatch => ({
    async getOAuthToken(code) {
      const oAuthToken = await DestinyApi.getOAuthToken(code);

      dispatch.destiny.getMemberships(oAuthToken);
    },
    async getMemberships(oAuthToken) {
      const membershipInfo = await DestinyApi.getMembershipInfo(oAuthToken);
      const memberships = membershipInfo.destinyMemberships;

      memberships.forEach(async membership => {
        const characters = await DestinyApi.getCharacterInventories({
          membershipId: membership.membershipId,
          membershipType: membership.membershipType,
          accessToken: oAuthToken.accessToken
        });

        const ghostShellHashes = [];
        for (let characterId in characters) {
          if (!characters.hasOwnProperty(characterId)) continue;

          const character = characters[characterId];
          for (let itemIndex = 0; itemIndex < character.items.length; itemIndex++) {
            const item = character.items[itemIndex];
            if (item.bucketHash === 4023194814) ghostShellHashes.push(item.itemHash);
          }
        }

        const itemDefinitions = await select(
          'DestinyInventoryItemDefinition',
          ghostShellHashes.join()
        );

        const ghostShellIcons = itemDefinitions.map(itemDefinition => {
          return `https://www.bungie.net${itemDefinition.displayProperties.icon}`;
        });
        dispatch.destiny.addGhostShellIcons(ghostShellIcons);
      });
    }
  })
};
