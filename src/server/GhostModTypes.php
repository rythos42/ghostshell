<?php

abstract class GhostModTypes {
    // WHAT
    const Caches = 0;
    const Resources = 1;
    const XP = 2;
    const Glimmer = 3;
    const FactionConsumables = 4;
    const Loot = 5;
    const Telemetry = 6;
    const BrightEngram = 7;
    const Exotic = 8;
    const VehicleLessTimeToSummon = 9;
    const ReloadYourWeapon = 10;

    // Mututally Exclusive WHERE
    const Io = 11;
    const HellasBasin = 12;
    const Mercury = 13;
    const TangledShore = 14;
    const DreamingCity = 15;
    const Titan = 16;
    const EDZ = 17;
    const Nessus = 18;
    const Leviathan = 19;
    const Gambit = 20;
    const Crucible = 21;
    const Strikes = 22;

    // ANYWHERE
    const PublicEvents = 23;
    const SolarWeapon = 24;
    const ArcWeapon = 25;
    const VoidWeapon = 26;
    const ElementalWeapon = 27;
    const Ride = 28;

    // ??
    const Generated = 29;

    private static $GhostModTypeMappings = array(
        " caches" => GhostModTypes::Caches,
        " resources" => GhostModTypes::Resources,
        " xp" => GhostModTypes::XP,
        " experience" => GhostModTypes::XP,
        " glimmer" => GhostModTypes::Glimmer,
        " faction consumables" => GhostModTypes::FactionConsumables,
        " telemetry" => GhostModTypes::Telemetry,
        " bright engram" => GhostModTypes::BrightEngram,
        "exotic" => GhostModTypes::Exotic,  // this one happens at the beginning of the sentence
        " io" => GhostModTypes::Io,
        " hellas basin" => GhostModTypes::HellasBasin,
        " mercury" => GhostModTypes::Mercury,
        " tangled shore" => GhostModTypes::TangledShore,
        " dreaming city" => GhostModTypes::DreamingCity,
        " titan" => GhostModTypes::Titan,
        " edz" => GhostModTypes::EDZ,
        " nessus" => GhostModTypes::Nessus,
        " leviathan" => GhostModTypes::Leviathan,
        " gambit" => GhostModTypes::Gambit,
        " crucible" => GhostModTypes::Crucible,
        " strikes" => GhostModTypes::Strikes,
        " public events" => GhostModTypes::PublicEvents,
        " solar weapon" => GhostModTypes::SolarWeapon,
        " arc weapon" => GhostModTypes::ArcWeapon,
        " Void Weapon" => GhostModTypes::VoidWeapon,
        " elemental weapon" => GhostModTypes::ElementalWeapon,
        " generated" => GhostModTypes::Generated,
        " vehicle less time to summon" => GhostModTypes::VehicleLessTimeToSummon,
        " reload your weapon" => GhostModTypes::ReloadYourWeapon,
        " ride" => GhostModTypes::Ride,
    );

    public static function getAllGhostModTypes() {
        $cls = new ReflectionClass('GhostModTypes');
        $constants = $cls->getConstants();

        $constantArray = array();
        foreach ($constants as $name => $value )
        {
            $constantArray[$value] = $name;
        }

        $constantArray['categorized'] = array(
            "planets" => array(GhostModTypes::Io, GhostModTypes::HellasBasin, GhostModTypes::Mercury, GhostModTypes::TangledShore, GhostModTypes::DreamingCity, 
                GhostModTypes::Titan, GhostModTypes::EDZ, GhostModTypes::Nessus, GhostModTypes::Leviathan),
            "gameModes" => array(GhostModTypes::Gambit, GhostModTypes::Crucible, GhostModTypes::Strikes, GhostModTypes::PublicEvents, GhostModTypes::Ride),
            "weapons" => array(GhostModTypes::SolarWeapon, GhostModTypes::ArcWeapon, GhostModTypes::VoidWeapon, GhostModTypes::ElementalWeapon),
            "effect" => array(GhostModTypes::Caches, GhostModTypes::Resources, GhostModTypes::XP, GhostModTypes::Glimmer, GhostModTypes::FactionConsumables, 
                GhostModTypes::Loot, GhostModTypes::Telemetry, GhostModTypes::BrightEngram, GhostModTypes::Exotic, GhostModTypes::VehicleLessTimeToSummon, 
                GhostModTypes::ReloadYourWeapon)
        );

        return $constantArray;
    }

    public static function getGhostModTypesForString($description) {
        $ghostModTypes = array();
        $lowerDesc = strtolower($description);
        foreach(GhostModTypes::$GhostModTypeMappings as $descriptionString => $ghostModType) {
            if(strpos($lowerDesc, $descriptionString) !== false)
                array_push($ghostModTypes, $ghostModType);
        }
        return $ghostModTypes;
    }
}