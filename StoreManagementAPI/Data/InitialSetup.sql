-- ============================================
-- STORE MANAGEMENT DATABASE - COMPLETE SETUP
-- Hệ thống quản lý cửa hàng bán lẻ - Phiên bản hoàn chỉnh
-- Cập nhật: 2025-10-13
-- Đặc điểm: 1 kho duy nhất, xóa mềm với status
-- ============================================

DROP DATABASE IF EXISTS store_management;
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE store_management;

-- ============================================
-- TABLES
-- ============================================

-- Users - Quản lý người dùng
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

-- Customers - Quản lý khách hàng
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
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Categories - Danh mục sản phẩm
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Suppliers - Nhà cung cấp
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
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Warehouses - Kho hàng (Chỉ 1 kho duy nhất)
CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    address TEXT,
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Products - Sản phẩm
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
    INDEX idx_product_name (product_name),
    INDEX idx_barcode (barcode),
    INDEX idx_status (status),
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Inventory - Tồn kho (1 kho duy nhất)
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL DEFAULT 1,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_product_warehouse (product_id, warehouse_id)
) ENGINE=InnoDB;

-- Promotions - Chương trình khuyến mãi
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
    status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promo_code (promo_code),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB;

-- Orders - Đơn hàng
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    user_id INT,
    promo_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'paid', 'canceled', 'deleted') NOT NULL DEFAULT 'pending',
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

-- Order Items - Chi tiết đơn hàng
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

-- Payments - Thanh toán
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'e-wallet') NOT NULL DEFAULT 'cash',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('completed', 'pending', 'failed', 'deleted') NOT NULL DEFAULT 'completed',
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Purchase Orders - Đơn nhập hàng
CREATE TABLE purchase_orders (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    user_id INT NOT NULL,
    warehouse_id INT NOT NULL DEFAULT 1,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'completed', 'canceled', 'deleted') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_purchase_date (purchase_date)
) ENGINE=InnoDB;

-- Purchase Items - Chi tiết đơn nhập hàng
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

