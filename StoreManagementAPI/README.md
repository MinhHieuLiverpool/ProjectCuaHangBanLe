# Store Management API - Hệ Thống Quản Lý Cửa Hàng Bán Lẻ

## 📋 Mô Tả Dự Án

Đây là một hệ thống quản lý cửa hàng bán lẻ đầy đủ được xây dựng bằng **ASP.NET Core Web API 8.0** với các tính năng:

- ✅ **RESTful API** với kiến trúc chuẩn
- ✅ **JWT Authentication** bảo mật
- ✅ **Entity Framework Core** với MySQL Database
- ✅ **Repository Pattern & Dependency Injection**
- ✅ **Swagger/OpenAPI Documentation** tích hợp sẵn
- ✅ **CORS** hỗ trợ cho frontend

## 🏗️ Kiến Trúc Dự Án

```
StoreManagementAPI/
├── Controllers/        # API Controllers
├── Models/            # Entity Models
├── DTOs/              # Data Transfer Objects
├── Data/              # DbContext
├── Repositories/      # Repository Pattern
├── Services/          # Business Logic
├── Program.cs         # Application Entry Point
└── appsettings.json   # Configuration
```

## 📊 Database Schema

Hệ thống bao gồm 10 bảng:

1. **users** - Quản lý người dùng (admin/staff)
2. **customers** - Quản lý khách hàng
3. **categories** - Danh mục sản phẩm
4. **suppliers** - Nhà cung cấp
5. **products** - Sản phẩm
6. **inventory** - Tồn kho
7. **promotions** - Khuyến mãi
8. **orders** - Đơn hàng
9. **order_items** - Chi tiết đơn hàng
10. **payments** - Thanh toán

## 🚀 Cài Đặt và Chạy Dự Án

### Yêu Cầu

- **.NET 8.0 SDK** (đã cài)
- **MySQL Server** (XAMPP, MySQL Workbench, hoặc standalone)
- **Visual Studio Code** hoặc **Visual Studio 2022**

### Bước 1: Cấu Hình Database

1. Mở MySQL và chạy file SQL:

```bash
mysql -u root -p < store_management_full.sql
```

Hoặc import trong phpMyAdmin/MySQL Workbench

2. Cập nhật connection string trong `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=store_management;User=root;Password=your_password;"
}
```

### Bước 2: Restore Dependencies

```bash
cd StoreManagementAPI
dotnet restore
```

### Bước 3: Build Project

```bash
dotnet build
```

### Bước 4: Chạy Ứng Dụng

```bash
dotnet run
```

Hoặc:

```bash
dotnet watch run  # Auto-reload khi code thay đổi
```

### Bước 5: Truy Cập API

- **Swagger UI**: https://localhost:7xxx hoặc http://localhost:5xxx
- API sẽ tự động mở Swagger UI tại root URL

## 📚 API Endpoints

### 🔐 Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký user mới

### 👥 Customers

