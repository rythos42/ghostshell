<?php

abstract class GhostModTypes {
    const Caches = 0;
    const Resources = 1;
    const XP = 2;
    const Glimmer = 3;
    const FactionConsumables = 4;
    const Loot = 5;
    const Telemetry = 6;
    const BrightEngram = 7;
    const Exotic = 8;
    const Io = 9;
    const HellasBasin = 10;
    const Mercury = 11;
    const TangledShore = 12;
    const DreamingCity = 13;
    const Titan = 14;
    const EDZ = 15;
    const Nessus = 16;
    const Leviathan = 17;
    const Gambit = 18;
    const Crucible = 19;
    const Strikes = 20;
    const PublicEvents = 21;
    const SolarWeapon = 22;
    const ArcWeapon = 23;
    const VoidWeapon = 24;
    const ElementalWeapon = 25;
    const Generated = 26;
    const VehicleLessTimeToSummon = 27;
    const ReloadYourWeapon = 28;
    const Ride = 29;

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
        return $cls->getConstants();
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