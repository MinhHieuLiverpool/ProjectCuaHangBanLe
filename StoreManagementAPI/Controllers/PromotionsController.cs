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
        private readonly StoreDbContext _context;

        public PromotionsController(
            IRepository<Promotion> promotionRepository,
            IRepository<PromotionProduct> promotionProductRepository,
            IPromotionService promotionService,
            StoreDbContext context)
        {
            _promotionRepository = promotionRepository;
            _promotionProductRepository = promotionProductRepository;
            _promotionService = promotionService;
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null ? int.Parse(userIdClaim) : null;
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
            };

            return CreatedAtAction(nameof(GetById), new { id = created.PromoId }, promotionDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PromotionDto>> Update(int id, [FromBody] UpdatePromotionDto updateDto)
        {
            var existing = await _context.Promotions
                .Include(p => p.PromotionProducts)
                .FirstOrDefaultAsync(p => p.PromoId == id);

            if (existing == null) return NotFound();

            // Cập nhật các trường nếu có giá trị
            if (!string.IsNullOrEmpty(updateDto.Description))
                existing.Description = updateDto.Description;

            if (!string.IsNullOrEmpty(updateDto.DiscountType))
                existing.DiscountType = updateDto.DiscountType;

            if (updateDto.DiscountValue.HasValue)
                existing.DiscountValue = updateDto.DiscountValue.Value;

            if (updateDto.EndDate.HasValue)
                existing.EndDate = updateDto.EndDate.Value;

            if (updateDto.MinOrderAmount.HasValue)
                existing.MinOrderAmount = updateDto.MinOrderAmount.Value;

            if (!string.IsNullOrEmpty(updateDto.Status))
                existing.Status = updateDto.Status;

            // Cập nhật ApplyType
            if (!string.IsNullOrEmpty(updateDto.ApplyType))
                existing.ApplyType = updateDto.ApplyType;

            // Cập nhật PromotionProducts nếu ProductIds thay đổi
            if (updateDto.ProductIds != null)
            {
                // Xóa tất cả PromotionProducts cũ
                var existingPromotionProducts = await _context.PromotionProducts
                    .Where(pp => pp.PromoId == id)
                    .ToListAsync();

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
            var result = await _promotionRepository.DeleteAsync(id);
            if (!result) return NotFound();

            return Ok(new { message = "Promotion deleted successfully" });
        }
    }
}
