# Hướng Dẫn Cấu Hình Database Connection

## 🔧 Setup cho Development

### Cách 1: Sử dụng appsettings.Local.json (Khuyến nghị)

1. Copy file `appsettings.Local.json.example` thành `appsettings.Local.json`:

   ```bash
   copy StoreManagementAPI\appsettings.Local.json.example StoreManagementAPI\appsettings.Local.json
   ```

2. Mở file `appsettings.Local.json` và thay đổi password:

   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Port=3306;Database=store_management;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"
     }
   }
   ```

3. File `appsettings.Local.json` sẽ **KHÔNG** được commit lên Git (đã được thêm vào .gitignore)

### Cách 2: Sử dụng Environment Variables

Đặt biến môi trường:

```bash
# Windows PowerShell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Port=3306;Database=store_management;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"

# Windows CMD
set ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=store_management;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;
```

## 📝 Thứ tự ưu tiên load configuration:

1. `appsettings.json` (base config)
2. `appsettings.Development.json` hoặc `appsettings.Production.json` (theo môi trường)
3. `appsettings.Local.json` (config cá nhân - **overrides tất cả**)
4. Environment Variables (highest priority)

## ⚠️ Lưu ý:

- **KHÔNG BAO GIỜ** commit file chứa password thật lên Git
- Chỉ commit file `.example` với placeholder password
- Mỗi developer tự tạo file `appsettings.Local.json` của riêng mình
- File `appsettings.Local.json` đã được thêm vào `.gitignore`

## 🚀 Quick Start:

```bash
# 1. Clone repository
git clone <repo-url>

# 2. Copy và config database
copy StoreManagementAPI\appsettings.Local.json.example StoreManagementAPI\appsettings.Local.json
# Sửa password trong appsettings.Local.json

# 3. Run migration
cd StoreManagementAPI
dotnet ef database update

# 4. Run API
dotnet run
```
