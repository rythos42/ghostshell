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

const ghostModTypeMappings = [
  { regex: /\bcaches\b/gi, ghostModType: 'Caches' },
  { regex: /\bresources\b/gi, ghostModType: 'Resources' },
  { regex: /\bxp\b/gi, ghostModType: 'XP' },
  { regex: /\bexperience\b/gi, ghostModType: 'XP' },
  { regex: /\bglimmer\b/gi, ghostModType: 'Glimmer' },
  { regex: /\bfaction consumables\b/gi, ghostModType: 'FactionConsumables' },
  { regex: /\btelemetry\b/gi, ghostModType: 'Telemetry' },
  { regex: /\bbright engram\b/gi, ghostModType: 'BrightEngram' },
  { regex: /\bexotic\b/gi, ghostModType: 'Exotic' },
  { regex: /\bio\b/gi, ghostModType: 'Io' },
  { regex: /\bhellas basin\b/gi, ghostModType: 'HellasBasin' },
  { regex: /\bmercury\b/gi, ghostModType: 'Mercury' },
  { regex: /\btangled shore\b/gi, ghostModType: 'TangledShore' },
  { regex: /\bdreaming city\b/gi, ghostModType: 'DreamingCity' },
  { regex: /\btitan\b/gi, ghostModType: 'Titan' },
  { regex: /\bedz\b/gi, ghostModType: 'EDZ' },
  { regex: /\bnessus\b/gi, ghostModType: 'Nessus' },
  { regex: /\bleviathan\b/gi, ghostModType: 'Leviathan' },
  { regex: /\bgambit\b/gi, ghostModType: 'Gambit' },
  { regex: /\bcrucible\b/gi, ghostModType: 'Crucible' },
  { regex: /\bstrikes\b/gi, ghostModType: 'Strikes' },
  { regex: /\bpublic events\b/gi, ghostModType: 'PublicEvents' },
  { regex: /\bsolar weapon\b/gi, ghostModType: 'SolarWeapon' },
  { regex: /\barc weapon\b/gi, ghostModType: 'ArcWeapon' },
  { regex: /\bvoid weapon\b/gi, ghostModType: 'VoidWeapon' },
  { regex: /\belemental weapon\b/gi, ghostModType: 'ElementalWeapon' },
  { regex: /\bgenerated\b/gi, ghostModType: 'Generated' },
  { regex: /\bvehicle less time to summon\b/gi, ghostModType: 'VehicleLessTimeToSummon' },
  { regex: /\breload your weapon\b/gi, ghostModType: 'ReloadYourWeapon' },
  { regex: /\bride\b/gi, ghostModType: 'Ride' }
];

function getGhostModTypesForString(description) {
  return ghostModTypeMappings
    .filter(ghostModTypeMapping => {
      return ghostModTypeMapping.regex.test(description);
    })
    .map(ghostModTypeMapping => {
      return ghostModTypeMapping.ghostModType;
    });
}
