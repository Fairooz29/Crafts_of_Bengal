<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid product ID."]);
    exit;
}

$product_id = intval($_GET['id']);

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, name, description, image, price, artisan_id, category_id, stock_quantity FROM products WHERE id = ? LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute([$product_id]);

$product = $stmt->fetch(PDO::FETCH_ASSOC);

if ($product) {
    echo json_encode($product);
} else {
    http_response_code(404);
    echo json_encode(["error" => "Product not found."]);
} 