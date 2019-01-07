import { BungieCodes } from '../api/DestinyApi';
import transferTo from './TransferManager';

async function equipTo({ equipShell, characterId, membershipType, state, dispatch }) {
  let response = {};
  const equipItem = state.destiny.destinyApi.createEquipItem({ characterId, membershipType });

  try {
    response = await equipItem(equipShell);
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
      const transferResponse = await transferTo({
        transferShell: equipShell,
        characterId,
        membershipType,
        dispatch,
        state
      });
      if (!transferResponse.error) {
        response = await equipItem(equipShell);
        if (response.ErrorCode === BungieCodes.Success) {
          dispatch.destiny.setEquipped({ itemInstanceId: equipShell.itemInstanceId, characterId });
        }
      }
      break;
    case BungieCodes.CannotPerformActionAtThisLocation:
      if (equipShell.location !== characterId) {
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
