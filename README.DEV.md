# 🔧 DEVELOPER DOCUMENTATION# 🏪 HỆ THỐNG QUẢN LÝ CỬA HÀNG BÁN LẺ# 🛒 HỆ THỐNG QUẢN LÝ CỬA HÀNG BÁN LẺ

> **Tài liệu kỹ thuật chi tiết cho Developer** ## 📋 MỤC LỤCHệ thống quản lý cửa hàng bán lẻ đầy đủ với Backend ASP.NET Core Web API và Frontend React + TypeScript.

> Đây là phiên bản chi tiết, ghi rõ từng tính năng đã làm/chưa làm, validation, audit log, soft delete...

1. [Giới thiệu](#giới-thiệu)

---

2. [Công nghệ sử dụng](#công-nghệ-sử-dụng)## ⭐ TÍNH NĂNG

## 📋 MỤC LỤC

1. [Giới thiệu](#giới-thiệu)3. [Hướng dẫn chạy dự án](#hướng-dẫn-chạy-dự-án)

2. [Công nghệ sử dụng](#công-nghệ-sử-dụng)

3. [Hướng dẫn chạy dự án](#hướng-dẫn-chạy-dự-án)4. [Tính năng chi tiết](#tính-năng-chi-tiết)✅ Quản lý sản phẩm & tồn kho

4. [Tính năng chi tiết](#tính-năng-chi-tiết)

5. [Tình trạng hoàn thành](#tình-trạng-hoàn-thành)5. [Tình trạng hoàn thành](#tình-trạng-hoàn-thành)✅ Quản lý đơn hàng & thanh toán

---✅ **Quét Barcode 4 cách** (USB, Paste ảnh, Nhập tay, Camera) 🆕

## 🎯 GIỚI THIỆU---✅ **Paste ảnh barcode** để tự động đọc mã (Ctrl+V) 🆕

Hệ thống quản lý cửa hàng bán lẻ được xây dựng với kiến trúc Client-Server, sử dụng RESTful API để quản lý các hoạt động của cửa hàng bao gồm: sản phẩm, đơn hàng, khách hàng, nhà cung cấp, kho hàng và báo cáo.✅ Tạo & in barcode tự động

**Trạng thái hiện tại**: Đang phát triển - Backend API đã hoàn thiện 90%, Frontend đang xây dựng## 🎯 GIỚI THIỆU✅ Quản lý khách hàng

---✅ Quản lý danh mục & nhà cung cấp

## 🛠️ CÔNG NGHỆ SỬ DỤNGHệ thống quản lý cửa hàng bán lẻ được xây dựng với kiến trúc Client-Server, sử dụng RESTful API để quản lý các hoạt động của cửa hàng bao gồm: sản phẩm, đơn hàng, khách hàng, nhà cung cấp, kho hàng và báo cáo.✅ Quản lý khuyến mãi

### Backend✅ Dashboard & thống kê quản lý cửa hàng bán lẻ đầy đủ với Backend ASP.NET Core Web API và Frontend React + TypeScript.

- **Framework**: .NET 8 Web API

- **ORM**: Entity Framework Core 8**Trạng thái hiện tại**: Đang phát triển - Backend API đã hoàn thiện 90%, Frontend đang xây dựng

- **Database**: MySQL 8.0

- **Authentication**: JWT Bearer Token (đã tắt để test)> **📖 [XEM HƯỚNG DẪN CHI TIẾT](./HUONG_DAN_SU_DUNG.md)**

- **Container**: Docker & Docker Compose

---

### Frontend

- **Framework**: React 18 + TypeScript---

- **Build Tool**: Vite

- **UI Library**: (Đang phát triển)## 🛠️ CÔNG NGHỆ SỬ DỤNG

- **State Management**: React Context API

## 🚀 KHỞI ĐỘNG NHANH (DEVELOPER MỚI)

### DevOps

- **Containerization**: Docker### Backend

- **Reverse Proxy**: Nginx

- **Package Manager**: pnpm (Frontend), NuGet (Backend)- **Framework**: .NET 8 Web API### Setup lần đầu (3 bước):

---- **ORM**: Entity Framework Core 8

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN- **Database**: MySQL 8.0```bash

### Yêu cầu hệ thống- **Authentication**: JWT Bearer Token (đã tắt để test)# 1. Clone project

- Docker Desktop

- .NET 8 SDK (nếu chạy local)- **Container**: Docker & Docker Composegit clone <repository>

- Node.js 18+ và pnpm (cho frontend)

- MySQL 8.0 (nếu chạy local)cd ProjectCuaHangBanLe

### Cách 1: Chạy bằng Docker (Khuyến nghị)### Frontend

`````powershell- **Framework**: React 18 + TypeScript# 2. Start MySQL

# 1. Khởi động toàn bộ hệ thống

.\START_DOCKER.bat- **Build Tool**: Vitedocker-compose up -d mysql



# 2. Kiểm tra logs- **UI Library**: (Đang phát triển)# Hoặc: .\START_MYSQL.bat

.\DOCKER_LOGS.bat

- **State Management**: React Context API

# 3. Dừng hệ thống

.\STOP_DOCKER.bat# 3. Start API (tự động setup database!)



# 4. Rebuild khi có thay đổi code### DevOpscd StoreManagementAPI

.\REBUILD_DOCKER.bat

```- **Containerization**: Dockerdotnet run



**Ports:**- **Reverse Proxy**: Nginx```

- API: http://localhost:5122

- Frontend: http://localhost:3000- **Package Manager**: pnpm (Frontend), NuGet (Backend)

- MySQL: localhost:3306

✅ **Database tự động được tạo và migrations tự động apply!**

### Cách 2: Chạy local (Development)

---

```powershell

# 1. Khởi động MySQL> 📖 **Chi tiết:** [DEVELOPER_SETUP_GUIDE.md](./DEVELOPER_SETUP_GUIDE.md)

.\START_MYSQL.bat

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

# 2. Chạy API

.\START_API.bat---



# 3. Chạy Frontend (terminal khác)### Yêu cầu hệ thống

cd store-management-frontend

pnpm install- Docker Desktop## 🛠️ TECH STACK

pnpm dev

```- .NET 8 SDK (nếu chạy local)



### Khởi tạo Database- Node.js 18+ và pnpm (cho frontend)- **Backend:** ASP.NET Core 8.0 Web API



```powershell- MySQL 8.0 (nếu chạy local)- **Database:** MySQL 8.0 + **Entity Framework Core Migrations**

# 1. Kiểm tra database

.\CHECK_DATABASE.bat- **Frontend:** React 18 + TypeScript + Vite



# 2. Chạy migrations### Cách 1: Chạy bằng Docker (Khuyến nghị)- **UI Library:** Ant Design

Get-Content "migrations\001_add_audit_logs.sql" | docker exec -i store_mysql mysql -uroot store_management

```- **State Management:** React Context



### Thông tin đăng nhập mặc định```powershell- **Container:** Docker + Docker Compose

- **Username**: admin

- **Password**: admin123# 1. Khởi động toàn bộ hệ thống

- **Database**: store_management

- **MySQL Root Password**: root123.\START_DOCKER.bat---



---



## 📊 TÍNH NĂNG CHI TIẾT# 2. Kiểm tra logs## 📂 CẤU TRÚC PROJECT



### ✅ 1. QUẢN LÝ SẢN PHẨM (Products).\DOCKER_LOGS.bat



#### Chức năng đã làm:```

- ✅ **CRUD cơ bản**

  - ✅ Thêm sản phẩm mới (có audit log)# 3. Dừng hệ thốngProjectCuaHangBanLe/

  - ✅ Cập nhật sản phẩm (có audit log)

  - ✅ Xóa sản phẩm (soft delete - có audit log).\STOP_DOCKER.bat├── StoreManagementAPI/ # Backend API (.NET 8)

  - ✅ Lấy danh sách sản phẩm

  - ✅ Lấy chi tiết sản phẩm│ ├── Controllers/ # API Controllers



- ✅ **Tìm kiếm & Lọc**# 4. Rebuild khi có thay đổi code│ ├── Models/ # Database Models

  - ✅ Tìm kiếm theo tên sản phẩm

  - ✅ Tìm kiếm theo barcode.\REBUILD_DOCKER.bat│ ├── Migrations/ # EF Core Migrations ⭐

  - ✅ Lọc theo danh mục

  - ✅ Lọc theo nhà cung cấp```│ ├── Services/                  # Business Logic



- ✅ **Quản lý tồn kho**│   └── Data/                      # DbContext

  - ✅ Cập nhật số lượng tồn kho

  - ✅ Hiển thị tổng tồn kho từ tất cả warehouse**Ports:**├── store-management-frontend/     # Frontend React

  - ✅ Xem lịch sử thay đổi sản phẩm (audit log)

  - API: http://localhost:5122│   ├── src/

- ✅ **Soft Delete**

  - ✅ Khi xóa sản phẩm có trong đơn hàng/PO → chuyển status = "deleted"- Frontend: http://localhost:3000│   │   ├── components/

  - ✅ Khi xóa sản phẩm không liên quan → xóa vĩnh viễn

  - ✅ Ghi log khi xóa- MySQL: localhost:3306│   │   ├── pages/



- ✅ **Audit Log**│   │   └── services/

  - ✅ Ghi log khi CREATE sản phẩm

  - ✅ Ghi log khi UPDATE sản phẩm### Cách 2: Chạy local (Development)└── docker-compose.yml            # Docker configuration

  - ✅ Ghi log khi DELETE sản phẩm

  - ✅ Lưu thông tin: userId, username, action, entityType, entityId, changes, timestamp```



#### Validation:````powershell

- ✅ Kiểm tra barcode không trùng lặp

- ✅ Kiểm tra giá bán > giá vốn# 1. Khởi động MySQL---

- ✅ Kiểm tra category và supplier tồn tại

- ❌ **Chưa validate**: .\START_MYSQL.bat

  - Tên sản phẩm bắt buộc (min/max length)

  - Giá không được âm## 🎯 QUICK START (Các cách khác)

  - Unit không được rỗng

  - Barcode format chuẩn# 2. Chạy API



#### API Endpoints:.\START_API.bat### Option 1: Docker (Tất cả services)

`````

GET /api/products - Lấy tất cả sản phẩm

GET /api/products/{id} - Lấy chi tiết sản phẩm

GET /api/products/barcode/{barcode} - Tìm theo barcode# 3. Chạy Frontend (terminal khác)```bash

GET /api/products/search?searchTerm - Tìm kiếm sản phẩm

GET /api/products/{id}/history - Lịch sử thay đổicd store-management-frontenddocker-compose up -d

POST /api/products - Thêm sản phẩm (có audit)

PUT /api/products/{id} - Cập nhật sản phẩm (có audit)pnpm install```

DELETE /api/products/{id} - Xóa sản phẩm (có audit, soft delete)

PUT /api/products/stock - Cập nhật tồn khopnpm dev

`````

```### Option 2: Manual

---



### ✅ 2. QUẢN LÝ DANH MỤC (Categories)

### Khởi tạo Database#### 1. Start MySQL

#### Chức năng đã làm:

- ✅ **CRUD cơ bản**

  - ✅ Thêm danh mục

  - ✅ Cập nhật danh mục```powershell```bash

  - ✅ Xóa danh mục (có soft delete)

  - ✅ Lấy danh sách danh mục# 1. Kiểm tra database.\START_MYSQL.bat

  - ✅ Lấy chi tiết danh mục

  .\CHECK_DATABASE.bat# Hoặc: docker-compose up -d mysql

- ✅ **Soft Delete thông minh**

  - ✅ Kiểm tra xem có sản phẩm nào đang dùng category không````

  - ✅ Nếu có sản phẩm → chuyển status = "inactive" (soft delete)

  - ✅ Nếu không có → xóa vĩnh viễn# 2. Chạy migrations



- ✅ **Khôi phục**Get-Content "migrations\001_add_audit_logs.sql" | docker exec -i store_mysql mysql -uroot store_management#### 2. Start Backend API

  - ✅ API restore danh mục đã xóa mềm (PATCH /api/categories/{id}/restore)

`````

#### Validation:

- ❌ **Chưa validate**:```bash

  - Tên danh mục bắt buộc

  - Tên danh mục không trùng### Thông tin đăng nhập mặc địnhcd StoreManagementAPI

  - Min/max length

- **Username**: admindotnet run

#### Audit Log:

- ❌ **Chưa có audit log** cho Category- **Password**: admin123# Database tự động setup qua EF Migrations!

#### API Endpoints:- **Database**: store_management```

```````

GET    /api/categories           - Lấy tất cả danh mục- **MySQL Root Password**: root123

GET    /api/categories/{id}      - Lấy chi tiết danh mục

POST   /api/categories           - Thêm danh mục#### 3. Start Frontend

PUT    /api/categories/{id}      - Cập nhật danh mục

DELETE /api/categories/{id}      - Xóa danh mục (soft delete nếu có SP)---

PATCH  /api/categories/{id}/restore - Khôi phục danh mục

``````bash



---## 📊 TÍNH NĂNG CHI TIẾTcd store-management-frontend



### ✅ 3. QUẢN LÝ KHÁCH HÀNG (Customers)pnpm install



#### Chức năng đã làm:### ✅ 1. QUẢN LÝ SẢN PHẨM (Products)pnpm run dev

- ✅ **CRUD cơ bản**

  - ✅ Thêm khách hàng````

  - ✅ Cập nhật khách hàng

  - ✅ Xóa khách hàng#### Chức năng đã làm:

  - ✅ Lấy danh sách khách hàng

  - ✅ Lấy chi tiết khách hàng- ✅ **CRUD cơ bản**### 4. Truy cập



#### Validation:  - ✅ Thêm sản phẩm mới (có audit log)

- ❌ **Chưa validate**:

  - Tên khách hàng bắt buộc  - ✅ Cập nhật sản phẩm (có audit log)- **Frontend:** http://localhost:3000

  - Số điện thoại format (10-11 số)

  - Email format chuẩn  - ✅ Xóa sản phẩm (soft delete - có audit log)- **Backend API:** http://localhost:5122

  - Số điện thoại không trùng

  - ✅ Lấy danh sách sản phẩm- **Swagger UI:** http://localhost:5122/swagger

#### Audit Log:

- ❌ **Chưa có audit log** cho Customer  - ✅ Lấy chi tiết sản phẩm



#### Soft Delete:  ### 5. Đăng nhập

- ❌ **Chưa có soft delete** - hiện đang xóa vĩnh viễn

- ✅ **Tìm kiếm & Lọc**

#### API Endpoints:

```  - ✅ Tìm kiếm theo tên sản phẩm- **Username:** `admin`

GET    /api/customers        - Lấy tất cả khách hàng

GET    /api/customers/{id}   - Lấy chi tiết khách hàng  - ✅ Tìm kiếm theo barcode- **Password:** `123456`

POST   /api/customers        - Thêm khách hàng

PUT    /api/customers/{id}   - Cập nhật khách hàng  - ✅ Lọc theo danh mục

DELETE /api/customers/{id}   - Xóa khách hàng (hard delete)

```  - ✅ Lọc theo nhà cung cấp---



---- ✅ **Quản lý tồn kho**## 📚 TÀI LIỆU



### ✅ 4. QUẢN LÝ NHÀ CUNG CẤP (Suppliers)  - ✅ Cập nhật số lượng tồn kho



#### Chức năng đã làm:  - ✅ Hiển thị tổng tồn kho từ tất cả warehouse| Tài liệu | Mô tả |

- ✅ **CRUD cơ bản**

  - ✅ Thêm nhà cung cấp  - ✅ Xem lịch sử thay đổi sản phẩm (audit log)| ------------------------------------------------------------ | ---------------------------------------- |

  - ✅ Cập nhật nhà cung cấp

  - ✅ Xóa nhà cung cấp (có soft delete)  | [DEVELOPER_SETUP_GUIDE.md](./DEVELOPER_SETUP_GUIDE.md) | 🚀 **Hướng dẫn setup cho developer mới** |

  - ✅ Lấy danh sách nhà cung cấp

  - ✅ Lấy chi tiết nhà cung cấp- ✅ **Soft Delete**| [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) | 📖 Chi tiết về EF Core Migrations |



- ✅ **Soft Delete thông minh**  - ✅ Khi xóa sản phẩm có trong đơn hàng/PO → chuyển status = "deleted"| [QUICK_MIGRATION_SETUP.md](./QUICK_MIGRATION_SETUP.md) | ⚡ Setup migrations nhanh |

  - ✅ Kiểm tra xem có sản phẩm hoặc đơn nhập hàng nào liên quan không

  - ✅ Nếu có → chuyển status = "inactive" (soft delete)  - ✅ Khi xóa sản phẩm không liên quan → xóa vĩnh viễn| [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) | 📝 Hướng dẫn sử dụng tính năng |

  - ✅ Nếu không có → xóa vĩnh viễn

    - ✅ Ghi log khi xóa| [AUDIT_LOG_COMPLETE_GUIDE.md](./AUDIT_LOG_COMPLETE_GUIDE.md) | 🔍 Hướng dẫn Audit Logs |

- ✅ **Khôi phục**

  - ✅ API restore nhà cung cấp đã xóa mềm- ✅ **Audit Log**---



#### Validation:  - ✅ Ghi log khi CREATE sản phẩm

- ❌ **Chưa validate**:

  - Tên nhà cung cấp bắt buộc  - ✅ Ghi log khi UPDATE sản phẩm## 🔄 WORKFLOW PHÁT TRIỂN

  - Số điện thoại format

  - Email format  - ✅ Ghi log khi DELETE sản phẩm

  - Địa chỉ bắt buộc

  - ✅ Lưu thông tin: userId, username, action, entityType, entityId, changes, timestamp### Khi pull code mới:

#### Audit Log:

- ❌ **Chưa có audit log** cho Supplier#### Validation:```bash



#### API Endpoints:- ✅ Kiểm tra barcode không trùng lặpgit pull

```````

GET /api/suppliers - Lấy tất cả nhà cung cấp- ✅ Kiểm tra giá bán > giá vốncd StoreManagementAPI

GET /api/suppliers/{id} - Lấy chi tiết nhà cung cấp

POST /api/suppliers - Thêm nhà cung cấp- ✅ Kiểm tra category và supplier tồn tạidotnet run # Tự động apply migrations mới!

PUT /api/suppliers/{id} - Cập nhật nhà cung cấp

DELETE /api/suppliers/{id} - Xóa nhà cung cấp (soft delete nếu có liên quan)- ❌ **Chưa validate**: ```

PATCH /api/suppliers/{id}/restore - Khôi phục nhà cung cấp

`````- Tên sản phẩm bắt buộc (min/max length)



---  - Giá không được âm### Khi thêm/sửa Model:



### ✅ 5. QUẢN LÝ ĐƠN HÀNG (Orders)  - Unit không được rỗng



#### Chức năng đã làm:  - Barcode format chuẩn```bash

- ✅ **CRUD cơ bản**

  - ✅ Tạo đơn hàng với nhiều sản phẩm# 1. Sửa file trong Models/

  - ✅ Cập nhật trạng thái đơn hàng

  - ✅ Lấy danh sách đơn hàng#### API Endpoints:# 2. Tạo migration

  - ✅ Lấy chi tiết đơn hàng (bao gồm items)

  ````cd StoreManagementAPI

- ✅ **Xử lý đơn hàng**

  - ✅ Tự động tính tổng tiền đơn hàngGET    /api/products                    - Lấy tất cả sản phẩmdotnet ef migrations add YourMigrationName

  - ✅ Tự động trừ tồn kho khi tạo đơn

  - ✅ Xử lý thanh toán (Payment)GET    /api/products/{id}               - Lấy chi tiết sản phẩm

  - ✅ Cập nhật trạng thái: pending → processing → completed → cancelled

  GET    /api/products/barcode/{barcode}  - Tìm theo barcode# 3. Chạy app (tự động apply)

- ✅ **Chi tiết đơn hàng**

  - ✅ Lưu thông tin OrderItems (productId, quantity, unitPrice, subtotal)GET    /api/products/search?searchTerm  - Tìm kiếm sản phẩmdotnet run

  - ✅ Hiển thị thông tin sản phẩm trong đơn hàng

  - ✅ Hiển thị thông tin khách hàngGET    /api/products/{id}/history       - Lịch sử thay đổi



#### Validation:POST   /api/products                    - Thêm sản phẩm (có audit)# 4. Commit

- ✅ Kiểm tra sản phẩm tồn tại

- ✅ Kiểm tra số lượng tồn kho đủPUT    /api/products/{id}               - Cập nhật sản phẩm (có audit)git add .

- ❌ **Chưa validate**:

  - Số lượng > 0DELETE /api/products/{id}               - Xóa sản phẩm (có audit, soft delete)git commit -m "Add new feature"

  - Giá > 0

  - Khách hàng tồn tạiPUT    /api/products/stock              - Cập nhật tồn kho```

  - Không cho phép order với items rỗng

`````

#### Audit Log:

- ❌ **Chưa có audit log** cho Order---

#### Soft Delete:---

- ❌ **Chưa có soft delete** cho Order

## ❓ FAQ

#### API Endpoints:

`````### ✅ 2. QUẢN LÝ DANH MỤC (Categories)

GET    /api/orders              - Lấy tất cả đơn hàng

GET    /api/orders/{id}         - Lấy chi tiết đơn hàng**Q: Tại sao không cần chạy SQL scripts nữa?**

POST   /api/orders              - Tạo đơn hàng mới

PUT    /api/orders/{id}/status  - Cập nhật trạng thái#### Chức năng đã làm:A: Project đã chuyển sang **EF Core Migrations** - database tự động setup khi chạy `dotnet run`. Xem [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)

POST   /api/orders/payment      - Xử lý thanh toán

```- ✅ **CRUD cơ bản**



---  - ✅ Thêm danh mục**Q: Developer mới cần làm gì?**



### ✅ 6. QUẢN LÝ TỒN KHO (Inventory)  - ✅ Cập nhật danh mụcA: Chỉ cần: `git clone` → `docker-compose up -d mysql` → `dotnet run`. Xem [DEVELOPER_SETUP_GUIDE.md](./DEVELOPER_SETUP_GUIDE.md)



#### Chức năng đã làm:  - ✅ Xóa danh mục (có soft delete)

- ✅ **Xem tồn kho**

  - ✅ Xem tất cả tồn kho  - ✅ Lấy danh sách danh mục**Q: Làm sao rollback migration?**

  - ✅ Xem tồn kho theo warehouse

  - ✅ Xem chi tiết tồn kho của sản phẩm  - ✅ Lấy chi tiết danh mụcA: `dotnet ef database update PreviousMigrationName`



- ✅ **Nhập kho**- ✅ **Soft Delete thông minh\*\***Q: Production deploy như thế nào?\*\*

  - ✅ Nhập hàng vào kho (AddStock)

  - ✅ Tự động tính toán tồn kho  - ✅ Kiểm tra xem có sản phẩm nào đang dùng category khôngA: Generate SQL script: `dotnet ef migrations script --idempotent > migration.sql`, sau đó DBA review và chạy.



- ✅ **Tính toán lại**  - ✅ Nếu có sản phẩm → chuyển status = "inactive" (soft delete)

  - ✅ API tính toán lại tồn kho toàn hệ thống

  - ✅ Nếu không có → xóa vĩnh viễn---

#### Validation:

- ✅ Kiểm tra product tồn tại- ✅ **Khôi phục**## 🤝 CONTRIBUTION

- ✅ Kiểm tra warehouse tồn tại

- ❌ **Chưa validate**:  - ✅ API restore danh mục đã xóa mềm (PATCH /api/categories/{id}/restore)

  - Số lượng > 0

  - Không cho phép số lượng âm1. Fork project



#### Audit Log:#### Validation:2. Tạo branch mới: `git checkout -b feature/AmazingFeature`

- ❌ **Chưa có audit log** cho Inventory

- ❌ **Chưa validate**:3. Commit changes: `git commit -m 'Add some AmazingFeature'`

#### API Endpoints:

```  - Tên danh mục bắt buộc4. Push to branch: `git push origin feature/AmazingFeature`

GET  /api/inventory                    - Lấy tất cả tồn kho

GET  /api/inventory/warehouse/{id}     - Tồn kho theo kho  - Tên danh mục không trùng5. Tạo Pull Request

GET  /api/inventory/product/{id}       - Chi tiết tồn kho sản phẩm

POST /api/inventory/add-stock          - Nhập kho  - Min/max length

POST /api/inventory/recalculate        - Tính lại tồn kho

```**Lưu ý:** Nhớ commit cả Migration files khi thay đổi Models!



---#### Audit Log:



### ✅ 7. QUẢN LÝ KHO HÀNG (Warehouses)- ❌ **Chưa có audit log** cho Category---



#### Chức năng đã làm:#### API Endpoints:## 📝 LICENSE

- ✅ **CRUD cơ bản**

  - ✅ Thêm kho hàng````

  - ✅ Cập nhật kho hàng

  - ✅ Xóa kho hàngGET    /api/categories           - Lấy tất cả danh mụcMIT License

  - ✅ Lấy danh sách kho hàng

  - ✅ Lấy chi tiết kho hàngGET    /api/categories/{id}      - Lấy chi tiết danh mục



#### Validation:POST   /api/categories           - Thêm danh mục---

- ❌ **Chưa validate**:

  - Tên kho bắt buộcPUT    /api/categories/{id}      - Cập nhật danh mục

  - Địa chỉ kho bắt buộc

  - Tên kho không trùngDELETE /api/categories/{id}      - Xóa danh mục (soft delete nếu có SP)## 👨‍💻 DEVELOPER



#### Audit Log:PATCH  /api/categories/{id}/restore - Khôi phục danh mục

- ❌ **Chưa có audit log** cho Warehouse

```MinhHieuLiverpool

#### Soft Delete:

- ❌ **Chưa có soft delete** - đang xóa vĩnh viễn



#### API Endpoints:------

`````

GET /api/warehouses - Lấy tất cả kho hàng

GET /api/warehouses/{id} - Lấy chi tiết kho hàng

POST /api/warehouses - Thêm kho hàng### ✅ 3. QUẢN LÝ KHÁCH HÀNG (Customers)**⭐ Nếu project hữu ích, đừng quên star repo nhé!**

PUT /api/warehouses/{id} - Cập nhật kho hàng

DELETE /api/warehouses/{id} - Xóa kho hàng

````

#### Chức năng đã làm:### Option 1: Docker (Tất cả services)

---

- ✅ **CRUD cơ bản**

### ✅ 8. QUẢN LÝ PHIẾU NHẬP HÀNG (Purchase Orders)

  - ✅ Thêm khách hàng```bash

#### Chức năng đã làm:

- ✅ **CRUD cơ bản**  - ✅ Cập nhật khách hàngdocker-compose up -d

  - ✅ Tạo phiếu nhập hàng

  - ✅ Cập nhật trạng thái phiếu nhập  - ✅ Xóa khách hàng```

  - ✅ Xóa phiếu nhập hàng

  - ✅ Lấy danh sách phiếu nhập  - ✅ Lấy danh sách khách hàng

  - ✅ Lấy chi tiết phiếu nhập (bao gồm items)

    - ✅ Lấy chi tiết khách hàng### Option 2: Manual

- ✅ **Xử lý nhập hàng**

  - ✅ Tự động tính tổng tiền phiếu nhập

  - ✅ Lưu thông tin PurchaseItems

  - ✅ Cập nhật trạng thái: pending → ordered → received → cancelled#### Validation:```bash



#### Validation:- ❌ **Chưa validate**:.\START_MYSQL.bat

- ✅ Kiểm tra sản phẩm tồn tại

- ✅ Kiểm tra nhà cung cấp tồn tại  - Tên khách hàng bắt buộc```

- ❌ **Chưa validate**:

  - Số lượng > 0  - Số điện thoại format (10-11 số)

  - Giá > 0

  - Không cho phép PO rỗng (không có items)  - Email format chuẩn### 2. Khởi động Backend



#### Audit Log:  - Số điện thoại không trùng

- ❌ **Chưa có audit log** cho Purchase Order

```bash

#### Soft Delete:

- ❌ **Chưa có soft delete**#### Audit Log:.\START_API.bat



#### API Endpoints:- ❌ **Chưa có audit log** cho Customer```

````

GET /api/purchaseorders - Lấy tất cả phiếu nhập

GET /api/purchaseorders/{id} - Lấy chi tiết phiếu nhập

POST /api/purchaseorders - Tạo phiếu nhập#### Soft Delete:### 3. Khởi động Frontend

PATCH /api/purchaseorders/{id}/status - Cập nhật trạng thái

DELETE /api/purchaseorders/{id} - Xóa phiếu nhập- ❌ **Chưa có soft delete** - hiện đang xóa vĩnh viễn

````

```bash

---

#### API Endpoints:cd store-management-frontend

### ✅ 9. QUẢN LÝ KHUYẾN MÃI (Promotions)

```pnpm install

#### Chức năng đã làm:

- ✅ **CRUD cơ bản**GET    /api/customers        - Lấy tất cả khách hàngpnpm run dev

  - ✅ Thêm khuyến mãi

  - ✅ Cập nhật khuyến mãiGET    /api/customers/{id}   - Lấy chi tiết khách hàng```

  - ✅ Xóa khuyến mãi

  - ✅ Lấy danh sách khuyến mãiPOST   /api/customers        - Thêm khách hàng

  - ✅ Lấy chi tiết khuyến mãi

  PUT    /api/customers/{id}   - Cập nhật khách hàng### 4. Truy cập

- ✅ **Tìm kiếm & Lọc**

  - ✅ Tìm khuyến mãi theo codeDELETE /api/customers/{id}   - Xóa khách hàng (hard delete)

  - ✅ Lấy các khuyến mãi đang active

  ```- **Frontend:** http://localhost:3000

- ✅ **Validate promotion**

  - ✅ Kiểm tra promotion còn hiệu lực- **Backend API:** http://localhost:5122/swagger

  - ✅ Kiểm tra thời gian bắt đầu/kết thúc

  - ✅ Tự động cập nhật trạng thái promotion (active/expired)---



- ✅ **Loại giảm giá**### 5. Đăng nhập

  - ✅ Hỗ trợ giảm theo phần trăm (percentage)

  - ✅ Hỗ trợ giảm theo số tiền (amount)### ✅ 4. QUẢN LÝ NHÀ CUNG CẤP (Suppliers)

  - ✅ Đặt giá trị đơn hàng tối thiểu

  - ✅ Giới hạn số lần sử dụng- **Username:** `admin`



#### Validation:#### Chức năng đã làm:- **Password:** `123456`

- ✅ Kiểm tra mã promotion tồn tại

- ✅ Kiểm tra thời gian hiệu lực- ✅ **CRUD cơ bản**

- ❌ **Chưa validate**:

  - Mã promotion không trùng  - ✅ Thêm nhà cung cấp---

  - DiscountValue > 0

  - Nếu percentage thì <= 100  - ✅ Cập nhật nhà cung cấp

  - StartDate < EndDate

  - MinOrderAmount >= 0  - ✅ Xóa nhà cung cấp (có soft delete)## � TÍNH NĂNG

  - UsageLimit >= 0

  - ✅ Lấy danh sách nhà cung cấp

#### Audit Log:

- ❌ **Chưa có audit log** cho Promotion  - ✅ Lấy chi tiết nhà cung cấp✅ Quản lý sản phẩm & tồn kho



#### API Endpoints:  ✅ Quản lý đơn hàng & thanh toán

````

GET /api/promotions - Lấy tất cả khuyến mãi- ✅ **Soft Delete thông minh**✅ Quản lý khách hàng

GET /api/promotions/active - Lấy khuyến mãi đang active

GET /api/promotions/{id} - Lấy chi tiết khuyến mãi - ✅ Kiểm tra xem có sản phẩm hoặc đơn nhập hàng nào liên quan không✅ Quản lý danh mục & nhà cung cấp

GET /api/promotions/code/{code} - Tìm theo mã code

POST /api/promotions - Thêm khuyến mãi - ✅ Nếu có → chuyển status = "inactive" (soft delete)✅ Quản lý khuyến mãi

PUT /api/promotions/{id} - Cập nhật khuyến mãi

DELETE /api/promotions/{id} - Xóa khuyến mãi - ✅ Nếu không có → xóa vĩnh viễn✅ Dashboard & thống kê

`````

  ✅ Xác thực JWT & phân quyền Admin/Staff

---

- ✅ **Khôi phục**

### ✅ 10. XÁC THỰC & PHÂN QUYỀN (Authentication & Authorization)

  - ✅ API restore nhà cung cấp đã xóa mềm---

#### Chức năng đã làm:

- ✅ **Đăng nhập/Đăng ký**

  - ✅ API đăng nhập (Login)

  - ✅ API đăng ký (Register)#### Validation:## 🏗️ CÔNG NGHỆ

  - ✅ Mã hóa mật khẩu (BCrypt)

  - ✅ Tạo JWT Token- ❌ **Chưa validate**:



- ✅ **Quản lý người dùng**  - Tên nhà cung cấp bắt buộc**Backend:** ASP.NET Core 8.0 + MySQL + Entity Framework Core + JWT

  - ✅ Lấy danh sách người dùng

  - ✅ Thêm người dùng  - Số điện thoại format**Frontend:** React 18 + TypeScript + Vite + Ant Design

  - ✅ Cập nhật người dùng

  - ✅ Xóa người dùng  - Email format

  - ✅ Đổi mật khẩu

    - Địa chỉ bắt buộc---

- ✅ **Phân quyền**

  - ✅ Hỗ trợ 2 role: Admin, Staff

  - ⚠️ **Đang TẮT authentication** để test - tất cả API đều public

#### Audit Log:## 📞 HỖ TRỢ

#### Trạng thái:

- ⚠️ **Authentication đang BỊ TẮT** - Tất cả `[Authorize]` attribute đã bị comment- ❌ **Chưa có audit log** cho Supplier

- ⚠️ Hiện tại tất cả API đều có thể truy cập mà không cần token

- ✅ Code JWT đã viết xong, chỉ cần bật lại khi cầnXem thêm: **[HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md)** để biết chi tiết về cài đặt, cấu hình và xử lý lỗi.



#### Validation:#### API Endpoints:

- ✅ Kiểm tra username đã tồn tại

- ✅ Mã hóa password```MIT License - Free to use for learning and commercial purposes.

- ❌ **Chưa validate**:

  - Password strength (min 6 ký tự, có chữ hoa, số, ký tự đặc biệt)GET    /api/suppliers           - Lấy tất cả nhà cung cấp

  - Username format (không khoảng trắng, ký tự đặc biệt)GET    /api/suppliers/{id}      - Lấy chi tiết nhà cung cấp

  - Email formatPOST   /api/suppliers           - Thêm nhà cung cấp

  - Username không trùngPUT    /api/suppliers/{id}      - Cập nhật nhà cung cấp

DELETE /api/suppliers/{id}      - Xóa nhà cung cấp (soft delete nếu có liên quan)

#### Audit Log:PATCH  /api/suppliers/{id}/restore - Khôi phục nhà cung cấp

- ❌ **Chưa có audit log** cho User actions (login, logout, register)````



#### API Endpoints:---

`````

POST /api/auth/login - Đăng nhập### ✅ 5. QUẢN LÝ ĐỦN HÀNG (Orders)

POST /api/auth/register - Đăng ký

#### Chức năng đã làm:

GET /api/users - Lấy danh sách user

POST /api/users - Thêm user- ✅ **CRUD cơ bản**

PUT /api/users/{id} - Cập nhật user - ✅ Tạo đơn hàng với nhiều sản phẩm

DELETE /api/users/{id} - Xóa user - ✅ Cập nhật trạng thái đơn hàng

PUT /api/users/{id}/password - Đổi mật khẩu - ✅ Lấy danh sách đơn hàng

````- ✅ Lấy chi tiết đơn hàng (bao gồm items)

- ✅ **Xử lý đơn hàng**

---  - ✅ Tự động tính tổng tiền đơn hàng

  - ✅ Tự động trừ tồn kho khi tạo đơn

### ✅ 11. AUDIT LOG (Lịch sử thao tác)  - ✅ Xử lý thanh toán (Payment)

  - ✅ Cập nhật trạng thái: pending → processing → completed → cancelled

#### Chức năng đã làm:- ✅ **Chi tiết đơn hàng**

- ✅ **Ghi log tự động**  - ✅ Lưu thông tin OrderItems (productId, quantity, unitPrice, subtotal)

  - ✅ Ghi log cho Product (CREATE, UPDATE, DELETE)  - ✅ Hiển thị thông tin sản phẩm trong đơn hàng

  - ✅ Lưu thông tin: userId, username, action, entityType, entityId, changes, timestamp  - ✅ Hiển thị thông tin khách hàng



- ✅ **Xem audit log**#### Validation:

  - ✅ Xem tất cả audit logs (có filter)

  - ✅ Xem log theo entity (Product, Order, v.v.)- ✅ Kiểm tra sản phẩm tồn tại

  - ✅ Xem log theo user- ✅ Kiểm tra số lượng tồn kho đủ

  - ✅ Xem chi tiết 1 log- ❌ **Chưa validate**:

  - ✅ Xem tổng kết hoạt động (summary)  - Số lượng > 0

  - ✅ Xem hoạt động của chính mình (my-activities)  - Giá > 0

    - Khách hàng tồn tại

- ✅ **Filter**  - Không cho phép order với items rỗng

  - ✅ Lọc theo entityType

  - ✅ Lọc theo action (CREATE, UPDATE, DELETE)#### Audit Log:

  - ✅ Lọc theo userId

  - ✅ Lọc theo khoảng thời gian- ❌ **Chưa có audit log** cho Order



#### Trạng thái:#### Soft Delete:

- ✅ **Đã hoàn thành** cho Product

- ❌ **Chưa áp dụng** cho: Category, Customer, Supplier, Order, PurchaseOrder, Warehouse, Inventory, Promotion, User- ❌ **Chưa có soft delete** cho Order



#### Thông tin được lưu:#### API Endpoints:

```json

{```

  "auditLogId": 1,GET    /api/orders              - Lấy tất cả đơn hàng

  "entityType": "Product",GET    /api/orders/{id}         - Lấy chi tiết đơn hàng

  "entityId": 123,POST   /api/orders              - Tạo đơn hàng mới

  "action": "UPDATE",PUT    /api/orders/{id}/status  - Cập nhật trạng thái

  "userId": 1,POST   /api/orders/payment      - Xử lý thanh toán

  "username": "admin",```

  "changes": "{\"Price\":{\"Old\":100000,\"New\":120000}}",

  "timestamp": "2025-10-13T10:30:00"---

}

```### ✅ 6. QUẢN LÝ TỒN KHO (Inventory)



#### API Endpoints:#### Chức năng đã làm:

````

GET /api/auditlogs - Lấy tất cả logs (có filter)- ✅ **Xem tồn kho**

GET /api/auditlogs/{id} - Chi tiết 1 log - ✅ Xem tất cả tồn kho

GET /api/auditlogs/entity/{type}/{id} - Logs theo entity - ✅ Xem tồn kho theo warehouse

GET /api/auditlogs/user/{userId} - Logs theo user - ✅ Xem chi tiết tồn kho của sản phẩm

GET /api/auditlogs/summary - Tổng kết hoạt động- ✅ **Nhập kho**

GET /api/auditlogs/my-activities - Hoạt động của tôi - ✅ Nhập hàng vào kho (AddStock)

```- ✅ Tự động tính toán tồn kho

- ✅ **Tính toán lại**

---  - ✅ API tính toán lại tồn kho toàn hệ thống



### ❌ 12. BARCODE (Chưa hoàn thành)#### Validation:



#### Trạng thái:- ✅ Kiểm tra product tồn tại

- ✅ Có file `BarcodeController.cs`- ✅ Kiểm tra warehouse tồn tại

- ❌ **Chưa implement** - Controller rỗng- ❌ **Chưa validate**:

- ❌ Chưa có service  - Số lượng > 0

- ❌ Chưa có chức năng tạo barcode  - Không cho phép số lượng âm

- ❌ Chưa có chức năng in barcode

#### Audit Log:

---

- ❌ **Chưa có audit log** cho Inventory

## 📈 TÌNH TRẠNG HOÀN THÀNH

#### API Endpoints:

### Backend API

```

#### ✅ Hoàn thành 100%GET /api/inventory - Lấy tất cả tồn kho

1. **Products** ✅GET /api/inventory/warehouse/{id} - Tồn kho theo kho

   - CRUD ✅GET /api/inventory/product/{id} - Chi tiết tồn kho sản phẩm

   - Soft Delete ✅POST /api/inventory/add-stock - Nhập kho

   - Search & Filter ✅POST /api/inventory/recalculate - Tính lại tồn kho

   - Audit Log ✅```

   - Validation cơ bản ✅

---

2. **Authentication** ✅

   - Login/Register ✅### ✅ 7. QUẢN LÝ KHO HÀNG (Warehouses)

   - JWT Token ✅

   - Password Hashing ✅#### Chức năng đã làm:

   - (Đang tắt để test)

- ✅ **CRUD cơ bản**

3. **Audit Logs** ✅ - ✅ Thêm kho hàng

   - Ghi log cho Product ✅ - ✅ Cập nhật kho hàng

   - Xem & Filter logs ✅ - ✅ Xóa kho hàng

   - API hoàn chỉnh ✅ - ✅ Lấy danh sách kho hàng

- ✅ Lấy chi tiết kho hàng

#### ✅ Hoàn thành 80-90%

4. **Orders** ✅⚠️#### Validation:

   - CRUD ✅

   - Xử lý đơn hàng ✅- ❌ **Chưa validate**:

   - Trừ tồn kho ✅ - Tên kho bắt buộc

   - ❌ Chưa có audit log - Địa chỉ kho bắt buộc

   - ❌ Chưa có soft delete - Tên kho không trùng

   - ❌ Chưa validate đầy đủ

#### Audit Log:

5. **Purchase Orders** ✅⚠️

   - CRUD ✅- ❌ **Chưa có audit log** cho Warehouse

   - Xử lý nhập hàng ✅

   - ❌ Chưa có audit log#### Soft Delete:

   - ❌ Chưa có soft delete

   - ❌ Chưa validate đầy đủ- ❌ **Chưa có soft delete** - đang xóa vĩnh viễn

6. **Inventory** ✅⚠️#### API Endpoints:

   - Xem tồn kho ✅

   - Nhập kho ✅```

   - Tính toán lại ✅GET /api/warehouses - Lấy tất cả kho hàng

   - ❌ Chưa có audit logGET /api/warehouses/{id} - Lấy chi tiết kho hàng

POST /api/warehouses - Thêm kho hàng

7. **Promotions** ✅⚠️PUT /api/warehouses/{id} - Cập nhật kho hàng

   - CRUD ✅DELETE /api/warehouses/{id} - Xóa kho hàng

   - Validate promotion ✅```

   - Tự động cập nhật status ✅

   - ❌ Chưa có audit log---

   - ❌ Chưa validate đầy đủ

### ✅ 8. QUẢN LÝ PHIẾU NHẬP HÀNG (Purchase Orders)

#### ✅ Hoàn thành 70%

8. **Categories** ✅⚠️#### Chức năng đã làm:

   - CRUD ✅

   - Soft Delete thông minh ✅- ✅ **CRUD cơ bản**

   - Restore ✅ - ✅ Tạo phiếu nhập hàng

   - ❌ Chưa có audit log - ✅ Cập nhật trạng thái phiếu nhập

   - ❌ Chưa validate - ✅ Xóa phiếu nhập hàng

- ✅ Lấy danh sách phiếu nhập

9. **Suppliers** ✅⚠️ - ✅ Lấy chi tiết phiếu nhập (bao gồm items)

   - CRUD ✅- ✅ **Xử lý nhập hàng**

   - Soft Delete thông minh ✅ - ✅ Tự động tính tổng tiền phiếu nhập

   - Restore ✅ - ✅ Lưu thông tin PurchaseItems

   - ❌ Chưa có audit log - ✅ Cập nhật trạng thái: pending → ordered → received → cancelled

   - ❌ Chưa validate

#### Validation:

#### ⚠️ Hoàn thành 50%

10. **Customers** ⚠️- ✅ Kiểm tra sản phẩm tồn tại

    - CRUD cơ bản ✅- ✅ Kiểm tra nhà cung cấp tồn tại

    - ❌ Chưa có audit log- ❌ **Chưa validate**:

    - ❌ Chưa có soft delete - Số lượng > 0

    - ❌ Chưa validate - Giá > 0

- Không cho phép PO rỗng (không có items)

11. **Warehouses** ⚠️

    - CRUD cơ bản ✅#### Audit Log:

    - ❌ Chưa có audit log

    - ❌ Chưa có soft delete- ❌ **Chưa có audit log** cho Purchase Order

    - ❌ Chưa validate

#### Soft Delete:

12. **Users** ⚠️

    - CRUD ✅- ❌ **Chưa có soft delete**

    - ❌ Chưa có audit log

    - ❌ Chưa validate password strength#### API Endpoints:

#### ❌ Chưa làm (0%)```

13. **Barcode** ❌GET /api/purchaseorders - Lấy tất cả phiếu nhập

    - Tạo barcodeGET /api/purchaseorders/{id} - Lấy chi tiết phiếu nhập

    - In barcodePOST /api/purchaseorders - Tạo phiếu nhập

    - Scan barcodePATCH /api/purchaseorders/{id}/status - Cập nhật trạng thái

DELETE /api/purchaseorders/{id} - Xóa phiếu nhập

14. **Reports/Analytics** ❌```

    - Báo cáo doanh thu

    - Báo cáo tồn kho---

    - Báo cáo bán hàng

    - Dashboard### ✅ 9. QUẢN LÝ KHUYẾN MÃI (Promotions)

### Frontend#### Chức năng đã làm:

#### ⚠️ Đang phát triển (20%)- ✅ **CRUD cơ bản**

- ✅ Cấu trúc project setup - ✅ Thêm khuyến mãi

- ✅ Routing cơ bản - ✅ Cập nhật khuyến mãi

- ✅ API service layer - ✅ Xóa khuyến mãi

- ⚠️ UI Components (đang làm) - ✅ Lấy danh sách khuyến mãi

- ⚠️ State Management - ✅ Lấy chi tiết khuyến mãi

- ❌ Chưa có trang nào hoàn chỉnh- ✅ **Tìm kiếm & Lọc**

  - ✅ Tìm khuyến mãi theo code

--- - ✅ Lấy các khuyến mãi đang active

- ✅ **Validate promotion**

## 📊 TỔNG KẾT - ✅ Kiểm tra promotion còn hiệu lực

- ✅ Kiểm tra thời gian bắt đầu/kết thúc

### Đã hoàn thành ✅ - ✅ Tự động cập nhật trạng thái promotion (active/expired)

- ✅ Backend API cơ bản (9/13 modules = 69%)- ✅ **Loại giảm giá**

- ✅ Database schema & migrations - ✅ Hỗ trợ giảm theo phần trăm (percentage)

- ✅ Docker setup - ✅ Hỗ trợ giảm theo số tiền (amount)

- ✅ Authentication (đang tắt) - ✅ Đặt giá trị đơn hàng tối thiểu

- ✅ Soft Delete cho Product, Category, Supplier - ✅ Giới hạn số lần sử dụng

- ✅ Audit Log cho Product

- ✅ JWT Token#### Validation:

- ✅ Repository Pattern

- ✅ Service Layer- ✅ Kiểm tra mã promotion tồn tại

- ✅ DTOs- ✅ Kiểm tra thời gian hiệu lực

- ✅ Error Handling cơ bản- ❌ **Chưa validate**:

  - Mã promotion không trùng

### Đang làm ⚠️ - DiscountValue > 0

- ⚠️ Frontend React (20%) - Nếu percentage thì <= 100

- ⚠️ Validation toàn diện - StartDate < EndDate

- ⚠️ Audit Log cho tất cả modules - MinOrderAmount >= 0

  - UsageLimit >= 0

### Chưa làm ❌

- ❌ Audit Log cho: Category, Customer, Supplier, Order, PurchaseOrder, Warehouse, Inventory, Promotion, User#### Audit Log:

- ❌ Soft Delete cho: Customer, Warehouse, Order, PurchaseOrder

- ❌ Validation chi tiết cho tất cả modules- ❌ **Chưa có audit log** cho Promotion

- ❌ Barcode module

- ❌ Reports & Analytics#### API Endpoints:

- ❌ Unit Tests

- ❌ Integration Tests```

- ❌ API Documentation (Swagger đã có nhưng chưa mô tả chi tiết)GET /api/promotions - Lấy tất cả khuyến mãi

- ❌ Logging (ngoài Audit Log)GET /api/promotions/active - Lấy khuyến mãi đang active

- ❌ Error Handling toàn diệnGET /api/promotions/{id} - Lấy chi tiết khuyến mãi

- ❌ Rate LimitingGET /api/promotions/code/{code} - Tìm theo mã code

- ❌ CachingPOST /api/promotions - Thêm khuyến mãi

- ❌ File Upload (hình ảnh sản phẩm)PUT /api/promotions/{id} - Cập nhật khuyến mãi

- ❌ Export Excel/PDFDELETE /api/promotions/{id} - Xóa khuyến mãi

- ❌ Email notifications```

- ❌ Real-time updates (SignalR)

---

---

### ✅ 10. XÁC THỰC & PHÂN QUYỀN (Authentication & Authorization)

## 🔧 CẤU TRÚC DỰ ÁN

#### Chức năng đã làm:

````

ProjectCuaHangBanLe/- ✅ **Đăng nhập/Đăng ký**

├── StoreManagementAPI/          # Backend .NET API  - ✅ API đăng nhập (Login)

│   ├── Controllers/             # API Controllers  - ✅ API đăng ký (Register)

│   ├── Services/                # Business Logic  - ✅ Mã hóa mật khẩu (BCrypt)

│   ├── Repositories/            # Data Access  - ✅ Tạo JWT Token

│   ├── Models/                  # Database Models- ✅ **Quản lý người dùng**

│   ├── DTOs/                    # Data Transfer Objects  - ✅ Lấy danh sách người dùng

│   ├── Data/                    # DbContext  - ✅ Thêm người dùng

│   └── Migrations/              # EF Migrations  - ✅ Cập nhật người dùng

│  - ✅ Xóa người dùng

├── store-management-frontend/   # Frontend React  - ✅ Đổi mật khẩu

│   ├── src/- ✅ **Phân quyền**

│   │   ├── components/          # UI Components  - ✅ Hỗ trợ 2 role: Admin, Staff

│   │   ├── pages/               # Page Components  - ⚠️ **Đang TẮT authentication** để test - tất cả API đều public

│   │   ├── services/            # API Services

│   │   ├── context/             # React Context#### Trạng thái:

│   │   └── types/               # TypeScript Types

│   └── ...- ⚠️ **Authentication đang BỊ TẮT** - Tất cả `[Authorize]` attribute đã bị comment

│- ⚠️ Hiện tại tất cả API đều có thể truy cập mà không cần token

├── migrations/                  # SQL Migrations- ✅ Code JWT đã viết xong, chỉ cần bật lại khi cần

│   ├── 001_add_audit_logs.sql

│   └── 002_remove_ip_useragent.sql#### Validation:

│

├── docker-compose.yml           # Docker Compose Config- ✅ Kiểm tra username đã tồn tại

├── START_DOCKER.bat            # Script khởi động- ✅ Mã hóa password

├── STOP_DOCKER.bat             # Script dừng- ❌ **Chưa validate**:

└── README.md                   # File README chính  - Password strength (min 6 ký tự, có chữ hoa, số, ký tự đặc biệt)

```  - Username format (không khoảng trắng, ký tự đặc biệt)

  - Email format

---  - Username không trùng



## 📝 NOTES#### Audit Log:



### Authentication- ❌ **Chưa có audit log** cho User actions (login, logout, register)

- Hiện tại đang **TẮT** authentication để dễ test

- Tất cả `[Authorize]` attribute đã được comment#### API Endpoints:

- Muốn BẬT lại: Bỏ comment `[Authorize]` trong các Controller

````

### DatabasePOST /api/auth/login - Đăng nhập

- MySQL 8.0POST /api/auth/register - Đăng ký

- Character set: utf8mb4

- Collation: utf8mb4_unicode_ciGET /api/users - Lấy danh sách user

- Hỗ trợ tiếng ViệtPOST /api/users - Thêm user

PUT /api/users/{id} - Cập nhật user

### Soft Delete LogicDELETE /api/users/{id} - Xóa user

- **Product**: Có trong Order/PO → soft delete, không có → hard deletePUT /api/users/{id}/password - Đổi mật khẩu

- **Category**: Có Product liên quan → soft delete, không có → hard delete```

- **Supplier**: Có Product/PO liên quan → soft delete, không có → hard delete

- **Các module khác**: Chưa implement soft delete---

### Audit Log### ✅ 11. AUDIT LOG (Lịch sử thao tác)

- Chỉ có **Product** đã được implement audit log

- Lưu thông tin: action, entity, changes, user, timestamp#### Chức năng đã làm:

- Chưa có IP address và User-Agent (đã xóa trong migration 002)

- ✅ **Ghi log tự động**

--- - ✅ Ghi log cho Product (CREATE, UPDATE, DELETE)

- ✅ Lưu thông tin: userId, username, action, entityType, entityId, changes, timestamp

## 🎯 ROADMAP- ✅ **Xem audit log**

- ✅ Xem tất cả audit logs (có filter)

### Phase 1: Hoàn thiện Backend (Hiện tại) - ✅ Xem log theo entity (Product, Order, v.v.)

- [ ] Thêm Audit Log cho tất cả modules - ✅ Xem log theo user

- [ ] Thêm Soft Delete cho tất cả modules cần thiết - ✅ Xem chi tiết 1 log

- [ ] Thêm Validation đầy đủ - ✅ Xem tổng kết hoạt động (summary)

- [ ] Implement Barcode module - ✅ Xem hoạt động của chính mình (my-activities)

- [ ] Viết Unit Tests- ✅ **Filter**

  - ✅ Lọc theo entityType

### Phase 2: Phát triển Frontend - ✅ Lọc theo action (CREATE, UPDATE, DELETE)

- [ ] Hoàn thiện tất cả trang CRUD - ✅ Lọc theo userId

- [ ] Implement Authentication UI - ✅ Lọc theo khoảng thời gian

- [ ] Dashboard & Analytics

- [ ] Responsive design#### Trạng thái:

### Phase 3: Tính năng nâng cao- ✅ **Đã hoàn thành** cho Product

- [ ] Reports & Export- ❌ **Chưa áp dụng** cho: Category, Customer, Supplier, Order, PurchaseOrder, Warehouse, Inventory, Promotion, User

- [ ] Real-time notifications

- [ ] File upload#### Thông tin được lưu:

- [ ] Email service

- [ ] Advanced search & filtering```json

{

### Phase 4: Production Ready "auditLogId": 1,

- [ ] Performance optimization "entityType": "Product",

- [ ] Security hardening "entityId": 123,

- [ ] Logging & Monitoring "action": "UPDATE",

- [ ] Deployment guide "userId": 1,

- [ ] User documentation "username": "admin",

  "changes": "{\"Price\":{\"Old\":100000,\"New\":120000}}",

--- "timestamp": "2025-10-13T10:30:00"

}

**Cập nhật lần cuối**: 13/10/2025 ```

**Phiên bản**: 1.0.0

**Trạng thái**: Đang phát triển 🚧#### API Endpoints:

```
GET /api/auditlogs                         - Lấy tất cả logs (có filter)
GET /api/auditlogs/{id}                    - Chi tiết 1 log
GET /api/auditlogs/entity/{type}/{id}      - Logs theo entity
GET /api/auditlogs/user/{userId}           - Logs theo user
GET /api/auditlogs/summary                 - Tổng kết hoạt động
GET /api/auditlogs/my-activities           - Hoạt động của tôi
```

---

### ❌ 12. BARCODE (Chưa hoàn thành)

#### Trạng thái:

- ✅ Có file `BarcodeController.cs`
- ❌ **Chưa implement** - Controller rỗng
- ❌ Chưa có service
- ❌ Chưa có chức năng tạo barcode
- ❌ Chưa có chức năng in barcode

---

## 📈 TÌNH TRẠNG HOÀN THÀNH

### Backend API

#### ✅ Hoàn thành 100%

1. **Products** ✅

   - CRUD ✅
   - Soft Delete ✅
   - Search & Filter ✅
   - Audit Log ✅
   - Validation cơ bản ✅

2. **Authentication** ✅

   - Login/Register ✅
   - JWT Token ✅
   - Password Hashing ✅
   - (Đang tắt để test)

3. **Audit Logs** ✅
   - Ghi log cho Product ✅
   - Xem & Filter logs ✅
   - API hoàn chỉnh ✅

#### ✅ Hoàn thành 80-90%

4. **Orders** ✅⚠️

   - CRUD ✅
   - Xử lý đơn hàng ✅
   - Trừ tồn kho ✅
   - ❌ Chưa có audit log
   - ❌ Chưa có soft delete
   - ❌ Chưa validate đầy đủ

5. **Purchase Orders** ✅⚠️

   - CRUD ✅
   - Xử lý nhập hàng ✅
   - ❌ Chưa có audit log
   - ❌ Chưa có soft delete
   - ❌ Chưa validate đầy đủ

6. **Inventory** ✅⚠️

   - Xem tồn kho ✅
   - Nhập kho ✅
   - Tính toán lại ✅
   - ❌ Chưa có audit log

7. **Promotions** ✅⚠️
   - CRUD ✅
   - Validate promotion ✅
   - Tự động cập nhật status ✅
   - ❌ Chưa có audit log
   - ❌ Chưa validate đầy đủ

#### ✅ Hoàn thành 70%

8. **Categories** ✅⚠️

   - CRUD ✅
   - Soft Delete thông minh ✅
   - Restore ✅
   - ❌ Chưa có audit log
   - ❌ Chưa validate

9. **Suppliers** ✅⚠️
   - CRUD ✅
   - Soft Delete thông minh ✅
   - Restore ✅
   - ❌ Chưa có audit log
   - ❌ Chưa validate

#### ⚠️ Hoàn thành 50%

10. **Customers** ⚠️

    - CRUD cơ bản ✅
    - ❌ Chưa có audit log
    - ❌ Chưa có soft delete
    - ❌ Chưa validate

11. **Warehouses** ⚠️

    - CRUD cơ bản ✅
    - ❌ Chưa có audit log
    - ❌ Chưa có soft delete
    - ❌ Chưa validate

12. **Users** ⚠️
    - CRUD ✅
    - ❌ Chưa có audit log
    - ❌ Chưa validate password strength

#### ❌ Chưa làm (0%)

13. **Barcode** ❌

    - Tạo barcode
    - In barcode
    - Scan barcode

14. **Reports/Analytics** ❌
    - Báo cáo doanh thu
    - Báo cáo tồn kho
    - Báo cáo bán hàng
    - Dashboard

### Frontend

#### ⚠️ Đang phát triển (20%)

- ✅ Cấu trúc project setup
- ✅ Routing cơ bản
- ✅ API service layer
- ⚠️ UI Components (đang làm)
- ⚠️ State Management
- ❌ Chưa có trang nào hoàn chỉnh

---

## 📊 TỔNG KẾT

### Đã hoàn thành ✅

- ✅ Backend API cơ bản (9/13 modules = 69%)
- ✅ Database schema & migrations
- ✅ Docker setup
- ✅ Authentication (đang tắt)
- ✅ Soft Delete cho Product, Category, Supplier
- ✅ Audit Log cho Product
- ✅ JWT Token
- ✅ Repository Pattern
- ✅ Service Layer
- ✅ DTOs
- ✅ Error Handling cơ bản

### Đang làm ⚠️

- ⚠️ Frontend React (20%)
- ⚠️ Validation toàn diện
- ⚠️ Audit Log cho tất cả modules

### Chưa làm ❌

- ❌ Audit Log cho: Category, Customer, Supplier, Order, PurchaseOrder, Warehouse, Inventory, Promotion, User
- ❌ Soft Delete cho: Customer, Warehouse, Order, PurchaseOrder
- ❌ Validation chi tiết cho tất cả modules
- ❌ Barcode module
- ❌ Reports & Analytics
- ❌ Unit Tests
- ❌ Integration Tests
- ❌ API Documentation (Swagger đã có nhưng chưa mô tả chi tiết)
- ❌ Logging (ngoài Audit Log)
- ❌ Error Handling toàn diện
- ❌ Rate Limiting
- ❌ Caching
- ❌ File Upload (hình ảnh sản phẩm)
- ❌ Export Excel/PDF
- ❌ Email notifications
- ❌ Real-time updates (SignalR)

---

## 🔧 CẤU TRÚC DỰ ÁN

```
ProjectCuaHangBanLe/
├── StoreManagementAPI/          # Backend .NET API
│   ├── Controllers/             # API Controllers
│   ├── Services/                # Business Logic
│   ├── Repositories/            # Data Access
│   ├── Models/                  # Database Models
│   ├── DTOs/                    # Data Transfer Objects
│   ├── Data/                    # DbContext
│   └── Migrations/              # EF Migrations
│
├── store-management-frontend/   # Frontend React
│   ├── src/
│   │   ├── components/          # UI Components
│   │   ├── pages/               # Page Components
│   │   ├── services/            # API Services
│   │   ├── context/             # React Context
│   │   └── types/               # TypeScript Types
│   └── ...
│
├── migrations/                  # SQL Migrations
│   ├── 001_add_audit_logs.sql
│   └── 002_remove_ip_useragent.sql
│
├── docker-compose.yml           # Docker Compose Config
├── START_DOCKER.bat            # Script khởi động
├── STOP_DOCKER.bat             # Script dừng
└── README.md                   # File này
```

---

## 📝 NOTES

### Authentication

- Hiện tại đang **TẮT** authentication để dễ test
- Tất cả `[Authorize]` attribute đã được comment
- Muốn BẬT lại: Bỏ comment `[Authorize]` trong các Controller

### Database

- MySQL 8.0
- Character set: utf8mb4
- Collation: utf8mb4_unicode_ci
- Hỗ trợ tiếng Việt

### Soft Delete Logic

- **Product**: Có trong Order/PO → soft delete, không có → hard delete
- **Category**: Có Product liên quan → soft delete, không có → hard delete
- **Supplier**: Có Product/PO liên quan → soft delete, không có → hard delete
- **Các module khác**: Chưa implement soft delete

### Audit Log

- Chỉ có **Product** đã được implement audit log
- Lưu thông tin: action, entity, changes, user, timestamp
- Chưa có IP address và User-Agent (đã xóa trong migration 002)

---

## 🎯 ROADMAP

### Phase 1: Hoàn thiện Backend (Hiện tại)

- [ ] Thêm Audit Log cho tất cả modules
- [ ] Thêm Soft Delete cho tất cả modules cần thiết
- [ ] Thêm Validation đầy đủ
- [ ] Implement Barcode module
- [ ] Viết Unit Tests

### Phase 2: Phát triển Frontend

- [ ] Hoàn thiện tất cả trang CRUD
- [ ] Implement Authentication UI
- [ ] Dashboard & Analytics
- [ ] Responsive design

### Phase 3: Tính năng nâng cao

- [ ] Reports & Export
- [ ] Real-time notifications
- [ ] File upload
- [ ] Email service
- [ ] Advanced search & filtering

### Phase 4: Production Ready

- [ ] Performance optimization
- [ ] Security hardening
- [ ] Logging & Monitoring
- [ ] Deployment guide
- [ ] User documentation

---

## 📞 LIÊN HỆ & HỖ TRỢ

Nếu có vấn đề, tham khảo các file hướng dẫn khác:

- `DEVELOPER_SETUP_GUIDE.md` - Hướng dẫn setup môi trường
- `DATABASE_MIGRATION_GUIDE.md` - Hướng dẫn migration
- `AUDIT_LOG_COMPLETE_GUIDE.md` - Hướng dẫn audit log
- `FRONTEND_AUDIT_LOG_GUIDE.md` - Hướng dẫn audit log frontend

---

**Cập nhật lần cuối**: 13/10/2025
**Phiên bản**: 1.0.0
**Trạng thái**: Đang phát triển 🚧
