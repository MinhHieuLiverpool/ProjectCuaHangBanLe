-- Migration: Add apply_type to promotions table and create promotion_products table
-- Date: 2025-10-15

-- 1. Add apply_type column to promotions table
ALTER TABLE promotions
ADD COLUMN apply_type VARCHAR(20) NOT NULL DEFAULT 'order'
COMMENT 'Type of promotion: order (whole order), product (specific products), combo (product combo)';

-- 2. Create promotion_products table for product-specific and combo promotions
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

-- 3. Add index for apply_type for better query performance
CREATE INDEX idx_apply_type ON promotions(apply_type);