- `GET /api/customers` - Lấy danh sách khách hàng
- `GET /api/customers/{id}` - Lấy thông tin khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/{id}` - Cập nhật khách hàng
- `DELETE /api/customers/{id}` - Xóa khách hàng

### 📦 Products

- `GET /api/products` - Lấy danh sách sản phẩm (Public)
- `GET /api/products/{id}` - Lấy thông tin sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin only)
- `PUT /api/products/{id}` - Cập nhật sản phẩm (Admin only)
- `DELETE /api/products/{id}` - Xóa sản phẩm (Admin only)
- `PUT /api/products/stock` - Cập nhật tồn kho (Admin/Staff)

### 🏷️ Categories

- `GET /api/categories` - Lấy danh sách danh mục (Public)
- `GET /api/categories/{id}` - Lấy thông tin danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin only)
- `PUT /api/categories/{id}` - Cập nhật danh mục (Admin only)
- `DELETE /api/categories/{id}` - Xóa danh mục (Admin only)

### 🏢 Suppliers

- `GET /api/suppliers` - Lấy danh sách nhà cung cấp (Admin only)
- `GET /api/suppliers/{id}` - Lấy thông tin nhà cung cấp
- `POST /api/suppliers` - Tạo nhà cung cấp mới
- `PUT /api/suppliers/{id}` - Cập nhật nhà cung cấp
- `DELETE /api/suppliers/{id}` - Xóa nhà cung cấp

### 🎁 Promotions

- `GET /api/promotions` - Lấy danh sách khuyến mãi (Public)
- `GET /api/promotions/active` - Lấy khuyến mãi đang hoạt động (Public)
- `GET /api/promotions/{id}` - Lấy thông tin khuyến mãi
- `GET /api/promotions/code/{code}` - Lấy khuyến mãi theo mã
- `POST /api/promotions` - Tạo khuyến mãi mới (Admin only)
- `PUT /api/promotions/{id}` - Cập nhật khuyến mãi (Admin only)
- `DELETE /api/promotions/{id}` - Xóa khuyến mãi (Admin only)

### 🛒 Orders

- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/{id}` - Lấy thông tin đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/{id}/status` - Cập nhật trạng thái đơn hàng
- `POST /api/orders/payment` - Xử lý thanh toán

## 🔑 Authentication Flow

### 1. Login Request

```json
POST /api/auth/login
{
  "username": "admin",
  "password": "123456"
}
```

### 2. Login Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "fullName": "Quản trị viên",
  "role": "admin"
}
```

### 3. Sử Dụng Token

Thêm header vào mọi request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Ví Dụ Sử Dụng API

### Tạo Đơn Hàng Mới

```json
POST /api/orders
Authorization: Bearer {token}
{
  "customerId": 1,
  "userId": 1,
  "promoCode": "SALE10",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ]
}
```

### Tạo Sản Phẩm Mới

```json
POST /api/products
Authorization: Bearer {token}
{
  "categoryId": 1,
  "supplierId": 1,
  "productName": "Coca Cola 330ml",
  "barcode": "8900000000051",
  "price": 12000,
  "unit": "lon",
  "initialStock": 100
}
```

### Cập Nhật Tồn Kho

```json
PUT /api/products/stock
Authorization: Bearer {token}
{
  "productId": 1,
  "quantity": 150
}
```

## 👤 Tài Khoản Mặc Định

Từ file SQL:

- **Username**: `admin`
- **Password**: `123456`
- **Role**: admin

- **Username**: `staff01`
- **Password**: `123456`
- **Role**: staff

## 🛡️ Bảo Mật

- ✅ JWT Token với thời gian hết hạn 24 giờ
- ✅ Role-based Authorization (admin, staff)
- ✅ Protected endpoints với `[Authorize]` attribute
- ⚠️ **Lưu ý**: Trong production, nên hash password bằng BCrypt hoặc Identity

## 🔧 Công Nghệ Sử Dụng

- **ASP.NET Core 8.0** - Web API Framework
- **Entity Framework Core 8.0** - ORM
- **Pomelo.EntityFrameworkCore.MySql** - MySQL Provider
- **JWT Bearer Authentication** - Security
- **Swagger/OpenAPI** - API Documentation
- **Repository Pattern** - Design Pattern

## 📖 Tài Liệu Thêm

- Swagger UI sẽ hiển thị tất cả endpoints với chi tiết
- Có thể test API trực tiếp trong Swagger UI
- Support cho CORS để kết nối với frontend

## 🐛 Troubleshooting

### Lỗi kết nối MySQL

```
Unable to connect to any of the specified MySQL hosts
```

**Giải pháp**: Kiểm tra MySQL đang chạy và cập nhật connection string

### Lỗi JWT

```
IDX10223: Lifetime validation failed...
```

**Giải pháp**: Token đã hết hạn, login lại để lấy token mới

## 📧 Liên Hệ

Nếu có câu hỏi hoặc vấn đề, hãy tạo issue trong repository.

---

**Developed with ❤️ using ASP.NET Core 8.0**
