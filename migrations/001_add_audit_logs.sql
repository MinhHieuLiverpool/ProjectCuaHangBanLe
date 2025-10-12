-- Migration: Add Audit Logs Table
-- Description: Tạo bảng audit_logs để theo dõi toàn bộ hoạt động trong hệ thống
-- Created: 2025-01-13

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `audit_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NULL,
    `username` VARCHAR(50) NULL,
    `action` VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, etc.',
    `entity_type` VARCHAR(50) NOT NULL COMMENT 'Product, Order, PurchaseOrder, Inventory, etc.',
    `entity_id` INT NULL COMMENT 'ID của đối tượng bị thao tác',
    `entity_name` VARCHAR(255) NULL COMMENT 'Tên của đối tượng',
    `old_values` TEXT NULL COMMENT 'Giá trị cũ (JSON)',
    `new_values` TEXT NULL COMMENT 'Giá trị mới (JSON)',
    `changes_summary` TEXT NULL COMMENT 'Tóm tắt thay đổi dễ đọc',
    `ip_address` VARCHAR(45) NULL COMMENT 'Địa chỉ IP của người thực hiện',
    `user_agent` VARCHAR(500) NULL COMMENT 'Thông tin trình duyệt/ứng dụng',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian thực hiện',
    `additional_info` TEXT NULL COMMENT 'Thông tin bổ sung (JSON)',
    
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_username` (`username`),
    INDEX `idx_action` (`action`),
    INDEX `idx_entity_type` (`entity_type`),
    INDEX `idx_entity_id` (`entity_id`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_entity_type_id` (`entity_type`, `entity_id`),
    
    CONSTRAINT `fk_audit_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`user_id`) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng ghi log toàn bộ hoạt động trong hệ thống';

-- Insert sample comment for documentation
-- Các action types phổ biến:
-- - CREATE: Tạo mới
-- - UPDATE: Cập nhật
-- - DELETE: Xóa vĩnh viễn
-- - SOFT_DELETE: Ẩn/Vô hiệu hóa
-- - VIEW: Xem (cho các thông tin nhạy cảm)
-- - LOGIN: Đăng nhập
-- - LOGOUT: Đăng xuất
-- - EXPORT: Xuất dữ liệu
-- - IMPORT: Nhập dữ liệu
-- - APPROVE: Duyệt
-- - REJECT: Từ chối
-- - CANCEL: Hủy bỏ

-- Các entity_type phổ biến:
-- - Product: Sản phẩm
-- - Category: Danh mục
-- - Supplier: Nhà cung cấp
-- - Customer: Khách hàng
-- - Order: Đơn hàng
-- - OrderItem: Chi tiết đơn hàng
-- - PurchaseOrder: Phiếu nhập hàng
-- - PurchaseItem: Chi tiết phiếu nhập
-- - Inventory: Tồn kho
-- - Warehouse: Kho hàng
-- - Promotion: Khuyến mãi
-- - Payment: Thanh toán
-- - User: Người dùng
-- - Auth: Xác thực

SELECT 'Audit Logs table created successfully!' AS Result;
