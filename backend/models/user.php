<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $first_name;
    public $last_name;
    public $email;
    public $phone;
    public $password;
    public $date_of_birth;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register new user
    public function register($data) {
        // Check if email already exists
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE email = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $data->email);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            return array(
                'success' => false,
                'message' => 'Email already exists'
            );
        }

        // Hash password
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

        // Insert query
        $query = "INSERT INTO " . $this->table_name . " 
                  (first_name, last_name, email, phone, password, date_of_birth, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(1, $data->first_name);
        $stmt->bindParam(2, $data->last_name);
        $stmt->bindParam(3, $data->email);
        $stmt->bindParam(4, $data->phone);
        $stmt->bindParam(5, $hashed_password);
        $stmt->bindParam(6, $data->date_of_birth);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return array(
                'success' => true,
                'message' => 'User registered successfully',
                'user' => array(
                    'id' => $this->id,
                    'first_name' => $data->first_name,
                    'last_name' => $data->last_name,
                    'email' => $data->email,
                    'phone' => $data->phone
                )
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Registration failed'
            );
        }
    }

    // Login user
    public function login($email, $password) {
        $query = "SELECT id, first_name, last_name, email, phone, password, date_of_birth 
                  FROM " . $this->table_name . " 
                  WHERE email = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($password, $row['password'])) {
                return array(
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => array(
                        'id' => $row['id'],
                        'first_name' => $row['first_name'],
                        'last_name' => $row['last_name'],
                        'email' => $row['email'],
                        'phone' => $row['phone'],
                        'date_of_birth' => $row['date_of_birth']
                    )
                );
            } else {
                return array(
                    'success' => false,
                    'message' => 'Invalid password'
                );
            }
        } else {
            return array(
                'success' => false,
                'message' => 'User not found'
            );
        }
    }

    // Get user profile
    public function getProfile($user_id) {
        $query = "SELECT id, first_name, last_name, email, phone, date_of_birth, created_at 
                  FROM " . $this->table_name . " 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return array(
                'success' => true,
                'user' => $row
            );
        } else {
            return array(
                'success' => false,
                'message' => 'User not found'
            );
        }
    }

    // Update user profile
    public function updateProfile($user_id, $data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, updated_at = NOW() 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $data->first_name);
        $stmt->bindParam(2, $data->last_name);
        $stmt->bindParam(3, $data->phone);
        $stmt->bindParam(4, $data->date_of_birth);
        $stmt->bindParam(5, $user_id);

        if ($stmt->execute()) {
            return array(
                'success' => true,
                'message' => 'Profile updated successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Profile update failed'
            );
        }
    }

    // Change password
    public function changePassword($user_id, $current_password, $new_password) {
        // First verify current password
        $query = "SELECT password FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($current_password, $row['password'])) {
                // Hash new password
                $hashed_new_password = password_hash($new_password, PASSWORD_DEFAULT);
                
                // Update password
                $update_query = "UPDATE " . $this->table_name . " 
                                SET password = ?, updated_at = NOW() 
                                WHERE id = ?";
                
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(1, $hashed_new_password);
                $update_stmt->bindParam(2, $user_id);
                
                if ($update_stmt->execute()) {
                    return array(
                        'success' => true,
                        'message' => 'Password changed successfully'
                    );
                } else {
                    return array(
                        'success' => false,
                        'message' => 'Password change failed'
                    );
                }
            } else {
                return array(
                    'success' => false,
                    'message' => 'Current password is incorrect'
                );
            }
        } else {
            return array(
                'success' => false,
                'message' => 'User not found'
            );
        }
    }

    // Check if email exists
    public function emailExists($email) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}
?>
