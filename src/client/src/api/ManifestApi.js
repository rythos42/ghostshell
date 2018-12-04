import axios from 'axios';

async function get(path) {
  const platformUrl = 'http://localhost:83/Service.php';
  return axios.get(`${platformUrl}/${path}`);
}

export async function select(table, hash) {
  const path = `?action=select&t=${table}&hash=${hash}`;
  const response = await get(path);
  return response.data;
}

export async function categorizeSockets(socketPlugHashes) {
  const path = `?action=categorizeSockets&hash=${socketPlugHashes.join()}`;
  const response = await get(path);
  return response.data;
}

export async function getMutuallyExclusiveWhere() {
  const path = '?action=enums_getMutuallyExclusiveWhere';
  const response = await get(path);
  return response.data;
}

export async function getAllGhostModTypes() {
  const path = '?action=enums_getAllGhostModTypes';
  const response = await get(path);
  return response.data;
}
