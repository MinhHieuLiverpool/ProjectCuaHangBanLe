-- ===================================================================
-- Script: Chuyển đổi hệ thống sang 1 kho duy nhất
-- Mục đích: Gán tất cả sản phẩm vào kho mặc định (warehouse_id = 1)
-- ===================================================================

USE store_management;

-- Bước 1: Kiểm tra kho mặc định tồn tại
SELECT * FROM warehouses WHERE warehouse_id = 1;

-- Bước 2: Nếu kho mặc định chưa có, tạo mới
INSERT IGNORE INTO warehouses (warehouse_id, warehouse_name, address, status)
VALUES (1, 'Kho Chính', 'Địa chỉ kho chính', 'active');

-- Bước 3: Gộp tất cả tồn kho của cùng 1 sản phẩm từ nhiều kho thành 1 kho
-- Tạo bảng tạm để lưu tổng tồn kho theo sản phẩm
CREATE TEMPORARY TABLE temp_total_inventory AS
SELECT 
    product_id,
    SUM(quantity) as total_quantity
FROM inventory
GROUP BY product_id;

-- Bước 4: Xóa tất cả dữ liệu tồn kho hiện tại
DELETE FROM inventory;

-- Bước 5: Thêm lại tồn kho với warehouse_id = 1
INSERT INTO inventory (product_id, warehouse_id, quantity)
SELECT 
    product_id,
    1 as warehouse_id,
    total_quantity
FROM temp_total_inventory;

-- Bước 6: Xóa bảng tạm
DROP TEMPORARY TABLE temp_total_inventory;

-- Bước 7: Cập nhật tất cả purchase_orders sang warehouse_id = 1
UPDATE purchase_orders 
SET warehouse_id = 1;

-- Bước 8: Đánh dấu các kho khác là không hoạt động (nếu muốn giữ lại dữ liệu)
UPDATE warehouses 
SET status = 'inactive' 
WHERE warehouse_id != 1;

-- Hoặc xóa hẳn các kho khác (cẩn thận!)
-- DELETE FROM warehouses WHERE warehouse_id != 1;

-- Bước 9: Kiểm tra kết quả
SELECT 
    'Warehouses' as table_name,
    COUNT(*) as total_records
FROM warehouses
WHERE status = 'active'
UNION ALL
SELECT 
    'Inventory',
    COUNT(*)
FROM inventory
UNION ALL
SELECT 
    'Products with inventory',
    COUNT(DISTINCT product_id)
FROM inventory;

-- Hiển thị tồn kho theo sản phẩm
SELECT 
    i.inventory_id,
    i.product_id,
    p.product_name,
    c.category_name,
    i.quantity,
    w.warehouse_name
FROM inventory i
JOIN products p ON i.product_id = p.product_id
LEFT JOIN categories c ON p.category_id = c.category_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
ORDER BY p.product_name;

-- ===================================================================
-- HOÀN TẤT!
-- ===================================================================
