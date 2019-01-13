import { getName } from '../util/DestinyUtil';

export default function assembleCharacters({ membershipType, profile, state }) {
  const characterData = [];
  const bungieCharacters = profile.characters.data;
  for (let characterId in bungieCharacters) {
    if (!bungieCharacters.hasOwnProperty(characterId)) continue;

    const character = bungieCharacters[characterId];

    const raceString = getName(state.manifest.races, character.raceHash);
    const classString = getName(state.manifest.classes, character.classHash);
    const genderString = getName(state.manifest.genders, character.genderHash);

    const description = `${classString.toUpperCase()} ${raceString} ${genderString}`;

    characterData.push({
      characterId: characterId,
      emblemBackgroundPath: character.emblemBackgroundPath,
      membershipType: membershipType,
      raceString: raceString,
      classString: classString,
      genderString: genderString,
      description: description
    });
  }
  return characterData;
}