-- Audit Logs - Nhật ký hệ thống
CREATE TABLE audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    entity_name VARCHAR(255),
    old_values TEXT,
    new_values TEXT,
    changes_summary TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    additional_info TEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_created_at (created_at),
    INDEX idx_entity_type_id (entity_type, entity_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- 1. Kho hàng (CHỈ 1 KHO DUY NHẤT)
INSERT INTO warehouses (warehouse_id, warehouse_name, address, status) VALUES
(1, 'Kho Chính', '123 Nguyễn Huệ, Quận 1, TP.HCM', 'active');

-- 2. Users (Admin + Staff)
INSERT INTO users (username, password, full_name, role, status) VALUES
('admin', '123456', 'Quản trị viên', 'admin', 'active'),
('staff01', '123456', 'Nguyễn Văn A', 'staff', 'active'),
('staff02', '123456', 'Trần Thị B', 'staff', 'active');

-- 3. Customers
INSERT INTO customers (name, phone, email, address, status) VALUES
('Nguyễn Văn An', '0901234567', 'nguyenvanan@email.com', '123 Nguyễn Huệ, Q.1, TP.HCM', 'active'),
('Trần Thị Bình', '0912345678', 'tranthibinh@email.com', '456 Lê Lợi, Q.1, TP.HCM', 'active'),
('Lê Hoàng Cường', '0923456789', 'lehoangcuong@email.com', '789 Trần Hưng Đạo, Q.5, TP.HCM', 'active'),
('Phạm Thị Dung', '0934567890', 'phamthidung@email.com', '321 Võ Văn Tần, Q.3, TP.HCM', 'active'),
('Hoàng Văn Em', '0945678901', 'hoangvanem@email.com', '654 Cách Mạng Tháng 8, Q.10, TP.HCM', 'active'),
('Võ Thị Phương', '0956789012', 'vothiphuong@email.com', '147 Nguyễn Thị Minh Khai, Q.3, TP.HCM', 'active'),
('Đặng Văn Giang', '0967890123', 'dangvangiang@email.com', '258 Lý Thường Kiệt, Q.11, TP.HCM', 'active'),
('Bùi Thị Hoa', '0978901234', 'buithihoa@email.com', '369 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', 'active');

-- 4. Categories
INSERT INTO categories (category_name, description, status) VALUES
('Đồ uống', 'Các loại nước giải khát', 'active'),
('Bánh kẹo', 'Bánh ngọt và kẹo các loại', 'active'),
('Gia vị', 'Gia vị nấu ăn', 'active'),
('Đồ gia dụng', 'Dụng cụ gia đình', 'active'),
('Mỹ phẩm', 'Sản phẩm chăm sóc cá nhân', 'active'),
('Thực phẩm tươi sống', 'Rau củ, thịt cá tươi', 'active'),
('Đồ khô', 'Thực phẩm khô, hạt dinh dưỡng', 'active'),
('Sữa và sản phẩm từ sữa', 'Sữa, phô mai, sữa chua', 'active');

-- 5. Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address, status) VALUES
('Công ty TNHH Thực phẩm Việt', 'Nguyễn Văn A', '0281234567', 'tpviet@company.com', '123 Đường ABC, Quận 1, TP.HCM', 'active'),
('Công ty Cổ phần Đồ uống Sài Gòn', 'Trần Thị B', '0282345678', 'sgdrink@company.com', '456 Đường XYZ, Quận 3, TP.HCM', 'active'),
('Công ty TNHH Gia vị Hương Việt', 'Lê Văn C', '0283456789', 'huongviet@company.com', '789 Đường DEF, Quận 5, TP.HCM', 'active'),
('Công ty CP Mỹ phẩm Thiên Nhiên', 'Phạm Thị D', '0284567890', 'thiennhien@company.com', '321 Đường GHI, Quận 10, TP.HCM', 'active'),
('Công ty TNHH Đồ gia dụng An Lạc', 'Hoàng Văn E', '0285678901', 'anlac@company.com', '654 Đường JKL, Quận Bình Thạnh, TP.HCM', 'active');

-- 6. Products
INSERT INTO products (product_name, barcode, category_id, supplier_id, price, cost_price, unit, status) VALUES
-- Đồ uống
('Coca Cola 330ml', '8934588180019', 1, 2, 12000, 9000, 'lon', 'active'),
('Pepsi 330ml', '8934588180026', 1, 2, 11000, 8500, 'lon', 'active'),
('Sting dâu 330ml', '8934588180033', 1, 2, 10000, 7500, 'lon', 'active'),
('Trà xanh C2 455ml', '8934588180040', 1, 2, 9000, 7000, 'chai', 'active'),
('Nước suối Lavie 500ml', '8934588180057', 1, 2, 5000, 3500, 'chai', 'active'),
-- Bánh kẹo
('Bánh Oreo gói 133g', '8934588180064', 2, 1, 25000, 18000, 'gói', 'active'),
('Bánh Chocopie hộp 12 cái', '8934588180071', 2, 1, 45000, 35000, 'hộp', 'active'),
('Kẹo Alpenliebe 100 viên', '8934588180088', 2, 1, 30000, 22000, 'gói', 'active'),
('Snack Oishi 42g', '8934588180095', 2, 1, 8000, 6000, 'gói', 'active'),
-- Đồ khô
('Mì Hảo Hảo tôm chua cay', '8934588180101', 7, 1, 3500, 2800, 'gói', 'active'),
('Mì Omachi sườn heo', '8934588180118', 7, 1, 4000, 3200, 'gói', 'active'),
-- Gia vị
('Nước mắm Nam Ngư 500ml', '8934588180125', 3, 3, 35000, 28000, 'chai', 'active'),
('Dầu ăn Simply 1L', '8934588180132', 3, 3, 45000, 38000, 'chai', 'active'),
('Muối I-ốt 500g', '8934588180149', 3, 3, 8000, 6000, 'gói', 'active'),
('Đường trắng 1kg', '8934588180156', 3, 3, 20000, 16000, 'gói', 'active'),
-- Mỹ phẩm
('Sữa rửa mặt Pond\'s 100g', '8934588180163', 5, 4, 55000, 42000, 'tuýp', 'active'),
('Dầu gội Clear 650ml', '8934588180170', 5, 4, 120000, 95000, 'chai', 'active'),
('Kem đánh răng P/S 240g', '8934588180187', 5, 4, 38000, 30000, 'tuýp', 'active'),
('Xà phòng Lifebuoy 90g', '8934588180194', 5, 4, 12000, 9000, 'cục', 'active'),
-- Đồ gia dụng
('Nồi cơm điện 1.8L', '8934588180200', 4, 5, 450000, 350000, 'cái', 'active'),
('Chảo chống dính 28cm', '8934588180217', 4, 5, 180000, 140000, 'cái', 'active'),
('Bộ dao inox 5 món', '8934588180224', 4, 5, 250000, 200000, 'bộ', 'active'),
('Thớt nhựa 30x40cm', '8934588180231', 4, 5, 45000, 35000, 'cái', 'active'),
-- Sữa
('Sữa tươi Vinamilk 1L', '8934588180248', 8, 1, 32000, 26000, 'hộp', 'active'),
('Yaourt Vinamilk 4 hộp', '8934588180255', 8, 1, 18000, 14000, 'lốc', 'active');

