using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;

namespace StoreManagementAPI.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto?> GetProductByBarcodeAsync(string barcode);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<bool> UpdateStockAsync(UpdateStockDto dto);
        Task<IEnumerable<ProductHistoryDto>> GetProductHistoryAsync(int productId);
    }

    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Inventory> _inventoryRepository;
        private readonly StoreDbContext _context;

        public ProductService(
            IRepository<Product> productRepository,
            IRepository<Inventory> inventoryRepository,
            StoreDbContext context)
        {
            _productRepository = productRepository;
            _inventoryRepository = inventoryRepository;
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier?.Name,
                ProductName = p.ProductName,
                Barcode = p.Barcode,
                Price = p.Price,
                CostPrice = p.CostPrice,
                Unit = p.Unit,
                Status = p.Status,
                StockQuantity = p.Inventories?.Sum(i => i.Quantity) ?? 0
            });
        }

        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllProductsAsync();
            }

            searchTerm = searchTerm.ToLower().Trim();

            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .Where(p =>
                    p.ProductName.ToLower().Contains(searchTerm) ||
                    (p.Barcode != null && p.Barcode.ToLower().Contains(searchTerm)) ||
                    (p.Category != null && p.Category.CategoryName.ToLower().Contains(searchTerm)) ||
                    (p.Supplier != null && p.Supplier.Name.ToLower().Contains(searchTerm)))
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier?.Name,
                ProductName = p.ProductName,
                Barcode = p.Barcode,
                Price = p.Price,
                CostPrice = p.CostPrice,
                Unit = p.Unit,
                Status = p.Status,
                StockQuantity = p.Inventories?.Sum(i => i.Quantity) ?? 0
            });
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null) return null;

            return new ProductDto
            {
                ProductId = product.ProductId,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName,
                SupplierId = product.SupplierId,
                SupplierName = product.Supplier?.Name,
                ProductName = product.ProductName,
                Barcode = product.Barcode,
                Price = product.Price,
                CostPrice = product.CostPrice,
                Unit = product.Unit,
                Status = product.Status,
                StockQuantity = product.Inventories?.Sum(i => i.Quantity) ?? 0
            };
        }

        public async Task<ProductDto?> GetProductByBarcodeAsync(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
            {
                return null;
            }

            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.Barcode == barcode.Trim());

            if (product == null) return null;

            return new ProductDto
            {
                ProductId = product.ProductId,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName,
                SupplierId = product.SupplierId,
                SupplierName = product.Supplier?.Name,
                ProductName = product.ProductName,
                Barcode = product.Barcode,
                Price = product.Price,
                CostPrice = product.CostPrice,
                Unit = product.Unit,
                Status = product.Status,
                StockQuantity = product.Inventories?.Sum(i => i.Quantity) ?? 0
            };
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            // Tự động tạo barcode nếu không có
            if (string.IsNullOrWhiteSpace(dto.Barcode))
            {
                dto.Barcode = await GenerateNextBarcodeAsync();
            }

            var product = new Product
            {
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                ProductName = dto.ProductName,
                Barcode = dto.Barcode,
                Price = dto.Price,
                CostPrice = dto.CostPrice,
                Unit = dto.Unit,
                CreatedAt = DateTime.Now
            };

            var createdProduct = await _productRepository.AddAsync(product);

            // Tạo inventory với số lượng ban đầu = 0 (sẽ nhập kho sau)
            var inventory = new Inventory
            {
                ProductId = createdProduct.ProductId,
                Quantity = 0 // Sản phẩm mới không có hàng, cần nhập kho
            };
            await _inventoryRepository.AddAsync(inventory);

            return await GetProductByIdAsync(createdProduct.ProductId) ?? new ProductDto();
        }

        private async Task<string> GenerateNextBarcodeAsync()
        {
            // Lấy barcode lớn nhất hiện tại với prefix 890
            var maxBarcode = await _context.Products
                .Where(p => p.Barcode != null && p.Barcode.StartsWith("890") && p.Barcode.Length == 13)
                .Select(p => p.Barcode)
                .OrderByDescending(b => b)
                .FirstOrDefaultAsync();

            long nextNumber;
            if (maxBarcode == null)
            {
                // Bắt đầu từ 8900000000001
                nextNumber = 8900000000001;
            }
            else
            {
                // Tăng lên 1
                if (long.TryParse(maxBarcode, out long currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
                else
                {
                    nextNumber = 8900000000001;
                }
            }

            return nextNumber.ToString("D13"); // Format 13 chữ số
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return null;

            if (dto.CategoryId.HasValue) product.CategoryId = dto.CategoryId;
            if (dto.SupplierId.HasValue) product.SupplierId = dto.SupplierId;
            if (!string.IsNullOrEmpty(dto.ProductName)) product.ProductName = dto.ProductName;
            if (dto.Barcode != null) product.Barcode = dto.Barcode;
            if (dto.Price.HasValue) product.Price = dto.Price.Value;
            if (dto.CostPrice.HasValue) product.CostPrice = dto.CostPrice.Value;
            if (!string.IsNullOrEmpty(dto.Unit)) product.Unit = dto.Unit;
            if (!string.IsNullOrEmpty(dto.Status)) product.Status = dto.Status;

            await _productRepository.UpdateAsync(product);
            return await GetProductByIdAsync(id);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.OrderItems)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null) return false;

            // ktra bán chưa
            if (product.OrderItems != null && product.OrderItems.Any())
            {
                // đã bán => soft delete
                product.Status = "inactive";
                await _productRepository.UpdateAsync(product);
                return true;
            }

            // chua bán => xóa real
            return await _productRepository.DeleteAsync(id);
        }

        public async Task<bool> UpdateStockAsync(UpdateStockDto dto)
        {
            var inventories = await _inventoryRepository.FindAsync(i => i.ProductId == dto.ProductId);
            var inventory = inventories.FirstOrDefault();

            if (inventory == null)
            {
                inventory = new Inventory
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                };
                await _inventoryRepository.AddAsync(inventory);
            }
            else
            {
                inventory.Quantity = dto.Quantity;
                inventory.UpdatedAt = DateTime.Now;
                await _inventoryRepository.UpdateAsync(inventory);
            }

            return true;
        }

        public async Task<IEnumerable<ProductHistoryDto>> GetProductHistoryAsync(int productId)
        {
            var history = new List<ProductHistoryDto>();

            // Lấy lịch sử nhập hàng từ PurchaseOrders
            var purchaseItems = await _context.PurchaseItems
                .Include(pi => pi.PurchaseOrder)
                    .ThenInclude(po => po.Supplier)
                .Include(pi => pi.PurchaseOrder)
                    .ThenInclude(po => po.User)
                .Where(pi => pi.ProductId == productId)
                .OrderByDescending(pi => pi.PurchaseOrder.PurchaseDate)
                .ToListAsync();

            foreach (var item in purchaseItems)
            {
                history.Add(new ProductHistoryDto
                {
                    Id = item.PurchaseOrder.PurchaseId,
                    Type = "purchase",
                    Date = item.PurchaseOrder.PurchaseDate,
                    Quantity = item.Quantity,
                    UnitPrice = item.CostPrice,
                    TotalAmount = item.Subtotal,
                    ReferenceNumber = $"PN{item.PurchaseOrder.PurchaseId:D6}",
                    UserName = item.PurchaseOrder.User?.FullName,
                    SupplierName = item.PurchaseOrder.Supplier?.Name,
                    Notes = null
                });
            }

            // Lấy lịch sử bán hàng từ Orders
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.ProductId == productId && oi.Order != null)
                .ToListAsync();

            // Load related data
            var orderIds = orderItems.Where(oi => oi.Order != null).Select(oi => oi.Order!.OrderId).Distinct().ToList();
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Where(o => orderIds.Contains(o.OrderId))
                .ToDictionaryAsync(o => o.OrderId);

            foreach (var item in orderItems)
            {
                if (item.Order == null || !orders.ContainsKey(item.Order.OrderId)) continue;
                var order = orders[item.Order.OrderId];

                history.Add(new ProductHistoryDto
                {
                    Id = order.OrderId,
                    Type = "sale",
                    Date = order.OrderDate,
                    Quantity = item.Quantity,
                    UnitPrice = item.Price,
                    TotalAmount = item.Subtotal,
                    ReferenceNumber = $"DH{order.OrderId:D6}",
                    UserName = order.User?.FullName,
                    CustomerName = order.Customer?.Name,
                    Notes = null
                });
            }

            // Sắp xếp theo ngày giảm dần
            return history.OrderByDescending(h => h.Date);
        }
    }
}
