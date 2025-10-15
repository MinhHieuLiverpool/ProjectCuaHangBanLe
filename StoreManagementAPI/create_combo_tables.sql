-- Create combo_promotions table
CREATE TABLE IF NOT EXISTS `combo_promotions` (
    `combo_id` INT NOT NULL AUTO_INCREMENT,
    `combo_name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `discount_type` VARCHAR(10) NOT NULL DEFAULT 'percentage',
    `discount_value` DECIMAL(10,2) NOT NULL,
    `start_date` DATETIME(6) NOT NULL,
    `end_date` DATETIME(6) NOT NULL,
    `usage_limit` INT NOT NULL DEFAULT 0,
    `used_count` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(10) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`combo_id`),
    KEY `IX_combo_promotions_combo_name` (`combo_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create combo_promotion_items table
CREATE TABLE IF NOT EXISTS `combo_promotion_items` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `combo_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    KEY `IX_combo_promotion_items_combo_id` (`combo_id`),
    KEY `IX_combo_promotion_items_product_id` (`product_id`),
    CONSTRAINT `FK_combo_promotion_items_combo_promotions_combo_id` FOREIGN KEY (`combo_id`) REFERENCES `combo_promotions` (`combo_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_combo_promotion_items_products_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
