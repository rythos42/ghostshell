import * as DestinyApi from '../api/DestinyApi';
import select from '../api/ManifestApi';

export default {
  state: {},
  reducers: {},
  effects: dispatch => ({
    async getOAuthToken(code) {
      const oAuthToken = await DestinyApi.getOAuthToken(code);

      dispatch.membership.getMemberships(oAuthToken);
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

        let ghostShellIcons = [];
        for (let characterId in characters) {
          if (!characters.hasOwnProperty(characterId)) continue;

          const character = characters[characterId];
          for (let itemIndex = 0; itemIndex < character.items.length; itemIndex++) {
            const item = character.items[itemIndex];
            if (item.bucketHash === 4023194814) {
              const itemDefinition = await select('DestinyInventoryItemDefinition', item.itemHash);
              ghostShellIcons.push(`http://www.bungie.net${itemDefinition.displayProperties.icon}`);
            }
          }
        }
        console.log(ghostShellIcons);
        dispatch.destiny.addGhostShellIcons(ghostShellIcons);
      });
    }
  })
};
