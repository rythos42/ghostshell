import { BungieCodes } from '../api/DestinyApi';
import equipTo from './EquipManager';

async function transferTo({ transferShell, characterId, membershipType, dispatch, state }) {
  const { destinyApi } = state.destiny;
  const response = await destinyApi.transferItem({
    characterId,
    membershipType,
    itemInstanceId: transferShell.itemInstanceId,
    itemHash: transferShell.itemHash,
    toVault: false
  });

  switch (response.ErrorCode) {
    case BungieCodes.Success:
      dispatch.destiny.setLocation({
        itemInstanceId: transferShell.itemInstanceId,
        location: { characterId, membershipType, inVault: false }
      });
      return {};

    case BungieCodes.NoRoomInDestination:
      // can't transfer to character -- transfer a non-equipped shell from character to vault then try again
      const nonEquippedShell = state.destiny.ghostShells.find(
        ghostShell => ghostShell.location.characterId === characterId && !ghostShell.isEquipped
      );

      const respToVault = await destinyApi.transferItem({
        characterId,
        membershipType,
        itemInstanceId: nonEquippedShell.itemInstanceId,
        itemHash: nonEquippedShell.itemHash,
        toVault: true
      });
      if (respToVault.ErrorCode !== BungieCodes.Success) {
        return {
          bungieResponse: respToVault,
          message:
            'Could not transfer from character to vault in order to make space to transfer to character.',
          error: true
        };
      }
      dispatch.destiny.setLocation({
        itemInstanceId: nonEquippedShell.itemInstanceId,
        location: { membershipType, inVault: true }
      });

      // try the transfer again
      const respToCharacter = await destinyApi.transferItem({
        characterId,
        membershipType,
        itemInstanceId: transferShell.itemInstanceId,
        itemHash: transferShell.itemHash,
        toVault: false
      });
      if (respToCharacter.ErrorCode !== BungieCodes.Success)
        return { bungieResponse: respToCharacter, error: true };

      dispatch.destiny.setLocation({
        itemInstanceId: transferShell.itemInstanceId,
        location: { characterId, membershipType, inVault: false }
      });

      return {};

    case BungieCodes.ItemNotFound:
      // trying to transfer guardian-to-guardian
      if (transferShell.isEquipped) {
        // deequip first by equipping anything else
        let shellToEquip = state.destiny.ghostShells.find(
          ghostShell =>
            ghostShell.location.characterId === transferShell.location.characterId &&
            !ghostShell.isEquipped
        );
        if (!shellToEquip) {
          // other guardian doesn't have any shells on them
          shellToEquip = state.destiny.ghostShells.find(ghostShell => ghostShell.location.inVault);
          if (!shellToEquip) {
            // there's no shell on the other guardian that isn't equipped, no shell in vault, try transferring from THIS guardian
            shellToEquip = state.destiny.ghostShells.find(
              ghostShell =>
                ghostShell.location.characterId === characterId && !ghostShell.isEquipped
            );
            if (!shellToEquip) {
              // we've looked enough, leave it
              return {
                message: 'Could not find shell to replace desired shell on other guardian.',
                error: true
              };
            }

            const respFromThisToVault = await destinyApi.transferItem({
              characterId,
              membershipType,
              itemInstanceId: shellToEquip.itemInstanceId,
              itemHash: shellToEquip.itemHash,
              toVault: true
            });
            if (respFromThisToVault.ErrorCode !== BungieCodes.Success) {
              return {
                bungieResponse: respFromThisToVault,
                message:
                  'Could not transfer from character to vault in order to make space to transfer to character.',
                error: true
              };
            }

            dispatch.destiny.setLocation({
              itemInstanceId: shellToEquip.itemInstanceId,
              location: { membershipType, inVault: true }
            });
          }

          // use this function to transfer it from vault to the other guardian
          const transferResponse = await transferTo({
            transferShell: shellToEquip,
            characterId: transferShell.location.characterId,
            membershipType: transferShell.location.membershipType,
            dispatch,
            state
          });

          if (transferResponse.error) return transferResponse;
        }

        await equipTo({
          equipShell: shellToEquip,
          characterId: transferShell.location.characterId,
          membershipType: transferShell.location.membershipType,
          state,
          dispatch
        });
      }

      // shell is not equipped, transfer it to the vault
      const respFromOtherToVault = await destinyApi.transferItem({
        characterId: transferShell.location.characterId,
        membershipType: transferShell.location.membershipType,
        itemInstanceId: transferShell.itemInstanceId,
        itemHash: transferShell.itemHash,
        toVault: true
      });
      if (respFromOtherToVault.ErrorCode !== BungieCodes.Success) {
        return {
          bungieResponse: respFromOtherToVault,
          message:
            'Could not transfer from character to vault in order to make space to transfer to character.',
          error: true
        };
      }

      dispatch.destiny.setLocation({
        itemInstanceId: transferShell.itemInstanceId,
        location: { membershipType, inVault: true }
      });

      // use this function to transfer it, handles some cases, now that it's in a good spot for transferring
      const finalTransferResponse = await transferTo({
        transferShell,
        characterId,
        membershipType,
        dispatch,
        state
      });

      if (finalTransferResponse.error) return finalTransferResponse;

      return {};

    default:
      return {};
  }
}

export default transferTo;
