<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid artisan ID."]);
    exit;
}

$artisan_id = intval($_GET['id']);

$database = new Database();
$db = $database->getConnection();

// Fetch artisan info
$query = "SELECT id, name, bio, location, specialization, image FROM artisans WHERE id = ? LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute([$artisan_id]);
$artisan = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$artisan) {
    http_response_code(404);
    echo json_encode(["error" => "Artisan not found."]);
    exit;
}

// Fetch artisan's products
$query = "SELECT id, name, description, image, price FROM products WHERE artisan_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$artisan_id]);
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

$artisan['products'] = $products;

echo json_encode($artisan); 