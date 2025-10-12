CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `categories` (
    `category_id` int NOT NULL AUTO_INCREMENT,
    `category_name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_categories` PRIMARY KEY (`category_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `customers` (
    `customer_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `phone` varchar(20) CHARACTER SET utf8mb4 NULL,
    `email` varchar(100) CHARACTER SET utf8mb4 NULL,
    `address` longtext CHARACTER SET utf8mb4 NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `created_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_customers` PRIMARY KEY (`customer_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `promotions` (
    `promo_id` int NOT NULL AUTO_INCREMENT,
    `promo_code` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `description` varchar(255) CHARACTER SET utf8mb4 NULL,
    `discount_type` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `discount_value` decimal(10,2) NOT NULL,
    `start_date` datetime(6) NOT NULL,
    `end_date` datetime(6) NOT NULL,
    `min_order_amount` decimal(10,2) NOT NULL,
    `usage_limit` int NOT NULL,
    `used_count` int NOT NULL,
    `status` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_promotions` PRIMARY KEY (`promo_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `suppliers` (
    `supplier_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `phone` varchar(20) CHARACTER SET utf8mb4 NULL,
    `email` varchar(100) CHARACTER SET utf8mb4 NULL,
    `address` longtext CHARACTER SET utf8mb4 NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_suppliers` PRIMARY KEY (`supplier_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `users` (
    `user_id` int NOT NULL AUTO_INCREMENT,
    `username` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `password` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `full_name` varchar(100) CHARACTER SET utf8mb4 NULL,
    `role` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `created_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_users` PRIMARY KEY (`user_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `warehouses` (
    `warehouse_id` int NOT NULL AUTO_INCREMENT,
    `warehouse_name` varchar(100) CHARACTER SET utf8mb4 NULL,
    `address` longtext CHARACTER SET utf8mb4 NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_warehouses` PRIMARY KEY (`warehouse_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `products` (
    `product_id` int NOT NULL AUTO_INCREMENT,
    `category_id` int NULL,
    `supplier_id` int NULL,
    `product_name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `barcode` varchar(50) CHARACTER SET utf8mb4 NULL,
    `price` decimal(10,2) NOT NULL,
    `cost_price` decimal(10,2) NOT NULL,
    `unit` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `created_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_products` PRIMARY KEY (`product_id`),
    CONSTRAINT `FK_products_categories_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
    CONSTRAINT `FK_products_suppliers_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `audit_logs` (
    `audit_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NULL,
    `username` varchar(50) CHARACTER SET utf8mb4 NULL,
    `action` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `entity_type` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `entity_id` int NULL,
    `entity_name` varchar(255) CHARACTER SET utf8mb4 NULL,
    `old_values` text CHARACTER SET utf8mb4 NULL,
    `new_values` text CHARACTER SET utf8mb4 NULL,
    `changes_summary` text CHARACTER SET utf8mb4 NULL,
    `created_at` datetime(6) NOT NULL,
    `additional_info` text CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_audit_logs` PRIMARY KEY (`audit_id`),
    CONSTRAINT `FK_audit_logs_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `orders` (
    `order_id` int NOT NULL AUTO_INCREMENT,
    `customer_id` int NULL,
    `user_id` int NULL,
    `promo_id` int NULL,
    `order_date` datetime(6) NOT NULL,
    `status` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `total_amount` decimal(10,2) NOT NULL,
    `discount_amount` decimal(10,2) NOT NULL,
    CONSTRAINT `PK_orders` PRIMARY KEY (`order_id`),
    CONSTRAINT `FK_orders_customers_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
    CONSTRAINT `FK_orders_promotions_promo_id` FOREIGN KEY (`promo_id`) REFERENCES `promotions` (`promo_id`) ON DELETE SET NULL,
    CONSTRAINT `FK_orders_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `purchase_orders` (
    `purchase_id` int NOT NULL AUTO_INCREMENT,
    `supplier_id` int NOT NULL,
    `user_id` int NOT NULL,
    `warehouse_id` int NULL,
    `purchase_date` datetime(6) NOT NULL,
    `total_amount` decimal(10,2) NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_purchase_orders` PRIMARY KEY (`purchase_id`),
    CONSTRAINT `FK_purchase_orders_suppliers_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_purchase_orders_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_purchase_orders_warehouses_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `inventory` (
    `inventory_id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `warehouse_id` int NULL,
    `quantity` int NOT NULL,
    `updated_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_inventory` PRIMARY KEY (`inventory_id`),
    CONSTRAINT `FK_inventory_products_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_inventory_warehouses_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `order_items` (
    `order_item_id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NULL,
    `product_id` int NULL,
    `quantity` int NOT NULL,
    `price` decimal(10,2) NOT NULL,
    `subtotal` decimal(10,2) NOT NULL,
    CONSTRAINT `PK_order_items` PRIMARY KEY (`order_item_id`),
    CONSTRAINT `FK_order_items_orders_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_order_items_products_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `payments` (
    `payment_id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `payment_method` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `payment_date` datetime(6) NOT NULL,
    CONSTRAINT `PK_payments` PRIMARY KEY (`payment_id`),
    CONSTRAINT `FK_payments_orders_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `purchase_items` (
    `purchase_item_id` int NOT NULL AUTO_INCREMENT,
    `purchase_id` int NOT NULL,
    `product_id` int NOT NULL,
    `quantity` int NOT NULL,
    `cost_price` decimal(10,2) NOT NULL,
    `subtotal` decimal(10,2) NOT NULL,
    CONSTRAINT `PK_purchase_items` PRIMARY KEY (`purchase_item_id`),
    CONSTRAINT `FK_purchase_items_products_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_purchase_items_purchase_orders_purchase_id` FOREIGN KEY (`purchase_id`) REFERENCES `purchase_orders` (`purchase_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_audit_logs_action` ON `audit_logs` (`action`);

CREATE INDEX `IX_audit_logs_created_at` ON `audit_logs` (`created_at`);

CREATE INDEX `IX_audit_logs_entity_id` ON `audit_logs` (`entity_id`);

CREATE INDEX `IX_audit_logs_entity_type` ON `audit_logs` (`entity_type`);

CREATE INDEX `IX_audit_logs_user_id` ON `audit_logs` (`user_id`);

CREATE INDEX `IX_inventory_product_id` ON `inventory` (`product_id`);

CREATE INDEX `IX_inventory_warehouse_id` ON `inventory` (`warehouse_id`);

CREATE INDEX `IX_order_items_order_id` ON `order_items` (`order_id`);

CREATE INDEX `IX_order_items_product_id` ON `order_items` (`product_id`);

CREATE INDEX `IX_orders_customer_id` ON `orders` (`customer_id`);

CREATE INDEX `IX_orders_promo_id` ON `orders` (`promo_id`);

CREATE INDEX `IX_orders_user_id` ON `orders` (`user_id`);

CREATE INDEX `IX_payments_order_id` ON `payments` (`order_id`);

CREATE UNIQUE INDEX `IX_products_barcode` ON `products` (`barcode`);

CREATE INDEX `IX_products_category_id` ON `products` (`category_id`);

CREATE INDEX `IX_products_supplier_id` ON `products` (`supplier_id`);

CREATE UNIQUE INDEX `IX_promotions_promo_code` ON `promotions` (`promo_code`);

CREATE INDEX `IX_purchase_items_product_id` ON `purchase_items` (`product_id`);

CREATE INDEX `IX_purchase_items_purchase_id` ON `purchase_items` (`purchase_id`);

CREATE INDEX `IX_purchase_orders_supplier_id` ON `purchase_orders` (`supplier_id`);

CREATE INDEX `IX_purchase_orders_user_id` ON `purchase_orders` (`user_id`);

CREATE INDEX `IX_purchase_orders_warehouse_id` ON `purchase_orders` (`warehouse_id`);

CREATE UNIQUE INDEX `IX_users_username` ON `users` (`username`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251012200239_InitialCreate', '8.0.11');

COMMIT;

