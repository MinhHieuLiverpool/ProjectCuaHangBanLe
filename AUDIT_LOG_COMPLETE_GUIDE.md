# Audit Log System - Complete Guide

## Tổng quan

Hệ thống audit log đã được tích hợp hoàn chỉnh vào các module chính của ứng dụng để theo dõi tất cả các hành động quan trọng.

## Các module đã tích hợp Audit Log

### 1. **ProductService** (Quản lý sản phẩm)

✅ **CREATE** - Tạo sản phẩm mới

- Ghi nhận: Tất cả thông tin sản phẩm (tên, barcode, giá, nhà cung cấp, danh mục)
- Summary: "Tạo sản phẩm mới: [Tên] (Barcode: [Mã], Giá: [Giá] VNĐ)"

✅ **UPDATE** - Cập nhật sản phẩm

- Ghi nhận: So sánh OLD vs NEW values, liệt kê từng thay đổi
- Summary: "Cập nhật sản phẩm '[Tên]': Giá bán: 50,000 → 60,000 VNĐ, Tên: 'A' → 'B'"

✅ **DELETE** - Xóa sản phẩm vĩnh viễn

- Ghi nhận: Toàn bộ thông tin sản phẩm trước khi xóa
- Summary: "Xóa vĩnh viễn sản phẩm '[Tên]' (Barcode: [Mã])"

✅ **SOFT_DELETE** - Ẩn sản phẩm (đã có đơn hàng)

- Ghi nhận: Thay đổi trạng thái active → inactive
- Summary: "Ẩn sản phẩm '[Tên]' (đã có đơn hàng, không thể xóa hẳn)"

### 2. **OrderService** (Quản lý đơn hàng)

✅ **CREATE** - Tạo đơn hàng mới

- Ghi nhận:
  - Thông tin đơn: OrderId, CustomerId, TotalAmount, DiscountAmount, Status
  - Danh sách sản phẩm: ProductId, Quantity, Price, Subtotal cho từng item
  - ItemCount, HasPromotion
- Summary: "Tạo đơn hàng DH000001 - Khách hàng ID 5 - Tổng tiền: 500,000 VNĐ - 3 sản phẩm"

✅ **UPDATE** - Cập nhật trạng thái đơn hàng

- Ghi nhận: Thay đổi trạng thái (pending → processing → completed/cancelled)
- Summary: "Cập nhật trạng thái đơn hàng DH000001: pending → completed"

✅ **PAYMENT** - Thanh toán đơn hàng

- Ghi nhận:
  - Số tiền thanh toán, phương thức thanh toán
  - Thay đổi trạng thái → paid
- Summary: "Thanh toán đơn hàng DH000001 - Số tiền: 500,000 VNĐ - Phương thức: cash"
- Additional Info: PaymentMethod, Amount

### 3. **PurchaseOrderService** (Quản lý nhập hàng)

✅ **CREATE** - Tạo phiếu nhập hàng

- Ghi nhận:
  - Thông tin phiếu: PurchaseId, SupplierId, WarehouseId, TotalAmount, Status
  - Danh sách sản phẩm nhập: ProductId, Quantity, CostPrice, Subtotal
  - ItemCount, WarehouseId, AutoCompleted (tự động hoàn thành)
- Summary: "Tạo phiếu nhập hàng PN000001 - Nhà cung cấp ID 2 - Tổng tiền: 10,000,000 VNĐ - 15 sản phẩm"

✅ **UPDATE** - Cập nhật trạng thái phiếu nhập

- Ghi nhận:
  - Thay đổi trạng thái (pending → completed/cancelled)
  - Nếu completed: Cập nhật tồn kho vào warehouse
- Summary: "Cập nhật trạng thái phiếu nhập hàng PN000001: pending → completed"
- Additional Info (nếu completed): InventoryUpdated: true, ItemCount

✅ **DELETE** - Xóa phiếu nhập hàng

- Ghi nhận: Toàn bộ thông tin phiếu nhập trước khi xóa
- Summary: "Xóa phiếu nhập hàng PN000001 - Tổng tiền: 10,000,000 VNĐ"
- Lưu ý: Chỉ xóa được phiếu chưa hoàn thành

## Thông tin được ghi nhận

### Thông tin cơ bản (mọi log)

- **userId**: ID người thực hiện (mặc định = 1 cho admin)
- **username**: Tên người thực hiện (mặc định = "admin")
- **action**: Loại hành động (CREATE, UPDATE, DELETE, SOFT_DELETE, PAYMENT)
- **entityType**: Loại đối tượng (Product, Order, PurchaseOrder)
- **entityId**: ID của đối tượng
- **entityName**: Tên hiển thị (tên sản phẩm, mã đơn hàng DH000001, PN000001)
- **createdAt**: Thời gian thực hiện

### Dữ liệu chi tiết

- **oldValues**: Giá trị CŨ (JSON) - null nếu là CREATE
- **newValues**: Giá trị MỚI (JSON) - null nếu là DELETE
- **changesSummary**: Tóm tắt ngắn gọn bằng tiếng Việt, dễ đọc
- **additionalInfo**: Thông tin bổ sung (JSON) - tùy chọn

## Transaction Handling

✅ **Tất cả operations đều được wrap trong transaction**

- Nếu có lỗi → Rollback toàn bộ (bao gồm audit log)
- Chỉ commit khi MỌI THỨ thành công
- Đảm bảo data integrity: Product + Inventory + Audit Log luôn đồng bộ

