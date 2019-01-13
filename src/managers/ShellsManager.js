import { getByHash } from '../util/DestinyUtil';

export default function assembleShells({ profile, state, membershipType }) {
  let ghostShellData = [];
  const types = ['characterInventories', 'characterEquipment'];
  for (let inventoryTypeIndex = 0; inventoryTypeIndex < types.length; inventoryTypeIndex++) {
    const inventoryType = types[inventoryTypeIndex];
    const characterInventory = profile[inventoryType].data;
    for (let characterId in characterInventory) {
      if (!characterInventory.hasOwnProperty(characterId)) continue;

      ghostShellData = ghostShellData.concat(
        getItemsFromBucket({
          bucket: characterInventory[characterId].items,
          bucketHash: 4023194814,
          location: {
            characterId,
            membershipType,
            inVault: false
          },
          isEquipped: inventoryType === 'characterEquipment'
        })
      );
    }
  }

  const socketData = profile.itemComponents.sockets.data;
  const ghostShells = getGhostShellsFromItems({
    items: ghostShellData,
    inventory: state.manifest.inventory,
    socketData
  });

  const vaultItems = getItemsFromBucket({
    bucket: profile.profileInventory.data.items,
    bucketHash: 138197802,
    location: {
      membershipType,
      inVault: true
    },
    isEquipped: false
  });

  const vaultGhostShells = getGhostShellsFromItems({
    items: vaultItems,
    inventory: state.manifest.inventory,
    socketData
  });

  return ghostShells.concat(vaultGhostShells);
}

function getItemsFromBucket({ bucket, bucketHash, location, isEquipped }) {
  const array = [];
  for (let itemIndex = 0; itemIndex < bucket.length; itemIndex++) {
    const item = bucket[itemIndex];
    if (item.bucketHash === bucketHash) {
      array.push({
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId,
        location,
        isEquipped
      });
    }
  }
  return array;
}

function getGhostShellsFromItems({ items, inventory, socketData }) {
  const ghostShells = items.map(ghostShell => {
    const itemDefinition = getByHash(inventory, ghostShell.itemHash);
    if (!itemDefinition) return null;
    ghostShell.name = itemDefinition.displayProperties.name;
    ghostShell.icon = itemDefinition.displayProperties.icon;
    ghostShell.description = itemDefinition.displayProperties.description;

    const socketPlugHashes = socketData[ghostShell.itemInstanceId].sockets
      .map(itemSocket => itemSocket.plugHash)
      .filter(socketPlugHash => socketPlugHash != null);

    return {
      ...ghostShell,
      icon: `https://www.bungie.net${ghostShell.icon}`,
      sockets: categorizeSockets({ socketPlugHashes, inventory })
    };
  });
  return ghostShells.filter(vaultGhostItem => vaultGhostItem);
}

function categorizeSockets({ socketPlugHashes, inventory }) {
  return socketPlugHashes
    .map(socketPlugHash => {
      const socketPlug = getByHash(inventory, socketPlugHash);
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
