import axios from 'axios';

function getAxiosConfig(accessToken) {
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': '9d9691432cae49ee93f57e459d4219b8'
    }
  };
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
}

async function get(path, accessToken) {
  const platformUrl = 'https://www.bungie.net/Platform';
  return axios.get(`${platformUrl}/${path}`, getAxiosConfig(accessToken));
}

export async function getOAuthToken(code) {
  const data = `grant_type=authorization_code&code=${code}&client_id=25539`;
  const response = await axios.post(
    'https://www.bungie.net/platform/app/oauth/token/',
    data,
    getAxiosConfig()
  );

  return {
    accessToken: response.data.access_token,
    destinyMembershipId: response.data.membership_id
  };
}

export async function getMembershipInfo({ destinyMembershipId, accessToken }) {
  const membershipType = 254;
  const response = await get(
    `/User/GetMembershipsById/${destinyMembershipId}/${membershipType}/`,
    accessToken
  );

  return response.data.Response;
}

export async function getCharacterInventories({ membershipId, membershipType, accessToken }) {
  const components = 'CharacterInventories';
  const response = await get(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`,
    accessToken
  );

  return response.data.Response.characterInventories.data;
}
