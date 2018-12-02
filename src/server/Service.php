<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include('./Manifest.php');
include('./Assembler.php');
include('./GhostModTypes.php');

$action = $_REQUEST['action'];
$apiKey = '9d9691432cae49ee93f57e459d4219b8';

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

    case 'categorizePerk':
        // just one for now
        $perkHash = $_REQUEST['perkHash'];

        $manifestDb = Manifest::getManifestDatabase($apiKey);
        $query = Manifest::createSelect('DestinySandboxPerkDefinition', array($perkHash));
        $statement = $manifestDb->query($query);

        $row = $statement->fetch(PDO::FETCH_ASSOC);
        if(!$row) {
            echo '{}';
            break;
        }

        $rowObject = json_decode($row['json']);
        $description = $rowObject->displayProperties->description;

        $ghost = array(
            "name" => $rowObject->displayProperties->name,
            "perkHash" => $rowObject->hash,
            "ghostModTypes" => GhostModTypes::getGhostModTypesForString($description)
        );
        echo json_encode($ghost);

        break;
}

?>
