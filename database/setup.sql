-- Crafts of Bengal Database Setup
-- Run this file in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS crafts_of_bengal;
USE crafts_of_bengal;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artisans table
CREATE TABLE artisans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    location VARCHAR(100),
    specialization VARCHAR(100),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    artisan_id INT,
    category_id INT,
    image VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_zip VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- User addresses table
CREATE TABLE user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_type VARCHAR(20) DEFAULT 'home',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- Insert sample data

-- Sample categories
INSERT INTO categories (name, description) VALUES
('Nakshi Kantha', 'Traditional embroidered quilts and textiles'),
('Terracotta', 'Baked clay art and decorative items'),
('Jamdani', 'Fine muslin textiles with geometric patterns'),
('Jute Products', 'Eco-friendly products made from jute fibers'),
('Metal Crafts', 'Traditional metalwork and sculptures'),
('Wood Carvings', 'Carved wooden furniture and decorative pieces');

-- Sample artisans
INSERT INTO artisans (name, bio, location, specialization) VALUES
('Fatima Begum', 'Master of Nakshi Kantha embroidery with 30 years of experience', 'Jessore, Bangladesh', 'Nakshi Kantha'),
('Rahim Ali', 'Third-generation potter creating exquisite terracotta pieces', 'Bogra, Bangladesh', 'Terracotta'),
('Karim Hossain', 'Expert weaver specializing in traditional Jamdani textiles', 'Dhaka, Bangladesh', 'Jamdani'),
('Shahin Ahmed', 'Skilled metalworker preserving ancient Dhokra casting techniques', 'Rangpur, Bangladesh', 'Metal Crafts');

-- Sample products
INSERT INTO products (name, description, price, artisan_id, category_id, stock_quantity) VALUES
('Nakshi Kantha Quilt', 'Hand-embroidered traditional quilt with intricate patterns', 2500.00, 1, 1, 10),
('Terracotta Pottery Set', 'Beautiful set of 4 handcrafted terracotta pots', 1800.00, 2, 2, 15),
('Jamdani Saree', 'Elegant handwoven Jamdani saree with geometric designs', 3200.00, 3, 3, 8),
('Jute Shopping Bag', 'Eco-friendly jute shopping bag with traditional motifs', 500.00, 4, 4, 25),
('Dhokra Metal Sculpture', 'Traditional metal sculpture using lost-wax casting', 1500.00, 4, 5, 5);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_artisan ON products(artisan_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id); 