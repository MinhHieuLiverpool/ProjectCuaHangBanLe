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
            // Cập nhật trạng thái tất cả promotion trước khi trả về
            await _promotionService.UpdateAllPromotionStatusesAsync();
            
            var promotions = await _promotionRepository.GetAllAsync();
            return Ok(promotions);
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetActive()
        {
            var promotions = await _promotionRepository.FindAsync(p => 
                p.Status == "active" && 
                p.StartDate <= DateTime.Now && 
                p.EndDate >= DateTime.Now);
            return Ok(promotions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Promotion>> GetById(int id)
        {
            var promotion = await _promotionRepository.GetByIdAsync(id);
            if (promotion == null) return NotFound();
            return Ok(promotion);
        }

        [HttpGet("code/{code}")]
        [AllowAnonymous]
        public async Task<ActionResult<Promotion>> GetByCode(string code)
        {
            var promotions = await _promotionRepository.FindAsync(p => p.PromoCode == code);
            var promotion = promotions.FirstOrDefault();
            if (promotion == null) return NotFound();
            return Ok(promotion);
        }

        [HttpPost]
        public async Task<ActionResult<Promotion>> Create([FromBody] Promotion promotion)
        {
            var created = await _promotionRepository.AddAsync(promotion);
            return CreatedAtAction(nameof(GetById), new { id = created.PromoId }, created);
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

            var updated = await _promotionRepository.UpdateAsync(existing);
            return Ok(updated);
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