-- 7. Promotions
INSERT INTO promotions (promo_code, description, discount_type, discount_value, start_date, end_date, min_order_amount, usage_limit, used_count, status) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'percent', 10.00, '2025-01-01', '2025-12-31', 50000, 100, 5, 'active'),
('SALE50K', 'Giảm 50k cho đơn từ 300k', 'fixed', 50000.00, '2025-01-01', '2025-12-31', 300000, 0, 12, 'active'),
('FREESHIP', 'Miễn phí vận chuyển đơn từ 200k', 'fixed', 25000.00, '2025-01-01', '2025-12-31', 200000, 0, 28, 'active'),
('VIP15', 'Giảm 15% cho khách hàng VIP', 'percent', 15.00, '2025-01-01', '2025-12-31', 100000, 50, 8, 'active');

-- ============================================
-- PURCHASE ORDERS - Đơn nhập hàng (Trước khi bán)
-- ============================================

-- Purchase Order 1: Nhập đồ uống (15/09/2025)
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(2, 1, 1, '2025-09-15 10:00:00', 3025000, 'completed');

INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
(1, 1, 100, 9000, 900000),   -- Coca 100 lon
(1, 2, 80, 8500, 680000),    -- Pepsi 80 lon
(1, 3, 80, 7500, 600000),    -- Sting 80 lon
(1, 4, 60, 7000, 420000),    -- Trà C2 60 chai
(1, 5, 150, 3500, 525000);   -- Nước Lavie 150 chai

-- Purchase Order 2: Nhập thực phẩm, bánh kẹo (20/09/2025)
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(1, 1, 1, '2025-09-20 14:30:00', 4350000, 'completed');

INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
(2, 6, 60, 18000, 1080000),   -- Oreo 60 gói
(2, 7, 50, 35000, 1750000),   -- Chocopie 50 hộp
(2, 8, 40, 22000, 880000),    -- Kẹo 40 gói
(2, 9, 100, 6000, 600000),    -- Snack 100 gói
(2, 10, 200, 2800, 560000),   -- Mì Hảo Hảo 200 gói
(2, 11, 150, 3200, 480000);   -- Mì Omachi 150 gói

-- Purchase Order 3: Nhập gia vị (25/09/2025)
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(3, 1, 1, '2025-09-25 09:15:00', 6420000, 'completed');

INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
(3, 12, 60, 28000, 1680000),  -- Nước mắm 60 chai
(3, 13, 70, 38000, 2660000),  -- Dầu ăn 70 chai
(3, 14, 80, 6000, 480000),    -- Muối 80 gói
(3, 15, 100, 16000, 1600000); -- Đường 100 gói

