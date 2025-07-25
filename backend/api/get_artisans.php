<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, name FROM artisans";
$stmt = $db->prepare($query);
$stmt->execute();

$artisans = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $artisans[] = $row;
}

echo json_encode($artisans); 