## API Endpoints

### Lấy danh sách audit logs (có filter)

```
GET /api/auditlogs?page=1&pageSize=50&action=CREATE&entityType=Product&username=admin&fromDate=2025-01-01&toDate=2025-12-31
```

### Lấy chi tiết 1 audit log

```
GET /api/auditlogs/{id}
```

### Lấy logs theo entity

```
GET /api/auditlogs/entity/{entityType}/{entityId}
Example: GET /api/auditlogs/entity/Product/123
```

### Lấy logs theo user

```
GET /api/auditlogs/user/{userId}
```

### Lấy tổng quan (summary)

```
GET /api/auditlogs/summary?fromDate=2025-01-01&toDate=2025-12-31
```

## Frontend Integration

### Route

```
/audit-logs (Admin only)
```

### Features

- ✅ Bảng hiển thị với các cột: ID, Thời gian, Hành động, Đối tượng, Tên đối tượng, Người thực hiện, Mô tả
- ✅ Filter theo: Action, Entity Type, Username, Date Range
- ✅ Modal chi tiết: Hiển thị OLD/NEW values dạng JSON formatted
- ✅ Pagination: 50 items/page
- ✅ Ant Design components: Table, Tag, Button, Modal, Form, DatePicker

### Action Colors

- CREATE: green
- UPDATE: blue
- DELETE: red
- SOFT_DELETE: orange
- PAYMENT: cyan

## Database Schema

```sql
Table: audit_logs
Columns:
  - audit_id (INT, PK, AUTO_INCREMENT)
  - user_id (INT, FK → users, INDEX)
  - username (VARCHAR(50), INDEX)
  - action (VARCHAR(50), NOT NULL, INDEX)
  - entity_type (VARCHAR(50), NOT NULL, INDEX)
  - entity_id (INT, INDEX)
  - entity_name (VARCHAR(255))
  - old_values (TEXT) -- JSON
  - new_values (TEXT) -- JSON
  - changes_summary (TEXT)
  - created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP, INDEX)
  - additional_info (TEXT) -- JSON

Indexes: 7 indexes for fast queries
```

## Ví dụ Audit Log

### Example 1: Tạo sản phẩm

```json
{
  "auditId": 1,
  "userId": 1,
  "username": "admin",
  "action": "CREATE",
  "entityType": "Product",
  "entityId": 38,
  "entityName": "Coca Cola 330ml",
  "oldValues": null,
  "newValues": {
    "ProductId": 38,
    "ProductName": "Coca Cola 330ml",
    "Barcode": "8934588180019",
    "Price": 12000,
    "CostPrice": 9000,
    "CategoryId": 1,
    "SupplierId": 2,
    "Unit": "lon"
  },
  "changesSummary": "Tạo sản phẩm mới: Coca Cola 330ml (Barcode: 8934588180019, Giá: 12,000 VNĐ)",
  "createdAt": "2025-10-12T19:53:37"
}
```

### Example 2: Cập nhật sản phẩm

```json
{
  "auditId": 2,
  "userId": 1,
  "username": "admin",
  "action": "UPDATE",
  "entityType": "Product",
  "entityId": 38,
  "entityName": "Coca Cola 330ml",
  "oldValues": {
    "Price": 12000,
    "Status": "active"
  },
  "newValues": {
    "Price": 13000,
    "Status": "active"
  },
  "changesSummary": "Cập nhật sản phẩm 'Coca Cola 330ml': Giá bán: 12,000 → 13,000 VNĐ",
  "createdAt": "2025-10-12T20:15:22"
}
```

### Example 3: Tạo đơn hàng

```json
{
  "auditId": 5,
  "userId": 1,
  "username": "admin",
  "action": "CREATE",
  "entityType": "Order",
  "entityId": 101,
  "entityName": "DH000101",
  "oldValues": null,
  "newValues": {
    "OrderId": 101,
    "CustomerId": 5,
    "TotalAmount": 500000,
    "DiscountAmount": 50000,
    "Status": "pending",
    "ItemCount": 3,
    "Items": [
      { "ProductId": 1, "Quantity": 10, "Price": 12000, "Subtotal": 120000 },
      { "ProductId": 5, "Quantity": 20, "Price": 5000, "Subtotal": 100000 }
    ]
  },
  "changesSummary": "Tạo đơn hàng DH000101 - Khách hàng ID 5 - Tổng tiền: 500,000 VNĐ - 3 sản phẩm",
  "additionalInfo": {
    "ItemCount": 3,
    "HasPromotion": true
  },
  "createdAt": "2025-10-12T21:30:15"
}
```

## Best Practices

1. ✅ **Luôn gọi audit log SAU KHI operation thành công**
2. ✅ **Wrap trong transaction** để đảm bảo consistency
3. ✅ **Ghi đủ thông tin** trong newValues/oldValues để có thể audit chi tiết
4. ✅ **Summary ngắn gọn, dễ hiểu** bằng tiếng Việt
5. ✅ **Sử dụng format chuẩn** cho entity name (DH000001, PN000001)
6. ✅ **Additional info** cho các trường hợp đặc biệt

## Lưu ý

- ⚠️ Không ghi nhận IP Address và User Agent nữa (đã xóa khỏi database)
- ⚠️ userId mặc định = 1 (admin) khi không có authentication
- ⚠️ Transaction sẽ rollback TẤT CẢ nếu audit log fail
- ✅ Tất cả audit logs có thể xem trên giao diện /audit-logs
