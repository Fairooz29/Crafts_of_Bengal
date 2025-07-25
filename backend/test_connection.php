<?php
// Test database connection and basic functionality
header("Content-Type: application/json; charset=UTF-8");

try {
    // Include database configuration
    include_once 'config/database.php';
    
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo json_encode(array(
            "status" => "success",
            "message" => "Database connection successful",
            "database" => "crafts_of_bengal"
        ));
        
        // Test if tables exist
        $tables = array('users', 'products', 'artisans', 'categories', 'orders');
        $existing_tables = array();
        
        foreach ($tables as $table) {
            $query = "SHOW TABLES LIKE '$table'";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $existing_tables[] = $table;
            }
        }
        
        echo "\n\nTables found: " . implode(", ", $existing_tables);
        
    } else {
        echo json_encode(array(
            "status" => "error",
            "message" => "Database connection failed"
        ));
    }
    
} catch (Exception $e) {
    echo json_encode(array(
        "status" => "error",
        "message" => "Error: " . $e->getMessage()
    ));
}
?> 