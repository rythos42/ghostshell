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

export async function categorizePerk(perkHash) {
  const path = `?action=categorizePerk&perkHash=${perkHash}`;
  const response = await get(path);
  return response.data;
}
