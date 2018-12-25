export default {
  state: {
    enum: {},
    categories: {
      planets: [
        'Io',
        'HellasBasin',
        'Mercury',
        'TangledShore',
        'DreamingCity',
        'Titan',
        'EDZ',
        'Nessus',
        'Leviathan'
      ],
      gameModes: ['Gambit', 'Crucible', 'Strikes', 'PublicEvents', 'Ride'],
      weapons: ['SolarWeapon', 'ArcWeapon', 'VoidWeapon', 'ElementalWeapon'],
      effect: [
        'Caches',
        'Resources',
        'XP',
        'Glimmer',
        'FactionConsumables',
        'Loot',
        'Telemetry',
        'BrightEngram',
        'Exotic',
        'VehicleLessTimeToSummon',
        'ReloadYourWeapon'
      ]
    }
  },
  effects: () => ({
    categorizeSockets(socketPlugHashes, state) {
      return socketPlugHashes
        .map(socketPlugHash => {
          const socketPlug = getByHash(state.manifest.inventory, socketPlugHash);
          if (!socketPlug) return null;
          return {
            name: socketPlug.displayProperties.name,
            description: socketPlug.displayProperties.description,
            hash: socketPlug.hash,
            ghostModTypes: getGhostModTypesForString(socketPlug.displayProperties.description)
          };
        })
        .filter(socketPlug => socketPlug);
    }
  })
};

function getByHash(array, hash) {
  return array[hash] || array[hash - 4294967296];
}

const ghostModTypeMappings = {
  ' caches': 'Caches',
  ' resources': 'Resources',
  ' xp': 'XP',
  ' experience': 'XP',
  ' glimmer': 'Glimmer',
  ' faction consumables': 'FactionConsumables',
  ' telemetry': 'Telemetry',
  ' bright engram': 'BrightEngram',
  exotic: 'Exotic', // this one happens at the beginning of the sentence
  ' io': 'Io',
  ' hellas basin': 'HellasBasin',
  ' mercury': 'Mercury',
  ' tangled shore': 'TangledShore',
  ' dreaming city': 'DreamingCity',
  ' titan': 'Titan',
  ' edz': 'EDZ',
  ' nessus': 'Nessus',
  ' leviathan': 'Leviathan',
  ' gambit': 'Gambit',
  ' crucible': 'Crucible',
  ' strikes': 'Strikes',
  ' public events': 'PublicEvents',
  ' solar weapon': 'SolarWeapon',
  ' arc weapon': 'ArcWeapon',
  ' Void Weapon': 'VoidWeapon',
  ' elemental weapon': 'ElementalWeapon',
  ' generated': 'Generated',
  ' vehicle less time to summon': 'VehicleLessTimeToSummon',
  ' reload your weapon': 'ReloadYourWeapon',
  ' ride': 'Ride'
};

function getGhostModTypesForString(description) {
  const lowerDesc = description.toLowerCase();
  return Object.keys(ghostModTypeMappings)
    .filter(ghostModTypeMappingString => {
      return lowerDesc.indexOf(ghostModTypeMappingString.toLowerCase()) !== -1;
    })
    .map(ghostModTypeMappingString => {
      return ghostModTypeMappings[ghostModTypeMappingString];
    });
}
