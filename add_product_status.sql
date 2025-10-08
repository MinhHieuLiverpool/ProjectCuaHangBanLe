-- ============================================
-- Migration: Add status column to products table
-- Date: 2025-10-08
-- Description: Thêm cột trạng thái cho sản phẩm
-- ============================================

-- Bước 1: Thêm cột status vào bảng products
ALTER TABLE products
ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL
COMMENT 'Trạng thái sản phẩm: active (đang bán), inactive (ngừng bán)';

-- Bước 2: Set tất cả sản phẩm hiện tại là 'active'
UPDATE products
SET status = 'active'
WHERE status IS NULL OR status = '';

-- bệnh viện trả về
SELECT product_id, product_name, status, price
FROM products
LIMIT 10;

-- thông báo đốm
SELECT 'Migration completed successfully! Column status added to products table.' AS message;
