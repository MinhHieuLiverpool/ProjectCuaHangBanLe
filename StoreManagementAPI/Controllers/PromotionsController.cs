using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using StoreManagementAPI.Services;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class PromotionsController : ControllerBase
    {
        private readonly IRepository<Promotion> _promotionRepository;
        private readonly IPromotionService _promotionService;

        public PromotionsController(
            IRepository<Promotion> promotionRepository,
            IPromotionService promotionService)
        {
            _promotionRepository = promotionRepository;
            _promotionService = promotionService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetAll()
        {
            // Cập nhật trạng thái tất cả khuyến mãi trước khi trả về
            await _promotionService.UpdateAllPromotionStatusesAsync();
            
            var promotions = await _promotionRepository.GetAllAsync();
            return Ok(promotions);
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetActive()
        {
            // Cập nhật trạng thái trước khi lấy danh sách active
            await _promotionService.UpdateAllPromotionStatusesAsync();
            
            var promotions = await _promotionRepository.FindAsync(p => 
                p.Status == "active" && 
                p.StartDate <= DateTime.Now && 
                p.EndDate >= DateTime.Now &&
                p.UsedCount < p.UsageLimit);
            return Ok(promotions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Promotion>> GetById(int id)
        {
            var promotion = await _promotionRepository.GetByIdAsync(id);
            if (promotion == null) return NotFound();
            
            // Cập nhật trạng thái trước khi trả về
            await _promotionService.UpdatePromotionStatusAsync(id);
            promotion = await _promotionRepository.GetByIdAsync(id);
            
            return Ok(promotion);
        }

        [HttpGet("code/{code}")]
        [AllowAnonymous]
        public async Task<ActionResult<Promotion>> GetByCode(string code)
        {
            // Sử dụng service để validate và lấy promotion
            var promotion = await _promotionService.ValidateAndGetPromotionAsync(code);
            
            if (promotion == null) 
                return NotFound(new { message = "Mã khuyến mãi không tồn tại hoặc không còn hiệu lực" });
            
            return Ok(promotion);
        }

        [HttpPost]
        public async Task<ActionResult<Promotion>> Create([FromBody] Promotion promotion)
        {
            var created = await _promotionRepository.AddAsync(promotion);
            return CreatedAtAction(nameof(GetById), new { id = created.PromoId }, created);
        }

        [HttpPost("{id}/apply")]
        [AllowAnonymous]
        public async Task<ActionResult> ApplyPromotion(int id)
        {
            // Validate promotion trước khi áp dụng
            var promotion = await _promotionRepository.GetByIdAsync(id);
            if (promotion == null)
                return NotFound(new { message = "Mã khuyến mãi không tồn tại" });

            // Cập nhật trạng thái trước
            await _promotionService.UpdatePromotionStatusAsync(id);
            promotion = await _promotionRepository.GetByIdAsync(id);

            if (promotion!.Status != "active")
                return BadRequest(new { message = "Mã khuyến mãi không còn hiệu lực" });

            var now = DateTime.Now;
            if (now < promotion.StartDate)
                return BadRequest(new { message = "Mã khuyến mãi chưa có hiệu lực" });

            if (now > promotion.EndDate)
                return BadRequest(new { message = "Mã khuyến mãi đã hết hạn" });

            if (promotion.UsedCount >= promotion.UsageLimit)
                return BadRequest(new { message = "Mã khuyến mãi đã hết lượt sử dụng" });

            // Tăng usage count
            var result = await _promotionService.IncrementUsageCountAsync(id);
            if (!result)
                return BadRequest(new { message = "Không thể áp dụng mã khuyến mãi" });

            // Lấy lại thông tin sau khi update
            promotion = await _promotionRepository.GetByIdAsync(id);
            return Ok(new 
            { 
                message = "Áp dụng mã khuyến mãi thành công",
                promotion = promotion,
                remainingUsage = promotion!.UsageLimit - promotion.UsedCount
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Promotion>> Update(int id, [FromBody] Promotion promotion)
        {
            var existing = await _promotionRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.PromoCode = promotion.PromoCode;
            existing.Description = promotion.Description;
            existing.DiscountType = promotion.DiscountType;
            existing.DiscountValue = promotion.DiscountValue;
            existing.StartDate = promotion.StartDate;
            existing.EndDate = promotion.EndDate;
            existing.MinOrderAmount = promotion.MinOrderAmount;
            existing.UsageLimit = promotion.UsageLimit;
            existing.Status = promotion.Status;

            await _promotionRepository.UpdateAsync(existing);
            
            // Cập nhật trạng thái sau khi update dựa trên thời gian và số lượt
            await _promotionService.UpdatePromotionStatusAsync(id);
            
            // Lấy lại dữ liệu sau khi cập nhật trạng thái
            var updated = await _promotionRepository.GetByIdAsync(id);
            
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _promotionRepository.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Promotion deleted successfully" });
        }

        [HttpPost("update-statuses")]
        public async Task<ActionResult> UpdateAllStatuses()
        {
            await _promotionService.UpdateAllPromotionStatusesAsync();
            return Ok(new { message = "Cập nhật trạng thái tất cả khuyến mãi thành công" });
        }

        [HttpPost("{id}/update-status")]
        public async Task<ActionResult> UpdateStatus(int id)
        {
            var result = await _promotionService.UpdatePromotionStatusAsync(id);
            if (!result)
                return Ok(new { message = "Trạng thái không thay đổi" });
            
            var promotion = await _promotionRepository.GetByIdAsync(id);
            return Ok(new 
            { 
                message = "Cập nhật trạng thái thành công",
                promotion = promotion
            });
        }
    }
}
