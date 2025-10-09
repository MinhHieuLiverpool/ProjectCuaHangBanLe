using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;

namespace StoreManagementAPI.Services
{
    public interface IOrderService
    {
        Task<OrderResponseDto?> CreateOrderAsync(CreateOrderDto dto);
        Task<OrderResponseDto?> GetOrderByIdAsync(int id);
        Task<IEnumerable<OrderResponseDto>> GetAllOrdersAsync();
        Task<bool> UpdateOrderStatusAsync(int orderId, string status);
        Task<bool> ProcessPaymentAsync(PaymentDto dto);
    }

    public class OrderService : IOrderService
    {
        private readonly StoreDbContext _context;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;
        private readonly IRepository<Payment> _paymentRepository;
        private readonly IRepository<Inventory> _inventoryRepository;
        private readonly IRepository<Promotion> _promotionRepository;

        public OrderService(
            StoreDbContext context,
            IRepository<Order> orderRepository,
            IRepository<OrderItem> orderItemRepository,
            IRepository<Payment> paymentRepository,
            IRepository<Inventory> inventoryRepository,
            IRepository<Promotion> promotionRepository)
        {
            _context = context;
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _paymentRepository = paymentRepository;
            _inventoryRepository = inventoryRepository;
            _promotionRepository = promotionRepository;
        }

        public async Task<OrderResponseDto?> CreateOrderAsync(CreateOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create order
                var order = new Order
                {
                    CustomerId = dto.CustomerId,
                    UserId = dto.UserId,
                    Status = "pending",
                    OrderDate = DateTime.Now
                };

                decimal totalAmount = 0;

                // Add order items
                var orderItems = new List<OrderItem>();
                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null) continue;

                    // Check inventory
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.ProductId == item.ProductId);
                    
                    if (inventory == null || inventory.Quantity < item.Quantity)
                    {
                        throw new Exception($"Insufficient stock for product {product.ProductName}");
                    }

                    var subtotal = product.Price * item.Quantity;
                    totalAmount += subtotal;

                    var orderItem = new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Price = product.Price,
                        Subtotal = subtotal
                    };
                    orderItems.Add(orderItem);

                    // Update inventory
                    inventory.Quantity -= item.Quantity;
                    inventory.UpdatedAt = DateTime.Now;
                }

                order.TotalAmount = totalAmount;

                // Apply promotion if provided
                if (!string.IsNullOrEmpty(dto.PromoCode))
                {
                    var promotions = await _promotionRepository.FindAsync(p => 
                        p.PromoCode == dto.PromoCode && 
                        p.Status == "active" &&
                        p.StartDate <= DateTime.Now &&
                        p.EndDate >= DateTime.Now);
                    
                    var promotion = promotions.FirstOrDefault();
                    
                    if (promotion != null && totalAmount >= promotion.MinOrderAmount)
                    {
                        if (promotion.UsageLimit == 0 || promotion.UsedCount < promotion.UsageLimit)
                        {
                            decimal discount = 0;
                            if (promotion.DiscountType == "percent")
                            {
                                discount = totalAmount * (promotion.DiscountValue / 100);
                            }
                            else // fixed
                            {
                                discount = promotion.DiscountValue;
                            }

                            order.DiscountAmount = discount;
                            order.PromoId = promotion.PromoId;
                            promotion.UsedCount++;
                        }
                    }
                }

                var createdOrder = await _orderRepository.AddAsync(order);

                // Add order items with order id
                foreach (var item in orderItems)
                {
                    item.OrderId = createdOrder.OrderId;
                    await _orderItemRepository.AddAsync(item);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetOrderByIdAsync(createdOrder.OrderId);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<OrderResponseDto?> GetOrderByIdAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null) return null;

            var payment = order.Payments.FirstOrDefault();

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer?.Name,
                UserId = order.UserId,
                UserName = order.User?.FullName,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.TotalAmount - order.DiscountAmount,
                PaymentMethod = payment?.PaymentMethod,
                PaymentDate = payment?.PaymentDate,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    ProductId = oi.ProductId ?? 0,
                    ProductName = oi.Product?.ProductName ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Subtotal
                }).ToList()
            };
        }

        public async Task<IEnumerable<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Payments)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(order => new OrderResponseDto
            {
                OrderId = order.OrderId,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer?.Name,
                UserId = order.UserId,
                UserName = order.User?.FullName,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.TotalAmount - order.DiscountAmount,
                PaymentMethod = order.Payments.FirstOrDefault()?.PaymentMethod,
                PaymentDate = order.Payments.FirstOrDefault()?.PaymentDate,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    ProductId = oi.ProductId ?? 0,
                    ProductName = oi.Product?.ProductName ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Subtotal
                }).ToList()
            });
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null) return false;

            order.Status = status;
            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> ProcessPaymentAsync(PaymentDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            if (order == null) return false;

            var payment = new Payment
            {
                OrderId = dto.OrderId,
                Amount = dto.Amount,
                PaymentMethod = dto.PaymentMethod,
                PaymentDate = DateTime.Now
            };

            await _paymentRepository.AddAsync(payment);

            // Update order status
            order.Status = "paid";
            await _orderRepository.UpdateAsync(order);

            return true;
        }
    }
}
