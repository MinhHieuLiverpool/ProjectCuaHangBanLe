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
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<bool> UpdateStockAsync(UpdateStockDto dto);
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
                .Include(p => p.Inventory)
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
                Unit = p.Unit,
                Status = p.Status,
                StockQuantity = p.Inventory?.Quantity
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
                .Include(p => p.Inventory)
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
                Unit = p.Unit,
                Status = p.Status,
                StockQuantity = p.Inventory?.Quantity
            });
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventory)
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
                Unit = product.Unit,
                Status = product.Status,
                StockQuantity = product.Inventory?.Quantity
            };
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            var product = new Product
            {
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                ProductName = dto.ProductName,
                Barcode = dto.Barcode,
                Price = dto.Price,
                Unit = dto.Unit
            };

            var createdProduct = await _productRepository.AddAsync(product);

            // Create inventory entry
            var inventory = new Inventory
            {
                ProductId = createdProduct.ProductId,
                Quantity = dto.InitialStock
            };
            await _inventoryRepository.AddAsync(inventory);

            return await GetProductByIdAsync(createdProduct.ProductId) ?? new ProductDto();
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
    }
}
