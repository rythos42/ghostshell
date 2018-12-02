<?php

class Assembler {
    public static function jsonEncode($statement) {
        $json = '[';
        $outputPrepend = "";
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $json .= $outputPrepend;
            $json .= $row['json'];
            $outputPrepend = ",";
        }
        $json .= ']';

        return $json;
    }
}

?>