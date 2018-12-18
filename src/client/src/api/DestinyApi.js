import axios from 'axios';

function getAxiosConfig({ accessToken, apiKey }) {
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': apiKey
    }
  };
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
}

async function get(path, accessToken, apiKey) {
  const platformUrl = 'https://www.bungie.net/Platform';
  return axios.get(`${platformUrl}/${path}`, getAxiosConfig({ accessToken, apiKey }));
}

export async function getOAuthToken({ code, apiKey, clientId }) {
  const data = `grant_type=authorization_code&code=${code}&client_id=${clientId}`;
  const response = await axios.post(
    'https://www.bungie.net/platform/app/oauth/token/',
    data,
    getAxiosConfig({ apiKey })
  );

  return {
    accessToken: response.data.access_token,
    destinyMembershipId: response.data.membership_id,
    apiKey: apiKey,
    retrievedAt: new Date().toString()
  };
}

export async function equipItem({ itemId, characterId, membershipType, accessToken, apiKey }) {
  const data = { itemId, characterId, membershipType };
  const response = await axios.post(
    'https://www.bungie.net/platform/Destiny2/Actions/Items/EquipItem/',
    data,
    getAxiosConfig({ accessToken, apiKey })
  );

  return response.data;
}

export async function transferItemTo({ itemId, characterId, membershipType, accessToken, apiKey }) {
  /*const data = {
    characterId: characterId,
    membershipType: membershipType,
    itemId: item.id,
    itemReferenceHash: item.hash,
    stackSize: 1,
    transferToVault: false
  };
  const data = { itemId, characterId, membershipType };
  const response = await axios.post(
    'https://www.bungie.net/platform/Destiny2/Actions/Items/TransferItem/',
    data,
    getAxiosConfig({ accessToken, apiKey })
  );

  return response.data;*/
}

export async function getMembershipInfo({ destinyMembershipId, accessToken, apiKey }) {
  const membershipType = 254;
  const response = await get(
    `/User/GetMembershipsById/${destinyMembershipId}/${membershipType}/`,
    accessToken,
    apiKey
  );

  return response.data.Response;
}

export async function getProfileData({ membershipId, membershipType, accessToken, apiKey }) {
  const components = 'CharacterInventories,CharacterEquipment,ProfileInventories,Characters';
  const response = await get(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`,
    accessToken,
    apiKey
  );

  return response.data.Response;
}

export async function getItemSockets({
  membershipId,
  membershipType,
  itemInstanceId,
  accessToken,
  apiKey
}) {
  const components = 'ItemSockets';
  const response = await get(
    `/Destiny2/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=${components}`,
    accessToken,
    apiKey
  );

  const socketData = response.data.Response.sockets.data;
  return (socketData && socketData.sockets) || [];
}
