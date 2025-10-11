using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;

namespace StoreManagementAPI.Services
{
    public interface IInventoryService
    {
        Task<List<InventoryResponseDto>> GetAllInventory();
        Task<List<InventoryResponseDto>> GetInventoryByWarehouse(int warehouseId);
        Task<InventoryResponseDto> AddStock(StockReceiptDto dto);
    }

    public class InventoryService : IInventoryService
    {
        private readonly StoreDbContext _context;

        public InventoryService(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<List<InventoryResponseDto>> GetAllInventory()
        {
            var inventories = await _context.Inventories
                .Include(i => i.Product)
                .OrderByDescending(i => i.UpdatedAt)
                .Select(i => new InventoryResponseDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    ProductName = i.Product.ProductName,
                    Quantity = i.Quantity,
                    UpdatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return inventories;
        }

        public async Task<List<InventoryResponseDto>> GetInventoryByWarehouse(int warehouseId)
        {
            var inventories = await _context.Inventories
                .Include(i => i.Product)
                .Where(i => i.WarehouseId == warehouseId)
                .OrderByDescending(i => i.UpdatedAt)
                .Select(i => new InventoryResponseDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    ProductName = i.Product.ProductName,
                    Quantity = i.Quantity,
                    UpdatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return inventories;
        }

        public async Task<InventoryResponseDto> AddStock(StockReceiptDto dto)
        {
            // Validate product exists
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
            {
                throw new Exception("Sản phẩm không tồn tại");
            }

            if (dto.Quantity <= 0)
            {
                throw new Exception("Số lượng phải lớn hơn 0");
            }

            // Check if inventory exists
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.ProductId == dto.ProductId);

            if (inventory == null)
            {
                // Create new inventory
                inventory = new Inventory
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    UpdatedAt = DateTime.Now
                };
                _context.Inventories.Add(inventory);
            }
            else
            {
                // Update existing inventory
                inventory.Quantity += dto.Quantity;
                inventory.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            // Return updated inventory with product info
            var updatedInventory = await _context.Inventories
                .Include(i => i.Product)
                .FirstOrDefaultAsync(i => i.InventoryId == inventory.InventoryId);

            return new InventoryResponseDto
            {
                InventoryId = updatedInventory!.InventoryId,
                ProductId = updatedInventory.ProductId,
                ProductName = updatedInventory.Product.ProductName,
                Quantity = updatedInventory.Quantity,
                UpdatedAt = updatedInventory.UpdatedAt
            };
        }
    }
}
