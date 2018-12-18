import axios from 'axios';

export async function select(manifestServiceUrl, table, hash) {
  const path = `${manifestServiceUrl}?action=select&t=${table}&hash=${hash}`;
  const response = await axios.get(path);
  return response.data;
}

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

export async function getRaceGenderClassData(manifestServiceUrl) {
  const path = `${manifestServiceUrl}?action=data_getRaceGenderClass`;
  const response = await axios.get(path);
  return response.data;
}

export async function getGhostShellsFromVault({ manifestServiceUrl, vaultItems }) {
  // query string parameter got to large with all of the hashes, so had to chunk it down
  const vaultItemChunks = chunkArray(vaultItems, 10);
  let vaultItemReturn = [];
  for (let i = 0; i < vaultItemChunks.length; i++) {
    const hashes = vaultItemChunks[i].map(shell => shell.itemHash).join();
    const path = `${manifestServiceUrl}?action=getGhostShellsFromVault&hash=${hashes}`;
    const response = await axios.get(path);
    vaultItemReturn = vaultItemReturn.concat(response.data);
  }
  return vaultItemReturn;
}

function chunkArray(array, chunkSize) {
  var retArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    retArray.push(chunk);
  }
  return retArray;
}