-- Purchase Order 4: Nhập mỹ phẩm (01/10/2025)
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(4, 1, 1, '2025-10-01 11:00:00', 8540000, 'completed');

INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
(4, 16, 50, 42000, 2100000),  -- Sữa rửa mặt 50 tuýp
(4, 17, 40, 95000, 3800000),  -- Dầu gội 40 chai
(4, 18, 70, 30000, 2100000),  -- Kem đánh răng 70 tuýp
(4, 19, 60, 9000, 540000);    -- Xà phòng 60 cục

-- Purchase Order 5: Nhập đồ gia dụng (05/10/2025)
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(5, 1, 1, '2025-10-05 15:20:00', 16500000, 'completed');

INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
(5, 20, 20, 350000, 7000000), -- Nồi cơm 20 cái
(5, 21, 25, 140000, 3500000), -- Chảo 25 cái
(5, 22, 30, 200000, 6000000); -- Bộ dao 30 bộ

-- Purchase Order 6: Nhập sữa và thớt (08/10/2025)
INSERT INTO purchase_orders (supplier_id, user_id, warehouse_id, purchase_date, total_amount, status) VALUES
(1, 1, 1, '2025-10-08 10:30:00', 7530000, 'completed');

INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal) VALUES
(6, 23, 50, 35000, 1750000),  -- Thớt 50 cái
(6, 24, 180, 26000, 4680000), -- Sữa tươi 180 hộp
(6, 25, 160, 14000, 2240000); -- Yaourt 160 lốc

-- ============================================
-- CẬP NHẬT TỒN KHO sau khi nhập hàng (INVENTORY)
-- Tổng hợp từ tất cả purchase orders
-- ============================================

INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES
-- Đồ uống
(1, 1, 100),  -- Coca: nhập 100
(2, 1, 80),   -- Pepsi: nhập 80
(3, 1, 80),   -- Sting: nhập 80
(4, 1, 60),   -- Trà C2: nhập 60
(5, 1, 150),  -- Nước Lavie: nhập 150
-- Bánh kẹo
(6, 1, 60),   -- Oreo: nhập 60
(7, 1, 50),   -- Chocopie: nhập 50
(8, 1, 40),   -- Kẹo: nhập 40
(9, 1, 100),  -- Snack: nhập 100
-- Đồ khô
(10, 1, 200), -- Mì Hảo Hảo: nhập 200
(11, 1, 150), -- Mì Omachi: nhập 150
-- Gia vị
(12, 1, 60),  -- Nước mắm: nhập 60
(13, 1, 70),  -- Dầu ăn: nhập 70
(14, 1, 80),  -- Muối: nhập 80
(15, 1, 100), -- Đường: nhập 100
-- Mỹ phẩm
(16, 1, 50),  -- Sữa rửa mặt: nhập 50
(17, 1, 40),  -- Dầu gội: nhập 40
(18, 1, 70),  -- Kem đánh răng: nhập 70
(19, 1, 60),  -- Xà phòng: nhập 60
-- Đồ gia dụng
(20, 1, 20),  -- Nồi cơm: nhập 20
(21, 1, 25),  -- Chảo: nhập 25
(22, 1, 30),  -- Bộ dao: nhập 30
(23, 1, 50),  -- Thớt: nhập 50
-- Sữa
(24, 1, 180), -- Sữa tươi: nhập 180
(25, 1, 160); -- Yaourt: nhập 160

-- ============================================
-- ORDERS - Đơn bán hàng (Sau khi đã có tồn kho)
-- ============================================

-- Order 1: 01/10/2025 - Bán đồ uống và bánh
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(1, 2, 1, '2025-10-01 08:30:00', 'paid', 152500, 15250);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(1, 1, 5, 12000, 60000),   -- Coca 5 lon
(1, 6, 3, 25000, 75000),   -- Oreo 3 gói
(1, 10, 5, 3500, 17500);   -- Mì Hảo Hảo 5 gói

