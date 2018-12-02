<?php

include_once('vendor\pclzip\pclzip\pclzip.lib.php');

class Manifest {
    private static function getManifestUrl($apiKey) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, 'https://www.bungie.net/Platform/Destiny2/Manifest/');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'X-API-Key: ' . $apiKey,
        ));
        $manifestDataString = curl_exec($curl);
        curl_close($curl);
        $manifestData = json_decode($manifestDataString);
        $manifestDatabaseUrl = $manifestData->Response->mobileWorldContentPaths->en;
        return $manifestDatabaseUrl;
    }
    
    public static function getManifestDatabase($apiKey) {
        $manifestZippedFilename = sys_get_temp_dir() . '\destinymanifest.zip';
        if(!file_exists($manifestZippedFilename)) {
            $manifestUrl = Manifest::getManifestUrl($apiKey);
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'https://www.bungie.net/' . $manifestUrl);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); 
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                'X-API-Key: ' . $apiKey,
            ));
            $fp = fopen($manifestZippedFilename, 'w');
            curl_setopt($curl, CURLOPT_FILE, $fp);
            curl_exec($curl);
            curl_close($curl);
        }
    
        $archive = new PclZip($manifestZippedFilename);
        $filename = null;
        foreach($archive->listContent() as &$fileInfo) {
            $filename = $fileInfo['filename'];
        }
        $dbFile = sys_get_temp_dir() . '\\' . $filename;
    
        if(!file_exists($dbFile)) {
            $archive->extract(PCLZIP_OPT_PATH, sys_get_temp_dir());
        }
    
        // Prevent multiple queries so people can't do more than just select
        return new PDO('sqlite:' . $dbFile, null, null, [PDO::MYSQL_ATTR_MULTI_STATEMENTS => false]);
    }

    public static function createSelect($table, $hashesArray) {
        $query = "select * from {$table} where ";
        $prepend = "";
        foreach($hashesArray as $hash) {
            $query = $query . $prepend . "id + 4294967296 = {$hash} OR id = {$hash}";
            $prepend = " or ";
        }

        return $query;
    }
}