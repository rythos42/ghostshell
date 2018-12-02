import axios from 'axios';

async function get(path) {
  const platformUrl = 'http://localhost:83/Manifest.php';
  return axios.get(`${platformUrl}/${path}`);
}

export default async function select(table, hash) {
  const path = `?t=${table}&hash=${hash}`;
  const response = await get(path);
  return response.data;
}