-- Order 2: 01/10/2025 - Bán nước và snack
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(2, 2, NULL, '2025-10-01 10:15:00', 'paid', 84000, 0);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(2, 4, 4, 9000, 36000),    -- Trà C2 4 chai
(2, 9, 6, 8000, 48000);    -- Snack 6 gói

-- Order 3: 02/10/2025 - Bán đồ gia dụng lớn
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(3, 3, 2, '2025-10-02 14:20:00', 'paid', 540000, 50000);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(3, 20, 1, 450000, 450000), -- Nồi cơm 1 cái
(3, 13, 2, 45000, 90000);   -- Dầu ăn 2 chai

-- Order 4: 03/10/2025 - Bán mỹ phẩm
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(4, 2, NULL, '2025-10-03 09:45:00', 'paid', 131000, 0);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(4, 16, 1, 55000, 55000),   -- Sữa rửa mặt 1 tuýp
(4, 18, 2, 38000, 76000);   -- Kem đánh răng 2 tuýp

-- Order 5: 03/10/2025 - Bán bánh và dầu gội
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(1, 3, 3, '2025-10-03 16:30:00', 'paid', 260000, 25000);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(5, 7, 2, 45000, 90000),    -- Chocopie 2 hộp
(5, 17, 1, 120000, 120000), -- Dầu gội 1 chai
(5, 5, 10, 5000, 50000);    -- Nước Lavie 10 chai

-- Order 6: 04/10/2025 - Bán đồ khô
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(5, 2, NULL, '2025-10-04 11:20:00', 'paid', 103000, 0);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(6, 11, 10, 4000, 40000),   -- Mì Omachi 10 gói
(6, 12, 1, 35000, 35000),   -- Nước mắm 1 chai
(6, 14, 1, 8000, 8000),     -- Muối 1 gói
(6, 15, 1, 20000, 20000);   -- Đường 1 gói

-- Order 7: 05/10/2025 - Bán đồ uống
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(6, 3, 1, '2025-10-05 13:50:00', 'paid', 198000, 19800);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(7, 2, 10, 11000, 110000),  -- Pepsi 10 lon
(7, 3, 4, 10000, 40000),    -- Sting 4 lon
(7, 9, 6, 8000, 48000);     -- Snack 6 gói

-- Order 8: 05/10/2025 - Đã hủy
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(7, 2, NULL, '2025-10-05 15:10:00', 'canceled', 0, 0);

-- Order 9: 06/10/2025 - Bán đồ gia dụng
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(8, 3, NULL, '2025-10-06 10:00:00', 'paid', 430000, 0);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(9, 21, 2, 180000, 360000), -- Chảo 2 cái
(9, 22, 1, 250000, 250000), -- Bộ dao 1 bộ
(9, 23, 2, 45000, 90000);   -- Thớt 2 cái (nhưng chỉ tính 70000 trong total ???)

-- Sửa lại Order 9
UPDATE orders SET total_amount = 700000 WHERE order_id = 9;

-- Order 10: 07/10/2025 - Bán sữa
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(2, 2, 4, '2025-10-07 14:30:00', 'paid', 232000, 34800);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(10, 24, 5, 32000, 160000), -- Sữa tươi 5 hộp
(10, 25, 4, 18000, 72000);  -- Yaourt 4 lốc

-- Order 11: 08/10/2025 - Đang chờ thanh toán
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(3, 3, NULL, '2025-10-08 09:15:00', 'pending', 72000, 0);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(11, 8, 2, 30000, 60000),   -- Kẹo 2 gói
(11, 19, 1, 12000, 12000);  -- Xà phòng 1 cục

-- Order 12: 09/10/2025 - Đang chờ thanh toán
INSERT INTO orders (customer_id, user_id, promo_id, order_date, status, total_amount, discount_amount) VALUES
(4, 2, NULL, '2025-10-09 11:45:00', 'pending', 250000, 0);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(12, 22, 1, 250000, 250000); -- Bộ dao 1 bộ

-- ============================================
-- PAYMENTS - Thanh toán (chỉ cho đơn đã paid)
-- ============================================

