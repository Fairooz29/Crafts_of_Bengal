<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/user.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $action = $_GET['action'] ?? '';

        switch ($action) {
            case 'login':
                handleLogin($user, $data);
                break;
            case 'register':
                handleRegister($user, $data);
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                http_response_code(400);
                echo json_encode(array("message" => "Invalid action"));
                break;
        }
        break;
    
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'profile':
                handleGetProfile($user);
                break;
            default:
                http_response_code(400);
                echo json_encode(array("message" => "Invalid action"));
                break;
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function handleLogin($user, $data) {
    if (!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Email and password are required"));
        return;
    }

    $result = $user->login($data->email, $data->password);
    
    if ($result['success']) {
        // Start session and store user data
        session_start();
        $_SESSION['user_id'] = $result['user']['id'];
        $_SESSION['user_email'] = $result['user']['email'];
        $_SESSION['user_name'] = $result['user']['first_name'] . ' ' . $result['user']['last_name'];
        
        http_response_code(200);
        echo json_encode(array(
            "message" => "Login successful",
            "user" => $result['user']
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => $result['message']));
    }
}

function handleRegister($user, $data) {
    if (!isset($data->email) || !isset($data->password) || !isset($data->first_name) || !isset($data->last_name)) {
        http_response_code(400);
        echo json_encode(array("message" => "All fields are required"));
        return;
    }

    $result = $user->register($data);
    
    if ($result['success']) {
        http_response_code(201);
        echo json_encode(array(
            "message" => "Registration successful",
            "user" => $result['user']
        ));
    } else {
        http_response_code(400);
        echo json_encode(array("message" => $result['message']));
    }
}

function handleLogout() {
    session_start();
    session_destroy();
    
    http_response_code(200);
    echo json_encode(array("message" => "Logout successful"));
}

function handleGetProfile($user) {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(array("message" => "Not authenticated"));
        return;
    }

    $result = $user->getProfile($_SESSION['user_id']);
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode(array("user" => $result['user']));
    } else {
        http_response_code(404);
        echo json_encode(array("message" => $result['message']));
    }
}
?> 