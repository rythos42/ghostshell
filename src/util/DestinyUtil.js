export function getName(array, hash) {
  return getByHash(array, hash).displayProperties.name;
}

export function getByHash(array, hash) {
  return array[hash] || array[hash - 4294967296];
}