INSERT INTO payments (order_id, amount, payment_method, payment_date, status) VALUES
(1, 137250, 'cash', '2025-10-01 08:35:00', 'completed'),
(2, 84000, 'card', '2025-10-01 10:20:00', 'completed'),
(3, 490000, 'e-wallet', '2025-10-02 14:25:00', 'completed'),
(4, 131000, 'cash', '2025-10-03 09:50:00', 'completed'),
(5, 235000, 'bank_transfer', '2025-10-03 16:35:00', 'completed'),
(6, 103000, 'cash', '2025-10-04 11:25:00', 'completed'),
(7, 178200, 'card', '2025-10-05 13:55:00', 'completed'),
(9, 700000, 'cash', '2025-10-06 10:05:00', 'completed'),
(10, 197200, 'e-wallet', '2025-10-07 14:35:00', 'completed');

-- ============================================
-- CẬP NHẬT TỒN KHO sau khi bán hàng
-- Trừ đi số lượng đã bán
-- ============================================

-- Trừ tồn kho theo các đơn hàng đã paid
UPDATE inventory SET quantity = quantity - 5 WHERE product_id = 1;   -- Coca: 100 - 5 = 95
UPDATE inventory SET quantity = quantity - 10 WHERE product_id = 2;  -- Pepsi: 80 - 10 = 70
UPDATE inventory SET quantity = quantity - 4 WHERE product_id = 3;   -- Sting: 80 - 4 = 76
UPDATE inventory SET quantity = quantity - 4 WHERE product_id = 4;   -- Trà C2: 60 - 4 = 56
UPDATE inventory SET quantity = quantity - 10 WHERE product_id = 5;  -- Nước Lavie: 150 - 10 = 140
UPDATE inventory SET quantity = quantity - 3 WHERE product_id = 6;   -- Oreo: 60 - 3 = 57
UPDATE inventory SET quantity = quantity - 2 WHERE product_id = 7;   -- Chocopie: 50 - 2 = 48
-- Kẹo chưa bán (order 11 pending)
UPDATE inventory SET quantity = quantity - 6 - 6 WHERE product_id = 9; -- Snack: 100 - 12 = 88
UPDATE inventory SET quantity = quantity - 5 WHERE product_id = 10;  -- Mì Hảo Hảo: 200 - 5 = 195
UPDATE inventory SET quantity = quantity - 10 WHERE product_id = 11; -- Mì Omachi: 150 - 10 = 140
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 12;  -- Nước mắm: 60 - 1 = 59
UPDATE inventory SET quantity = quantity - 2 WHERE product_id = 13;  -- Dầu ăn: 70 - 2 = 68
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 14;  -- Muối: 80 - 1 = 79
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 15;  -- Đường: 100 - 1 = 99
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 16;  -- Sữa rửa mặt: 50 - 1 = 49
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 17;  -- Dầu gội: 40 - 1 = 39
UPDATE inventory SET quantity = quantity - 2 WHERE product_id = 18;  -- Kem đánh răng: 70 - 2 = 68
-- Xà phòng chưa bán (order 11 pending)
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 20;  -- Nồi cơm: 20 - 1 = 19
UPDATE inventory SET quantity = quantity - 2 WHERE product_id = 21;  -- Chảo: 25 - 2 = 23
UPDATE inventory SET quantity = quantity - 1 - 1 WHERE product_id = 22; -- Bộ dao: 30 - 2 = 28 (1 paid, 1 pending)
UPDATE inventory SET quantity = quantity - 2 WHERE product_id = 23;  -- Thớt: 50 - 2 = 48
UPDATE inventory SET quantity = quantity - 5 WHERE product_id = 24;  -- Sữa tươi: 180 - 5 = 175
UPDATE inventory SET quantity = quantity - 4 WHERE product_id = 25;  -- Yaourt: 160 - 4 = 156

-- ============================================
-- AUDIT LOGS (Mẫu)
-- ============================================

INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, entity_name, new_values, changes_summary, ip_address) VALUES
(1, 'admin', 'LOGIN', 'Auth', NULL, NULL, '{"username":"admin","loginTime":"2025-10-01 08:00:00"}', 'Admin đăng nhập hệ thống', '192.168.1.100'),
(2, 'staff01', 'LOGIN', 'Auth', NULL, NULL, '{"username":"staff01","loginTime":"2025-10-01 08:15:00"}', 'Nhân viên staff01 đăng nhập', '192.168.1.101'),
(1, 'admin', 'CREATE', 'PurchaseOrder', 1, 'Đơn nhập từ Công ty Cổ phần Đồ uống Sài Gòn', '{"supplier_id":2,"total_amount":3025000,"status":"completed"}', 'Tạo đơn nhập hàng #1 trị giá 3,025,000 VNĐ', '192.168.1.100'),
(2, 'staff01', 'CREATE', 'Order', 1, 'Đơn hàng #1', '{"customer_id":1,"total_amount":152500,"discount_amount":15250}', 'Tạo đơn bán hàng #1 cho khách hàng Nguyễn Văn An', '192.168.1.101'),
(3, 'staff02', 'CREATE', 'Order', 2, 'Đơn hàng #2', '{"customer_id":2,"total_amount":84000}', 'Tạo đơn bán hàng #2 cho khách hàng Trần Thị Bình', '192.168.1.102'),
(3, 'staff02', 'UPDATE', 'Order', 8, 'Đơn hàng #8', '{"status":"canceled"}', 'Hủy đơn hàng #8', '192.168.1.102'),
(1, 'admin', 'CREATE', 'Product', 1, 'Coca Cola 330ml', '{"barcode":"8934588180019","price":12000,"cost_price":9000}', 'Thêm sản phẩm Coca Cola 330ml', '192.168.1.100'),
(2, 'staff01', 'UPDATE', 'Inventory', 1, 'Coca Cola 330ml - Kho Chính', '{"old_quantity":100,"new_quantity":95}', 'Giảm tồn kho Coca Cola từ 100 xuống 95', '192.168.1.101');

-- ============================================
-- VIEWS - Báo cáo thống kê
-- ============================================

-- View: Tồn kho hiện tại
CREATE OR REPLACE VIEW v_current_inventory AS
SELECT 
    i.inventory_id,
    i.product_id,
    p.product_name,
    p.barcode,
    c.category_name,
    s.name as supplier_name,
    i.quantity,
    p.cost_price,
    p.price,
    (i.quantity * p.cost_price) as inventory_value,
    p.unit,
    w.warehouse_name,
    p.status as product_status
FROM inventory i
JOIN products p ON i.product_id = p.product_id
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE p.status = 'active'
ORDER BY c.category_name, p.product_name;

-- View: Doanh thu theo ngày
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT 
    DATE(order_date) as order_day,
    COUNT(*) as total_orders,
    SUM(total_amount) as gross_revenue,
    SUM(discount_amount) as total_discounts,
    SUM(total_amount - discount_amount) as net_revenue
FROM orders
WHERE status = 'paid'
GROUP BY DATE(order_date)
ORDER BY order_day DESC;

-- View: Sản phẩm bán chạy
CREATE OR REPLACE VIEW v_best_selling_products AS
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    COUNT(oi.order_item_id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.subtotal) as total_revenue,
    p.price
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
LEFT JOIN categories c ON p.category_id = c.category_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'paid'
GROUP BY p.product_id, p.product_name, c.category_name, p.price
ORDER BY total_quantity_sold DESC;

-- ============================================
-- SUMMARY & VERIFICATION
-- ============================================

SELECT '========================================' as '';
SELECT 'DATABASE INITIALIZED SUCCESSFULLY!' as Status;
SELECT '========================================' as '';
SELECT '' as '';

