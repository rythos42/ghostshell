import axios from 'axios';

export async function categorizeSockets(manifestServiceUrl, socketPlugHashes) {
  const path = `${manifestServiceUrl}?action=categorizeSockets&hash=${socketPlugHashes.join()}`;
  const response = await axios.get(path);
  return response.data;
}

export async function getAllGhostModTypes(manifestServiceUrl) {
  const path = `${manifestServiceUrl}?action=enums_getAllGhostModTypes`;
  const response = await axios.get(path);
  return response.data;
}
