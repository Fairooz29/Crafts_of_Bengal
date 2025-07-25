<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$category_id = isset($_GET['category_id']) && is_numeric($_GET['category_id']) ? intval($_GET['category_id']) : null;
$artisan_id = isset($_GET['artisan_id']) && is_numeric($_GET['artisan_id']) ? intval($_GET['artisan_id']) : null;

if ($category_id && $artisan_id) {
    $query = "SELECT p.id, p.name, p.description, p.image, p.price, a.id AS artisan_id, a.name AS artisan_name FROM products p LEFT JOIN artisans a ON p.artisan_id = a.id WHERE p.category_id = ? AND p.artisan_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$category_id, $artisan_id]);
} elseif ($category_id) {
    $query = "SELECT p.id, p.name, p.description, p.image, p.price, a.id AS artisan_id, a.name AS artisan_name FROM products p LEFT JOIN artisans a ON p.artisan_id = a.id WHERE p.category_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$category_id]);
} elseif ($artisan_id) {
    $query = "SELECT p.id, p.name, p.description, p.image, p.price, a.id AS artisan_id, a.name AS artisan_name FROM products p LEFT JOIN artisans a ON p.artisan_id = a.id WHERE p.artisan_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$artisan_id]);
} else {
    $query = "SELECT p.id, p.name, p.description, p.image, p.price, a.id AS artisan_id, a.name AS artisan_name FROM products p LEFT JOIN artisans a ON p.artisan_id = a.id";
    $stmt = $db->prepare($query);
    $stmt->execute();
}

$products = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $products[] = $row;
}

echo json_encode($products); 