-- Thống kê tổng quan
SELECT 'TỔNG QUAN HỆ THỐNG:' as '';
SELECT CONCAT('✓ Users: ', COUNT(*)) as Info FROM users WHERE status = 'active';
SELECT CONCAT('✓ Customers: ', COUNT(*)) as Info FROM customers WHERE status = 'active';
SELECT CONCAT('✓ Categories: ', COUNT(*)) as Info FROM categories WHERE status = 'active';
SELECT CONCAT('✓ Suppliers: ', COUNT(*)) as Info FROM suppliers WHERE status = 'active';
SELECT CONCAT('✓ Warehouses: ', COUNT(*), ' (KHO DUY NHẤT)') as Info FROM warehouses WHERE status = 'active';
SELECT CONCAT('✓ Products: ', COUNT(*)) as Info FROM products WHERE status = 'active';
SELECT CONCAT('✓ Promotions: ', COUNT(*)) as Info FROM promotions WHERE status = 'active';

SELECT '' as '';
SELECT 'KHO HÀNG & TỒN KHO:' as '';
SELECT CONCAT('✓ Purchase Orders: ', COUNT(*), ' đơn nhập') as Info FROM purchase_orders WHERE status = 'completed';
SELECT CONCAT('✓ Tổng giá trị nhập: ', FORMAT(SUM(total_amount), 0), ' VNĐ') as Info FROM purchase_orders WHERE status = 'completed';
SELECT CONCAT('✓ Inventory Records: ', COUNT(*), ' sản phẩm') as Info FROM inventory;
SELECT CONCAT('✓ Tổng số lượng tồn: ', FORMAT(SUM(quantity), 0), ' items') as Info FROM inventory;

SELECT '' as '';
SELECT 'BÁN HÀNG & THANH TOÁN:' as '';
SELECT CONCAT('✓ Orders Paid: ', COUNT(*), ' đơn') as Info FROM orders WHERE status = 'paid';
SELECT CONCAT('✓ Orders Pending: ', COUNT(*), ' đơn') as Info FROM orders WHERE status = 'pending';
SELECT CONCAT('✓ Orders Canceled: ', COUNT(*), ' đơn') as Info FROM orders WHERE status = 'canceled';
SELECT CONCAT('✓ Doanh thu (paid): ', FORMAT(SUM(total_amount - discount_amount), 0), ' VNĐ') as Info FROM orders WHERE status = 'paid';
SELECT CONCAT('✓ Payments: ', COUNT(*), ' giao dịch') as Info FROM payments WHERE status = 'completed';

SELECT '' as '';
SELECT 'THÔNG TIN ĐĂNG NHẬP:' as '';
SELECT '  👤 Username: admin' as '';
SELECT '  🔑 Password: 123456' as '';
SELECT '  📝 Role: Quản trị viên' as '';

SELECT '' as '';
SELECT '✅ Setup completed successfully!' as '';
SELECT '✅ Database sử dụng 1 KHO DUY NHẤT (Kho Chính)' as '';
SELECT '✅ Tất cả bảng đã có trường STATUS để xóa mềm' as '';
SELECT '✅ Dữ liệu phù hợp logic: Nhập trước → Tồn kho → Bán sau' as '';
SELECT '' as '';

-- ============================================
-- MIGRATIONS - Các cập nhật sau khi tạo DB
-- ============================================

-- Migration 1: Add apply_type to promotions (2025-10-15)
ALTER TABLE promotions
ADD COLUMN IF NOT EXISTS apply_type VARCHAR(20) NOT NULL DEFAULT 'order'
COMMENT 'Type of promotion: order (whole order), product (specific products), combo (product combo)';

-- Create promotion_products table
CREATE TABLE IF NOT EXISTS promotion_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promo_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_promotion_products_promo_id FOREIGN KEY (promo_id)
        REFERENCES promotions(promo_id) ON DELETE CASCADE,
    CONSTRAINT FK_promotion_products_product_id FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY UK_promo_product (promo_id, product_id),
    INDEX idx_promo_id (promo_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for apply_type
CREATE INDEX IF NOT EXISTS idx_apply_type ON promotions(apply_type);

SELECT '✅ Migrations applied successfully!' as '';
