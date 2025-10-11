using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;

namespace StoreManagementAPI.Services
{
    public interface IPurchaseOrderService
    {
        Task<List<PurchaseOrderResponseDto>> GetAllPurchaseOrders();
        Task<PurchaseOrderResponseDto?> GetPurchaseOrderById(int purchaseId);
        Task<PurchaseOrderResponseDto> CreatePurchaseOrder(CreatePurchaseOrderDto dto, int userId);
        Task<PurchaseOrderResponseDto> UpdatePurchaseOrderStatus(int purchaseId, string status);
        Task<bool> DeletePurchaseOrder(int purchaseId);
    }

    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly StoreDbContext _context;

        public PurchaseOrderService(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<List<PurchaseOrderResponseDto>> GetAllPurchaseOrders()
        {
            var purchaseOrders = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseItems)
                    .ThenInclude(pi => pi.Product)
                .OrderByDescending(po => po.PurchaseDate)
                .ToListAsync();

            return purchaseOrders.Select(po => MapToResponseDto(po)).ToList();
        }

        public async Task<PurchaseOrderResponseDto?> GetPurchaseOrderById(int purchaseId)
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseItems)
                    .ThenInclude(pi => pi.Product)
                .FirstOrDefaultAsync(po => po.PurchaseId == purchaseId);

            if (purchaseOrder == null)
                return null;

            return MapToResponseDto(purchaseOrder);
        }

        public async Task<PurchaseOrderResponseDto> CreatePurchaseOrder(CreatePurchaseOrderDto dto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create purchase order
                var purchaseOrder = new PurchaseOrder
                {
                    SupplierId = dto.SupplierId,
                    UserId = userId,
                    WarehouseId = dto.WarehouseId,
                    PurchaseDate = DateTime.Now,
                    Status = "pending",
                    TotalAmount = 0
                };

                _context.PurchaseOrders.Add(purchaseOrder);
                await _context.SaveChangesAsync();

                // Add purchase items
                decimal totalAmount = 0;
                foreach (var item in dto.Items)
                {
                    var subtotal = item.Quantity * item.CostPrice;
                    totalAmount += subtotal;

                    var purchaseItem = new PurchaseItem
                    {
                        PurchaseId = purchaseOrder.PurchaseId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        CostPrice = item.CostPrice,
                        Subtotal = subtotal
                    };

                    _context.PurchaseItems.Add(purchaseItem);

                    // Update product cost price
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.CostPrice = item.CostPrice;
                    }

                    // TỰ ĐỘNG CẬP NHẬT TỒN KHO NGAY KHI TẠO PHIẾU NHẬP
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.ProductId == item.ProductId && i.WarehouseId == dto.WarehouseId);

                    if (inventory != null)
                    {
                        // Update existing inventory
                        inventory.Quantity += item.Quantity;
                        inventory.UpdatedAt = DateTime.Now;
                    }
                    else
                    {
                        // Create new inventory record for this warehouse
                        var newInventory = new Inventory
                        {
                            ProductId = item.ProductId,
                            WarehouseId = dto.WarehouseId,
                            Quantity = item.Quantity,
                            UpdatedAt = DateTime.Now
                        };
                        _context.Inventories.Add(newInventory);
                    }
                }

                // Update total amount
                purchaseOrder.TotalAmount = totalAmount;
                
                // Set status to completed automatically
                purchaseOrder.Status = "completed";
                
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Return the created purchase order
                return (await GetPurchaseOrderById(purchaseOrder.PurchaseId))!;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PurchaseOrderResponseDto> UpdatePurchaseOrderStatus(int purchaseId, string status)
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.PurchaseItems)
                .FirstOrDefaultAsync(po => po.PurchaseId == purchaseId);

            if (purchaseOrder == null)
                throw new Exception("Không tìm thấy phiếu nhập hàng");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                purchaseOrder.Status = status;

                // If status is completed, update inventory in the specified warehouse
                if (status == "completed")
                {
                    foreach (var item in purchaseOrder.PurchaseItems)
                    {
                        // Find inventory for this product in the specified warehouse
                        var inventory = await _context.Inventories
                            .FirstOrDefaultAsync(i => i.ProductId == item.ProductId && i.WarehouseId == purchaseOrder.WarehouseId);

                        if (inventory != null)
                        {
                            // Update existing inventory
                            inventory.Quantity += item.Quantity;
                            inventory.UpdatedAt = DateTime.Now;
                        }
                        else
                        {
                            // Create new inventory record for this warehouse
                            var newInventory = new Inventory
                            {
                                ProductId = item.ProductId,
                                WarehouseId = purchaseOrder.WarehouseId,
                                Quantity = item.Quantity,
                                UpdatedAt = DateTime.Now
                            };
                            _context.Inventories.Add(newInventory);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (await GetPurchaseOrderById(purchaseId))!;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeletePurchaseOrder(int purchaseId)
        {
            var purchaseOrder = await _context.PurchaseOrders
                .FirstOrDefaultAsync(po => po.PurchaseId == purchaseId);

            if (purchaseOrder == null)
                return false;

            if (purchaseOrder.Status == "completed")
                throw new Exception("Không thể xóa phiếu nhập đã hoàn thành");

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();
            return true;
        }

        private PurchaseOrderResponseDto MapToResponseDto(PurchaseOrder po)
        {
            return new PurchaseOrderResponseDto
            {
                PurchaseId = po.PurchaseId,
                SupplierId = po.SupplierId,
                SupplierName = po.Supplier?.Name,
                UserId = po.UserId,
                UserName = po.User?.FullName,
                PurchaseDate = po.PurchaseDate,
                TotalAmount = po.TotalAmount,
                Status = po.Status,
                Items = po.PurchaseItems.Select(pi => new PurchaseItemResponseDto
                {
                    PurchaseItemId = pi.PurchaseItemId,
                    ProductId = pi.ProductId,
                    ProductName = pi.Product?.ProductName,
                    Barcode = pi.Product?.Barcode,
                    Quantity = pi.Quantity,
                    CostPrice = pi.CostPrice,
                    Subtotal = pi.Subtotal
                }).ToList()
            };
        }
    }
}
