export function getJsonObject(key) {
  const json = global.localStorage.getItem(key);
  return json ? JSON.parse(json) : null;
}
