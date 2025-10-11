-- ============================================
-- STORE MANAGEMENT DATABASE - COMPLETE SETUP
-- Xóa database cũ và tạo mới hoàn toàn
-- ============================================

DROP DATABASE IF EXISTS store_management;
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE store_management;

-- ============================================
-- TABLES
-- ============================================

-- Users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Customers
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Categories
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Suppliers
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Warehouses
CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    address TEXT,
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Products
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    category_id INT,
    supplier_id INT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    description TEXT,
    image_url VARCHAR(255),
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_barcode (barcode),
    INDEX idx_status (status),
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Inventory
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE SET NULL,
    UNIQUE KEY unique_product_warehouse (product_id, warehouse_id)
) ENGINE=InnoDB;

-- Promotions
CREATE TABLE promotions (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    promo_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('percent', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    usage_limit INT DEFAULT 0,
    used_count INT DEFAULT 0,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promo_code (promo_code),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Orders
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    user_id INT,
    promo_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'paid', 'canceled') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (promo_id) REFERENCES promotions(promo_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Order Items
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Payments
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'e-wallet') NOT NULL DEFAULT 'cash',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Purchase Orders
CREATE TABLE purchase_orders (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    user_id INT NOT NULL,
    warehouse_id INT,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Purchase Items
CREATE TABLE purchase_items (
    purchase_item_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchase_orders(purchase_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Audit Logs
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- INSERT DATA
-- ============================================

-- Users
INSERT INTO users (username, password, full_name, role, status) VALUES
('admin', '123456', 'Quản trị viên', 'admin', 'active'),
('staff01', '123456', 'Nguyễn Văn A', 'staff', 'active'),
('staff02', '123456', 'Trần Thị B', 'staff', 'active');

-- Customers
INSERT INTO customers (name, phone, email, address, status) VALUES
('Nguyễn Văn An', '0901234567', 'nguyenvanan@email.com', '123 Nguyễn Huệ, Q.1, TP.HCM', 'active'),
('Trần Thị Bình', '0912345678', 'tranthibinh@email.com', '456 Lê Lợi, Q.1, TP.HCM', 'active'),
('Lê Hoàng Cường', '0923456789', 'lehoangcuong@email.com', '789 Trần Hưng Đạo, Q.5, TP.HCM', 'active'),
('Phạm Thị Dung', '0934567890', 'phamthidung@email.com', '321 Võ Văn Tần, Q.3, TP.HCM', 'active'),
('Hoàng Văn Em', '0945678901', 'hoangvanem@email.com', '654 Cách Mạng Tháng 8, Q.10, TP.HCM', 'active'),
('Võ Thị Phương', '0956789012', 'vothiphuong@email.com', '147 Nguyễn Thị Minh Khai, Q.3, TP.HCM', 'active'),
('Đặng Văn Giang', '0967890123', 'dangvangiang@email.com', '258 Lý Thường Kiệt, Q.11, TP.HCM', 'active'),
('Bùi Thị Hoa', '0978901234', 'buithihoa@email.com', '369 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', 'active');

-- Categories
INSERT INTO categories (category_name, description, status) VALUES
('Đồ uống', 'Các loại nước giải khát', 'active'),
('Bánh kẹo', 'Bánh ngọt và kẹo các loại', 'active'),
('Gia vị', 'Gia vị nấu ăn', 'active'),
('Đồ gia dụng', 'Dụng cụ gia đình', 'active'),
('Mỹ phẩm', 'Sản phẩm chăm sóc cá nhân', 'active'),
('Thực phẩm tươi sống', 'Rau củ, thịt cá tươi', 'active'),
('Đồ khô', 'Thực phẩm khô, hạt dinh dưỡng', 'active'),
('Sữa và sản phẩm từ sữa', 'Sữa, phô mai, sữa chua', 'active');

-- Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address, status) VALUES
('Công ty TNHH Thực phẩm Việt', 'Nguyễn Văn A', '0281234567', 'tpviet@company.com', '123 Đường ABC, Quận 1, TP.HCM', 'active'),
('Công ty Cổ phần Đồ uống Sài Gòn', 'Trần Thị B', '0282345678', 'sgdrink@company.com', '456 Đường XYZ, Quận 3, TP.HCM', 'active'),
('Công ty TNHH Gia vị Hương Việt', 'Lê Văn C', '0283456789', 'huongviet@company.com', '789 Đường DEF, Quận 5, TP.HCM', 'active'),
('Công ty CP Mỹ phẩm Thiên Nhiên', 'Phạm Thị D', '0284567890', 'thiennhien@company.com', '321 Đường GHI, Quận 10, TP.HCM', 'active'),
('Công ty TNHH Đồ gia dụng An Lạc', 'Hoàng Văn E', '0285678901', 'anlac@company.com', '654 Đường JKL, Quận Bình Thạnh, TP.HCM', 'active');

-- Warehouses
INSERT INTO warehouses (warehouse_name, address, status) VALUES
('Kho chính - Quận 1', '100 Nguyễn Huệ, Quận 1, TP.HCM', 'active'),
('Kho phụ - Quận 5', '200 Trần Hưng Đạo, Quận 5, TP.HCM', 'active'),
('Kho lạnh - Quận Bình Thạnh', '300 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'active');

-- Products
INSERT INTO products (product_name, barcode, category_id, supplier_id, price, cost_price, unit, status) VALUES
('Coca Cola 330ml', '8934588180019', 1, 2, 12000, 9000, 'lon', 'active'),
('Pepsi 330ml', '8934588180026', 1, 2, 11000, 8500, 'lon', 'active'),
('Sting dâu 330ml', '8934588180033', 1, 2, 10000, 7500, 'lon', 'active'),
('Trà xanh C2 455ml', '8934588180040', 1, 2, 9000, 7000, 'chai', 'active'),
('Nước suối Lavie 500ml', '8934588180057', 1, 2, 5000, 3500, 'chai', 'active'),
('Bánh Oreo gói 133g', '8934588180064', 2, 1, 25000, 18000, 'gói', 'active'),
('Bánh Chocopie hộp 12 cái', '8934588180071', 2, 1, 45000, 35000, 'hộp', 'active'),
('Kẹo Alpenliebe 100 viên', '8934588180088', 2, 1, 30000, 22000, 'gói', 'active'),
('Snack Oishi 42g', '8934588180095', 2, 1, 8000, 6000, 'gói', 'active'),
('Mì Hảo Hảo tôm chua cay', '8934588180101', 7, 1, 3500, 2800, 'gói', 'active'),
('Mì Omachi sườn heo', '8934588180118', 7, 1, 4000, 3200, 'gói', 'active'),
('Nước mắm Nam Ngư 500ml', '8934588180125', 3, 3, 35000, 28000, 'chai', 'active'),
('Dầu ăn Simply 1L', '8934588180132', 3, 3, 45000, 38000, 'chai', 'active'),
('Muối I-ốt 500g', '8934588180149', 3, 3, 8000, 6000, 'gói', 'active'),
('Đường trắng 1kg', '8934588180156', 3, 3, 20000, 16000, 'gói', 'active'),
('Sữa rửa mặt Pond\'s 100g', '8934588180163', 5, 4, 55000, 42000, 'tuýp', 'active'),
('Dầu gội Clear 650ml', '8934588180170', 5, 4, 120000, 95000, 'chai', 'active'),
('Kem đánh răng P/S 240g', '8934588180187', 5, 4, 38000, 30000, 'tuýp', 'active'),
('Xà phòng Lifebuoy 90g', '8934588180194', 5, 4, 12000, 9000, 'cục', 'active'),
('Nồi cơm điện 1.8L', '8934588180200', 4, 5, 450000, 350000, 'cái', 'active'),
('Chảo chống dính 28cm', '8934588180217', 4, 5, 180000, 140000, 'cái', 'active'),
('Bộ dao inox 5 món', '8934588180224', 4, 5, 250000, 200000, 'bộ', 'active'),
('Thớt nhựa 30x40cm', '8934588180231', 4, 5, 45000, 35000, 'cái', 'active'),
('Sữa tươi Vinamilk 1L', '8934588180248', 8, 1, 32000, 26000, 'hộp', 'active'),
('Yaourt Vinamilk 4 hộp', '8934588180255', 8, 1, 18000, 14000, 'lốc', 'active');

-- Inventory (Thêm tồn kho cho sản phẩm)
INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES
(1, 1, 150), (2, 1, 120), (3, 1, 100), (4, 1, 80), (5, 1, 200),
(6, 1, 90), (7, 1, 70), (8, 1, 60), (9, 1, 150), (10, 1, 300),
(11, 1, 250), (12, 1, 85), (13, 1, 95), (14, 1, 110), (15, 1, 140),
(16, 1, 75), (17, 1, 65), (18, 1, 100), (19, 1, 85), (20, 1, 25),
(21, 1, 30), (22, 1, 40), (23, 1, 50), (24, 1, 180), (25, 1, 160);

-- Promotions
INSERT INTO promotions (promo_code, description, discount_type, discount_value, start_date, end_date, min_order_amount, usage_limit, used_count, status) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'percent', 10.00, '2025-01-01', '2025-12-31', 50000, 100, 5, 'active'),
('SALE50K', 'Giảm 50k cho đơn từ 300k', 'fixed', 50000.00, '2025-01-01', '2025-12-31', 300000, 0, 12, 'active'),
('FREESHIP', 'Miễn phí vận chuyển đơn từ 200k', 'fixed', 25000.00, '2025-01-01', '2025-12-31', 200000, 0, 28, 'active'),
('VIP15', 'Giảm 15% cho khách hàng VIP', 'percent', 15.00, '2025-01-01', '2025-12-31', 100000, 50, 8, 'active');

-- Orders
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(1, 2, 1, '2025-10-01 08:30:00', 'paid', 150000, 15000),
(2, 2, NULL, '2025-10-01 10:15:00', 'paid', 85000, 0),
(3, 3, 2, '2025-10-02 14:20:00', 'paid', 320000, 50000),
(4, 2, NULL, '2025-10-03 09:45:00', 'paid', 125000, 0),
(1, 3, 3, '2025-10-03 16:30:00', 'paid', 235000, 25000),
(5, 2, NULL, '2025-10-04 11:20:00', 'paid', 95000, 0),
(6, 3, 1, '2025-10-05 13:50:00', 'paid', 180000, 18000),
(7, 2, NULL, '2025-10-05 15:10:00', 'canceled', 0, 0),
(8, 3, NULL, '2025-10-06 10:00:00', 'paid', 220000, 0),
(2, 2, 4, '2025-10-07 14:30:00', 'paid', 150000, 22500),
(3, 3, NULL, '2025-10-08 09:15:00', 'pending', 75000, 0),
(4, 2, NULL, '2025-10-09 11:45:00', 'pending', 165000, 0);

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
-- Order 1
(1, 1, 5, 12000, 60000),
(1, 6, 3, 25000, 75000),
(1, 10, 5, 3500, 17500),
-- Order 2
(2, 4, 4, 9000, 36000),
(2, 9, 6, 8000, 48000),
-- Order 3
(3, 20, 1, 450000, 450000),
(3, 13, 2, 45000, 90000),
-- Order 4
(4, 16, 1, 55000, 55000),
(4, 18, 2, 38000, 76000),
-- Order 5
(5, 7, 2, 45000, 90000),
(5, 17, 1, 120000, 120000),
(5, 5, 5, 5000, 25000),
-- Order 6
(6, 11, 10, 4000, 40000),
(6, 12, 1, 35000, 35000),
(6, 14, 1, 8000, 8000),
(6, 15, 1, 20000, 20000),
-- Order 7: Canceled
-- Order 8
(8, 21, 1, 180000, 180000),
(8, 23, 1, 45000, 45000),
-- Order 9
(9, 24, 5, 32000, 160000),
(9, 25, 4, 18000, 72000),
-- Order 10
(10, 2, 10, 11000, 110000),
(10, 3, 4, 10000, 40000),
-- Order 11
(11, 8, 2, 30000, 60000),
(11, 19, 1, 12000, 12000),
-- Order 12
(12, 22, 1, 250000, 250000);

-- Payments
INSERT INTO payments (order_id, amount, payment_method, payment_date) VALUES
(1, 135000, 'cash', '2025-10-01 08:35:00'),
(2, 85000, 'card', '2025-10-01 10:20:00'),
(3, 270000, 'e-wallet', '2025-10-02 14:25:00'),
(4, 125000, 'cash', '2025-10-03 09:50:00'),
(5, 210000, 'bank_transfer', '2025-10-03 16:35:00'),
(6, 95000, 'cash', '2025-10-04 11:25:00'),
(7, 162000, 'card', '2025-10-05 13:55:00'),
(9, 220000, 'cash', '2025-10-06 10:05:00'),
(10, 127500, 'e-wallet', '2025-10-07 14:35:00');

-- Purchase Orders
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(2, 1, 1, '2025-09-15 10:00:00', 5500000, 'completed'),
(1, 1, 1, '2025-09-20 14:30:00', 3200000, 'completed'),
(3, 1, 1, '2025-09-25 09:15:00', 2100000, 'completed'),
(4, 1, 1, '2025-10-01 11:00:00', 1800000, 'completed'),
(5, 1, 1, '2025-10-05 15:20:00', 2500000, 'pending');

-- Purchase Items
INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
-- Purchase 1 - Đồ uống
(1, 1, 100, 9000, 900000),
(1, 2, 80, 8500, 680000),
(1, 3, 80, 7500, 600000),
(1, 4, 60, 7000, 420000),
(1, 5, 150, 3500, 525000),
-- Purchase 2 - Thực phẩm
(2, 6, 60, 18000, 1080000),
(2, 7, 50, 35000, 1750000),
(2, 8, 40, 22000, 880000),
(2, 9, 100, 6000, 600000),
(2, 10, 200, 2800, 560000),
(2, 11, 150, 3200, 480000),
-- Purchase 3 - Gia vị
(3, 12, 60, 28000, 1680000),
(3, 13, 70, 38000, 2660000),
(3, 14, 80, 6000, 480000),
(3, 15, 100, 16000, 1600000),
-- Purchase 4 - Mỹ phẩm
(4, 16, 50, 42000, 2100000),
(4, 17, 40, 95000, 3800000),
(4, 18, 70, 30000, 2100000),
(4, 19, 60, 9000, 540000),
-- Purchase 5 - Đồ gia dụng
(5, 20, 20, 350000, 7000000),
(5, 21, 25, 140000, 3500000),
(5, 22, 30, 200000, 6000000);

-- Audit Logs (Mẫu)
INSERT INTO audit_logs (user_id, action, table_name, record_id, new_value, ip_address) VALUES
(1, 'LOGIN', NULL, NULL, '{"username":"admin"}', '192.168.1.100'),
(2, 'LOGIN', NULL, NULL, '{"username":"staff01"}', '192.168.1.101'),
(1, 'INSERT', 'products', 1, '{"product_name":"Coca Cola 330ml","price":12000}', '192.168.1.100'),
(2, 'INSERT', 'orders', 1, '{"customer_id":1,"total_amount":150000}', '192.168.1.101'),
(3, 'INSERT', 'orders', 2, '{"customer_id":2,"total_amount":85000}', '192.168.1.102');

-- ============================================
-- SUMMARY
-- ============================================
SELECT '========================================' as '';
SELECT 'DATABASE CREATED SUCCESSFULLY!' as Status;
SELECT '========================================' as '';
SELECT '' as '';
SELECT 'Summary:' as '';
SELECT CONCAT('Users: ', COUNT(*)) as Info FROM users;
SELECT CONCAT('Customers: ', COUNT(*)) as Info FROM customers;
SELECT CONCAT('Categories: ', COUNT(*)) as Info FROM categories;
SELECT CONCAT('Suppliers: ', COUNT(*)) as Info FROM suppliers;
SELECT CONCAT('Warehouses: ', COUNT(*)) as Info FROM warehouses;
SELECT CONCAT('Products: ', COUNT(*)) as Info FROM products;
SELECT CONCAT('Inventory Records: ', COUNT(*)) as Info FROM inventory;
SELECT CONCAT('Orders: ', COUNT(*)) as Info FROM orders;
SELECT CONCAT('Order Items: ', COUNT(*)) as Info FROM order_items;
SELECT CONCAT('Payments: ', COUNT(*)) as Info FROM payments;
SELECT CONCAT('Promotions: ', COUNT(*)) as Info FROM promotions;
SELECT CONCAT('Purchase Orders: ', COUNT(*)) as Info FROM purchase_orders;
SELECT CONCAT('Audit Logs: ', COUNT(*)) as Info FROM audit_logs;
SELECT '' as '';
SELECT 'Login Information:' as '';
SELECT '  Username: admin' as '';
SELECT '  Password: 123456' as '';
SELECT '' as '';
SELECT 'Setup completed successfully!' as '';
