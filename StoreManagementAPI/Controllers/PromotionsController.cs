// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using StoreManagementAPI.Services;
using System.Security.Claims;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] - BỎ AUTHENTICATION
    public class PromotionsController : ControllerBase
    {
        private readonly IRepository<Promotion> _promotionRepository;
        private readonly IRepository<PromotionProduct> _promotionProductRepository;
        private readonly IPromotionService _promotionService;
        private readonly StoreDbContext _context;        private readonly IHttpContextAccessor _httpContextAccessor;

        public PromotionsController(
            IRepository<Promotion> promotionRepository,
            IRepository<PromotionProduct> promotionProductRepository,
            IPromotionService promotionService,
            StoreDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _promotionRepository = promotionRepository;
            _promotionProductRepository = promotionProductRepository;
            _promotionService = promotionService;
            _context = context;            _httpContextAccessor = httpContextAccessor;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null ? int.Parse(userIdClaim) : null;
        }

        private (int? userId, string? username) GetAuditInfo()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return (1, "admin"); // Default to admin user (id=1)

            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usernameClaim = httpContext.User.FindFirst(ClaimTypes.Name)?.Value;

            int? userId = null;
            if (int.TryParse(userIdClaim, out int parsedUserId))
                userId = parsedUserId;

            var username = !string.IsNullOrEmpty(usernameClaim) ? usernameClaim : "admin";
            var finalUserId = userId ?? 1;

            return (finalUserId, username);
        }

        [HttpGet]
        // [AllowAnonymous] - B? AUTHENTICATION
        public async Task<ActionResult<IEnumerable<PromotionDto>>> GetAll()
        {
            // Cập nhật trạng thái tất cả promotion trước khi trả về
            await _promotionService.UpdateAllPromotionStatusesAsync();

            var promotions = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .ThenInclude(pp => pp.Product)
                .ToListAsync();

            var promotionDtos = promotions.Select(p => new PromotionDto
            {
                PromoId = p.PromoId,
                PromoCode = p.PromoCode,
                Description = p.Description,
                DiscountType = p.DiscountType,
                DiscountValue = p.DiscountValue,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                MinOrderAmount = p.MinOrderAmount,
                UsageLimit = p.UsageLimit,
                UsedCount = p.UsedCount,
                Status = p.Status,
                ApplyType = p.ApplyType,
                Products = p.PromotionProducts.Select(pp => new ProductSimpleDto
                {
                    ProductId = pp.ProductId,
                    ProductName = pp.Product?.ProductName ?? ""
                }).ToList()
            }).ToList();

            return Ok(promotionDtos);
        }

        [HttpGet("active")]
        // [AllowAnonymous] - B? AUTHENTICATION
        public async Task<ActionResult<IEnumerable<Promotion>>> GetActive()
        {
            var promotions = await _promotionRepository.FindAsync(p => 
                p.Status == "active" && 
                p.StartDate <= DateTime.Now && 
                p.EndDate >= DateTime.Now);
            return Ok(promotions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PromotionDto>> GetById(int id)
        {
            var promotion = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .ThenInclude(pp => pp.Product)
                .FirstOrDefaultAsync(p => p.PromoId == id);

            if (promotion == null) return NotFound();

            var promotionDto = new PromotionDto
            {
                PromoId = promotion.PromoId,
                PromoCode = promotion.PromoCode,
                Description = promotion.Description,
                DiscountType = promotion.DiscountType,
                DiscountValue = promotion.DiscountValue,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                MinOrderAmount = promotion.MinOrderAmount,
                UsageLimit = promotion.UsageLimit,
                UsedCount = promotion.UsedCount,
                Status = promotion.Status,
                ApplyType = promotion.ApplyType,
                Products = promotion.PromotionProducts.Select(pp => new ProductSimpleDto
                {
                    ProductId = pp.ProductId,
                    ProductName = pp.Product?.ProductName ?? "",
                    Price = pp.Product?.Price ?? 0
                }).ToList()
            };

            return Ok(promotionDto);
        }

        [HttpGet("code/{code}")]
        // [AllowAnonymous] - B? AUTHENTICATION
        public async Task<ActionResult<Promotion>> GetByCode(string code)
        {
            var promotions = await _promotionRepository.FindAsync(p => p.PromoCode == code);
            var promotion = promotions.FirstOrDefault();
            if (promotion == null) return NotFound();
            return Ok(promotion);
        }

        [HttpPost]
        public async Task<ActionResult<PromotionDto>> Create([FromBody] CreatePromotionDto createDto)
        {
            // Tạo Promotion mới
            var promotion = new Promotion
            {
                PromoCode = createDto.PromoCode,
                Description = createDto.Description,
                DiscountType = createDto.DiscountType,
                DiscountValue = createDto.DiscountValue,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                MinOrderAmount = createDto.MinOrderAmount,
                UsageLimit = createDto.UsageLimit ?? 0,
                UsedCount = 0,
                Status = "active",
                ApplyType = createDto.ApplyType
            };

            var created = await _promotionRepository.AddAsync(promotion);

            // Thêm PromotionProducts nếu có ProductIds
            if (createDto.ProductIds != null && createDto.ProductIds.Any())
            {
                foreach (var productId in createDto.ProductIds)
                {
                    var promotionProduct = new PromotionProduct
                    {
                        PromoId = created.PromoId,
                        ProductId = productId,
                        CreatedAt = DateTime.Now
                    };
                    await _context.PromotionProducts.AddAsync(promotionProduct);
                }
                await _context.SaveChangesAsync();
            }

            // Lấy lại promotion với đầy đủ thông tin
            var promotionWithProducts = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .ThenInclude(pp => pp.Product)
                .FirstOrDefaultAsync(p => p.PromoId == created.PromoId);

            var promotionDto = new PromotionDto
            {
                PromoId = promotionWithProducts!.PromoId,
                PromoCode = promotionWithProducts.PromoCode,
                Description = promotionWithProducts.Description,
                DiscountType = promotionWithProducts.DiscountType,
                DiscountValue = promotionWithProducts.DiscountValue,
                StartDate = promotionWithProducts.StartDate,
                EndDate = promotionWithProducts.EndDate,
                MinOrderAmount = promotionWithProducts.MinOrderAmount,
                UsageLimit = promotionWithProducts.UsageLimit,
                UsedCount = promotionWithProducts.UsedCount,
                Status = promotionWithProducts.Status,
                ApplyType = promotionWithProducts.ApplyType,
                Products = promotionWithProducts.PromotionProducts.Select(pp => new ProductSimpleDto
                {
                    ProductId = pp.ProductId,
                    ProductName = pp.Product?.ProductName ?? "",
                    Price = pp.Product?.Price ?? 0
                }).ToList()
            };            return CreatedAtAction(nameof(GetById), new { id = created.PromoId }, promotionDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PromotionDto>> Update(int id, [FromBody] UpdatePromotionDto updateDto)
        {
            var existing = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .FirstOrDefaultAsync(p => p.PromoId == id);

            if (existing == null) return NotFound();

            // Lưu giá trị cũ để audit
            var oldValues = new
            {
                PromoId = existing.PromoId,
                PromoCode = existing.PromoCode,
                Description = existing.Description,
                DiscountType = existing.DiscountType,
                DiscountValue = existing.DiscountValue,
                StartDate = existing.StartDate,
                EndDate = existing.EndDate,
                MinOrderAmount = existing.MinOrderAmount,
                UsageLimit = existing.UsageLimit,
                Status = existing.Status,
                ApplyType = existing.ApplyType,
                ProductIds = existing.PromotionProducts.Select(pp => pp.ProductId).ToList()
            };

            var changes = new List<string>();

            // Cập nhật các trường nếu có giá trị
            if (!string.IsNullOrEmpty(updateDto.Description) && existing.Description != updateDto.Description)
            {
                changes.Add($"Mô tả: '{existing.Description}' → '{updateDto.Description}'");
                existing.Description = updateDto.Description;
            }

            if (!string.IsNullOrEmpty(updateDto.DiscountType) && existing.DiscountType != updateDto.DiscountType)
            {
                var oldTypeText = existing.DiscountType == "percentage" ? "Phần trăm" : "Giá trị cố định";
                var newTypeText = updateDto.DiscountType == "percentage" ? "Phần trăm" : "Giá trị cố định";
                changes.Add($"Loại giảm giá: {oldTypeText} → {newTypeText}");
                existing.DiscountType = updateDto.DiscountType;
            }

            if (updateDto.DiscountValue.HasValue && existing.DiscountValue != updateDto.DiscountValue.Value)
            {
                changes.Add($"Giá trị giảm: {existing.DiscountValue} → {updateDto.DiscountValue.Value}");
                existing.DiscountValue = updateDto.DiscountValue.Value;
            }

            if (updateDto.EndDate.HasValue && existing.EndDate != updateDto.EndDate.Value)
            {
                changes.Add($"Ngày kết thúc: {existing.EndDate:dd/MM/yyyy} → {updateDto.EndDate.Value:dd/MM/yyyy}");
                existing.EndDate = updateDto.EndDate.Value;
            }

            if (updateDto.MinOrderAmount.HasValue && existing.MinOrderAmount != updateDto.MinOrderAmount.Value)
            {
                changes.Add($"Giá trị đơn hàng tối thiểu: {existing.MinOrderAmount:N0} → {updateDto.MinOrderAmount.Value:N0} VNĐ");
                existing.MinOrderAmount = updateDto.MinOrderAmount.Value;
            }

            if (!string.IsNullOrEmpty(updateDto.Status) && existing.Status != updateDto.Status)
            {
                changes.Add($"Trạng thái: {existing.Status} → {updateDto.Status}");
                existing.Status = updateDto.Status;
            }

            // Cập nhật ApplyType
            if (!string.IsNullOrEmpty(updateDto.ApplyType) && existing.ApplyType != updateDto.ApplyType)
            {
                var oldApplyText = existing.ApplyType == "all" ? "Tất cả sản phẩm" : "Sản phẩm cụ thể";
                var newApplyText = updateDto.ApplyType == "all" ? "Tất cả sản phẩm" : "Sản phẩm cụ thể";
                changes.Add($"Áp dụng cho: {oldApplyText} → {newApplyText}");
                existing.ApplyType = updateDto.ApplyType;
            }

            // Cập nhật PromotionProducts nếu ProductIds thay đổi
            if (updateDto.ProductIds != null)
            {
                // Xóa tất cả PromotionProducts cũ
                var existingPromotionProducts = await _context.PromotionProducts
                    .Where(pp => pp.PromoId == id)
                    .ToListAsync();

                var oldProductIds = existingPromotionProducts.Select(pp => pp.ProductId).OrderBy(x => x).ToList();
                var newProductIds = updateDto.ProductIds.OrderBy(x => x).ToList();

                if (!oldProductIds.SequenceEqual(newProductIds))
                {
                    changes.Add($"Sản phẩm áp dụng: {oldProductIds.Count} sản phẩm → {newProductIds.Count} sản phẩm");
                }

                _context.PromotionProducts.RemoveRange(existingPromotionProducts);
                await _context.SaveChangesAsync();

                // Thêm PromotionProducts mới
                if (updateDto.ProductIds.Any())
                {
                    foreach (var productId in updateDto.ProductIds)
                    {
                        var promotionProduct = new PromotionProduct
                        {
                            PromoId = id,
                            ProductId = productId,
                            CreatedAt = DateTime.Now
                        };
                        await _context.PromotionProducts.AddAsync(promotionProduct);
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Lấy lại promotion với đầy đủ thông tin
            var updatedPromotion = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .ThenInclude(pp => pp.Product)
                .FirstOrDefaultAsync(p => p.PromoId == id);

            var promotionDto = new PromotionDto
            {
                PromoId = updatedPromotion!.PromoId,
                PromoCode = updatedPromotion.PromoCode,
                Description = updatedPromotion.Description,
                DiscountType = updatedPromotion.DiscountType,
                DiscountValue = updatedPromotion.DiscountValue,
                StartDate = updatedPromotion.StartDate,
                EndDate = updatedPromotion.EndDate,
                MinOrderAmount = updatedPromotion.MinOrderAmount,
                UsageLimit = updatedPromotion.UsageLimit,
                UsedCount = updatedPromotion.UsedCount,
                Status = updatedPromotion.Status,
                ApplyType = updatedPromotion.ApplyType,
                Products = updatedPromotion.PromotionProducts.Select(pp => new ProductSimpleDto
                {
                    ProductId = pp.ProductId,
                    ProductName = pp.Product?.ProductName ?? "",
                    Price = pp.Product?.Price ?? 0
                }).ToList()
            };

            return Ok(promotionDto);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            // Lấy thông tin promotion trước khi xóa
            var promotion = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .FirstOrDefaultAsync(p => p.PromoId == id);

            if (promotion == null) return NotFound();

            var promotionInfo = new
            {
                PromoId = promotion.PromoId,
                PromoCode = promotion.PromoCode,
                Description = promotion.Description,
                DiscountType = promotion.DiscountType,
                DiscountValue = promotion.DiscountValue,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                MinOrderAmount = promotion.MinOrderAmount,
                UsageLimit = promotion.UsageLimit,
                UsedCount = promotion.UsedCount,
                Status = promotion.Status,
                ApplyType = promotion.ApplyType,
                ProductCount = promotion.PromotionProducts.Count
            };

            var result = await _promotionRepository.DeleteAsync(id);
            if (!result) return NotFound();            return Ok(new { message = "Promotion deleted successfully" });
        }
    }
}
