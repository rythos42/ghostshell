import { BungieCodes } from '../api/DestinyApi';
import transferTo from './TransferManager';

async function equipTo({ equipShell, characterId, membershipType, state, dispatch }) {
  let response = {};
  const { destinyApi } = state.destiny;

  try {
    response = await destinyApi.equipItem({
      characterId,
      membershipType,
      itemInstanceId: equipShell.itemInstanceId
    });
  } catch (e) {
    return {
      bungieResponse: {},
      message:
        'Your access to Bungie through this app has expired and must be refreshed before you can equip.'
    };
  }

  // not on character to equip
  switch (response.ErrorCode) {
    case BungieCodes.Success:
      dispatch.destiny.setEquipped({ itemInstanceId: equipShell.itemInstanceId, characterId });
      break;
    case BungieCodes.ItemNotFound:
      // Item isn't in the users direct inventory
      const transferResponse = await transferTo({
        transferShell: equipShell,
        characterId,
        membershipType,
        dispatch,
        state
      });
      if (!transferResponse.error) {
        response = await destinyApi.equipItem({
          characterId,
          membershipType,
          itemInstanceId: equipShell.itemInstanceId
        });
        if (response.ErrorCode === BungieCodes.Success) {
          dispatch.destiny.setEquipped({ itemInstanceId: equipShell.itemInstanceId, characterId });
        }
      }
      break;
    case BungieCodes.CannotPerformActionAtThisLocation:
      // User is not in a place they can equip - transfer the item instead
      if (equipShell.location.characterId !== characterId) {
        const transferResponse = await transferTo({
          transferShell: equipShell,
          characterId,
          membershipType,
          dispatch,
          state
        });
        if (!transferResponse.error) {
          return {
            bungieResponse: response,
            message:
              'Cannot equip as you are not in social space, orbit or logged off. Transferred item to inventory instead.'
          };
        }
      }
      break;
    default:
      break;
  }

  return {
    bungieResponse: response,
    message: response.ErrorCode === BungieCodes.Success ? 'Equipped' : response.Message
  };
}

export default equipTo;
