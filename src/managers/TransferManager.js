import { BungieCodes } from '../api/DestinyApi';
import equipTo from './EquipManager';

async function transferTo({ transferShell, characterId, membershipType, dispatch, state }) {
  const destinyApi = state.destiny.destinyApi;
  const transferItem = destinyApi.createTransferItem({ characterId, membershipType });
  const response = await transferItem({ shell: transferShell, toVault: false });
  const character = state.destiny.characters.find(
    character => character.characterId === characterId
  );

  switch (response.ErrorCode) {
    case BungieCodes.Success:
      dispatch.destiny.setLocation({
        itemInstanceId: transferShell.itemInstanceId,
        location: characterId,
        locationString: character.locationString
      });
      return {};

    case BungieCodes.NoRoomInDestination:
      // can't transfer to character -- transfer a non-equipped shell from character to vault then try again
      const nonEquippedShell = state.destiny.ghostShells.find(
        ghostShell => ghostShell.location === characterId && !ghostShell.isEquipped
      );

      const respToVault = await transferItem({ shell: nonEquippedShell, toVault: true });
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
        location: 'vault',
        locationString: 'Vault'
      });

      // try the transfer again
      const respToCharacter = await transferItem({ shell: transferShell, toVault: false });
      if (respToCharacter.ErrorCode !== BungieCodes.Success)
        return { bungieResponse: respToCharacter, error: true };

      dispatch.destiny.setLocation({
        itemInstanceId: transferShell.itemInstanceId,
        location: characterId,
        locationString: character.locationString
      });

      return {};

    case BungieCodes.ItemNotFound:
      // trying to transfer guardian-to-guardian
      if (transferShell.isEquipped) {
        // deequip first by equipping anything else
        let shellToEquip = state.destiny.ghostShells.find(
          ghostShell => ghostShell.location === transferShell.location && !ghostShell.isEquipped
        );
        if (!shellToEquip) {
          // other guardian doesn't have any shells on them
          shellToEquip = state.destiny.ghostShells.find(
            ghostShell => ghostShell.location === 'vault'
          );
          if (!shellToEquip) {
            // there's no shell on the other guardian that isn't equipped, no shell in vault, try transferring from THIS guardian
            shellToEquip = state.destiny.ghostShells.find(
              ghostShell => ghostShell.location === characterId && !ghostShell.isEquipped
            );
            if (!shellToEquip) {
              // we've looked enough, leave it
              return {
                message: 'Could not find shell to replace desired shell on other guardian.',
                error: true
              };
            }

            const respFromThisToVault = await transferItem({ shell: shellToEquip, toVault: true });
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
              location: 'vault',
              locationString: 'Vault'
            });
          }

          // use this function to transfer it from vault to the other guardian
          const transferResponse = await transferTo({
            transferShell: shellToEquip,
            characterId: transferShell.location,
            membershipType,
            dispatch,
            state
          });

          if (transferResponse.error) return transferResponse;
        }

        await equipTo({
          equipShell: shellToEquip,
          characterId: transferShell.location,
          membershipType,
          state,
          dispatch
        });
      }

      // shell is not equipped, transfer it to the vault
      const transferItemOtherGuardian = destinyApi.createTransferItem({
        characterId: transferShell.location,
        membershipType
      });
      const respFromOtherToVault = await transferItemOtherGuardian({
        shell: transferShell,
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
        location: 'vault',
        locationString: 'Vault'
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
