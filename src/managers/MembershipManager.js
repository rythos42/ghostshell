import { getName } from '../util/DestinyUtil';

export function assembleCharacters({ membershipType, profile, state }) {
  const characterData = [];
  const bungieCharacters = profile.characters.data;
  for (let characterId in bungieCharacters) {
    if (!bungieCharacters.hasOwnProperty(characterId)) continue;

    const character = bungieCharacters[characterId];

    const raceString = getName(state.manifest.races, character.raceHash);
    const classString = getName(state.manifest.classes, character.classHash);
    const genderString = getName(state.manifest.genders, character.genderHash);

    const locationString = `${classString.toUpperCase()} ${raceString} ${genderString}`;

    characterData.push({
      characterId: characterId,
      emblemBackgroundPath: character.emblemBackgroundPath,
      membershipType: membershipType,
      raceString: raceString,
      classString: classString,
      genderString: genderString,
      locationString: locationString
    });
  }
  return characterData;
}

export function getCharacterDescription({ state, characterId }) {
  const foundCharacter = state.destiny.characters.find(
    character => character.characterId === characterId
  );
  return foundCharacter ? foundCharacter.locationString : null;
}
