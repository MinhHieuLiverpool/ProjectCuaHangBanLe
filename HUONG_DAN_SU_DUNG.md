# 📚 HƯỚNG DẪN SỬ DỤNG - HỆ THỐNG QUẢN LÝ CỬA HÀNG BÁN LẺ

## 🚀 KHỞI ĐỘNG NHANH

### 1. Khởi động MySQL

```bash
.\START_MYSQL.bat
```

### 2. Khởi động Backend API

```bash
.\START_API.bat
```

hoặc

```bash
cd StoreManagementAPI
dotnet run
```

### 3. Khởi động Frontend

```bash
cd store-management-frontend
pnpm install    # Lần đầu tiên
pnpm run dev
```

### 4. Truy cập ứng dụng

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5122
- **Swagger UI:** http://localhost:5122/swagger

---

## 🔑 THÔNG TIN ĐĂNG NHẬP

### Tài khoản mặc định:

- **Admin:**
  - Username: `admin`
  - Password: `123456`
- **Nhân viên 1:**
  - Username: `staff01`
  - Password: `123456`
- **Nhân viên 2:**
  - Username: `staff02`
  - Password: `123456`

---

## 🗄️ CẤU HÌNH DATABASE

### Thông tin kết nối MySQL:

- **Server:** localhost
- **Port:** 3306
- **Database:** store_management
- **User:** root
- **Password:** (để trống)

### Import database:

```bash
# Sử dụng MySQL Workbench hoặc command line
mysql -u root < store_management_full.sql
```

---

## 🛠️ XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: Backend không kết nối được database

**Nguyên nhân:** MySQL chưa chạy hoặc sai thông tin kết nối

**Giải pháp:**

1. Chạy `.\START_MYSQL.bat` để khởi động MySQL
2. Kiểm tra file `StoreManagementAPI/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=store_management;User=root;Password=;"
}
```

### Lỗi: Port 5122 đã được sử dụng

**Giải pháp:**

```powershell
# Tìm và tắt process đang dùng port
netstat -ano | findstr :5122
taskkill /PID <PID_NUMBER> /F
```

### Lỗi: Frontend không load được

**Giải pháp:**

1. Xóa cache và cài lại:

```bash
cd store-management-frontend
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm run dev
```

### Lỗi: "Cannot read properties of undefined"

**Nguyên nhân:** API chưa chạy hoặc dữ liệu không đúng format

**Giải pháp:**

1. Kiểm tra Backend đang chạy: http://localhost:5122/swagger
2. Kiểm tra dữ liệu trong database
3. Refresh lại trang (F5)

---

## 📦 CẤU TRÚC DỰ ÁN

```
project_cuahangbanle/
├── StoreManagementAPI/          # Backend .NET API
│   ├── Controllers/              # API Controllers
│   ├── Models/                   # Database Models
│   ├── Services/                 # Business Logic
│   ├── Data/                     # Database Context
│   └── appsettings.json         # Cấu hình
│
├── store-management-frontend/    # Frontend React
│   ├── src/
│   │   ├── pages/               # Các trang chính
│   │   ├── components/          # Components dùng chung
│   │   ├── services/            # API Services
│   │   └── types/               # TypeScript Types
│   └── package.json
│
├── store_management_full.sql     # Database Script
├── START_MYSQL.bat              # Khởi động MySQL
├── START_API.bat                # Khởi động Backend
└── HUONG_DAN_SU_DUNG.md        # File này
```

---

## 🧪 TEST API

### Test Login:

```powershell
$body = @{ username = 'admin'; password = '123456' } | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5122/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
```

### Test Get Products:

```powershell
Invoke-WebRequest -Uri 'http://localhost:5122/api/products' -Method GET
```

---

## 📊 CHỨC NĂNG HỆ THỐNG

### 1. Quản lý sản phẩm

- Thêm/Sửa/Xóa sản phẩm
- Quản lý tồn kho
- Phân loại theo danh mục
- Quản lý nhà cung cấp

### 2. Quản lý khách hàng

- Thông tin khách hàng
- Lịch sử mua hàng
- Thống kê doanh thu theo khách

### 3. Quản lý đơn hàng

- Tạo đơn hàng mới
- Theo dõi trạng thái
- In hóa đơn
- Áp dụng khuyến mãi

### 4. Quản lý khuyến mãi

- Tạo mã giảm giá
- Giảm theo % hoặc số tiền cố định
- Điều kiện áp dụng
- Giới hạn số lần sử dụng

### 5. Báo cáo thống kê

- Doanh thu theo ngày/tháng
- Sản phẩm bán chạy
- Tồn kho cảnh báo
- Lợi nhuận

---

## 🔧 YÊU CẦU HỆ THỐNG

### Backend (.NET):

- .NET 8.0 SDK
- MySQL Server 8.0+

### Frontend (React):

- Node.js 18+
- pnpm (hoặc npm)

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:

1. Kiểm tra lại các bước khởi động
2. Xem log trong terminal/console
3. Kiểm tra kết nối MySQL
4. Đảm bảo các port (3000, 5122, 3306) không bị chiếm dụng

---

**Phiên bản:** 1.0.0  
**Cập nhật:** 06/10/2025
