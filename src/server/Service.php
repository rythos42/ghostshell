<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include('./config.php');
include('./Manifest.php');
include('./Assembler.php');
include('./GhostModTypes.php');

require_once __DIR__ . '/vendor/autoload.php';

$action = $_REQUEST['action'];
$apiKey = $settings['apiKey'];

switch($action) {
    case 'select':
        if(!$_REQUEST['hash'] || !$_REQUEST['t']) {
            echo '[]';
            break;
        }
        
        $table = $_REQUEST['t'];
        $hashesArray = explode(',', $_REQUEST['hash']);
        
        $query = Manifest::createSelect($table, $hashesArray);
        $manifestDb = Manifest::getManifestDatabase($apiKey);
        $statement = $manifestDb->query($query);
        echo Assembler::jsonEncode($statement);

        break;

    case 'categorizeSockets':
        $hashesArray = explode(',', $_REQUEST['hash']);

        $manifestDb = Manifest::getManifestDatabase($apiKey);
        $query = Manifest::createSelect('DestinyInventoryItemDefinition', $hashesArray);
        $statement = $manifestDb->query($query);

        $row = $statement->fetch(PDO::FETCH_ASSOC);
        if(!$row) {
            echo '{}';
            break;
        }

        $sockets = array();
        do {
            $rowObject = json_decode($row['json']);
            if($rowObject->plug->plugCategoryHash !== 1820735122) // ghosts.mods.perks
                continue;

            $description = $rowObject->displayProperties->description;
    
            $ghost = array(
                "name" => $rowObject->displayProperties->name,
                "description" => $rowObject->displayProperties->description,
                "hash" => $rowObject->hash,
                "ghostModTypes" => GhostModTypes::getGhostModTypesForString($description)
            );
            array_push($sockets, $ghost);
        } while($row = $statement->fetch(PDO::FETCH_ASSOC));
        
        echo json_encode($sockets);

        break;

    case 'getGhostShellsFromVault':
        if(!$_REQUEST['hash']) {
            echo '[]';
            break;
        }
        $hashesArray = explode(',', $_REQUEST['hash']);
        
        $query = Manifest::createSelect('DestinyInventoryItemDefinition', $hashesArray, "and json like '%\"bucketTypeHash\":4023194814%'");
        $manifestDb = Manifest::getManifestDatabase($apiKey);
        $statement = $manifestDb->query($query);
        echo Assembler::jsonEncode($statement);
        break;

    case 'enums_getAllGhostModTypes':
        echo json_encode(GhostModTypes::getAllGhostModTypes());
        break;
}

?>
