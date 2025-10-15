using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComboPromotionsController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public ComboPromotionsController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComboPromotionDto>>> GetAll()
        {
            // Update statuses trước
            await UpdateAllComboStatusesAsync();

            var combos = await _context.ComboPromotions
                .Include(c => c.ComboItems)
                    .ThenInclude(ci => ci.Product)
                .ToListAsync();

            var result = combos.Select(c => new ComboPromotionDto
            {
                ComboId = c.ComboId,
                ComboName = c.ComboName,
                Description = c.Description,
                DiscountType = c.DiscountType,
                DiscountValue = c.DiscountValue,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                UsageLimit = c.UsageLimit,
                UsedCount = c.UsedCount,
                Status = c.Status,
                Items = c.ComboItems.Select(ci => new ComboItemDto
                {
                    ProductId = ci.ProductId,
                    ProductName = ci.Product?.ProductName ?? "",
                    Price = ci.Product?.Price ?? 0,
                    Quantity = ci.Quantity
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ComboPromotionDto>> GetById(int id)
        {
            var combo = await _context.ComboPromotions
                .Include(c => c.ComboItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.ComboId == id);

            if (combo == null) return NotFound();

            var result = new ComboPromotionDto
            {
                ComboId = combo.ComboId,
                ComboName = combo.ComboName,
                Description = combo.Description,
                DiscountType = combo.DiscountType,
                DiscountValue = combo.DiscountValue,
                StartDate = combo.StartDate,
                EndDate = combo.EndDate,
                UsageLimit = combo.UsageLimit,
                UsedCount = combo.UsedCount,
                Status = combo.Status,
                Items = combo.ComboItems.Select(ci => new ComboItemDto
                {
                    ProductId = ci.ProductId,
                    ProductName = ci.Product?.ProductName ?? "",
                    Price = ci.Product?.Price ?? 0,
                    Quantity = ci.Quantity
                }).ToList()
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ComboPromotionDto>> Create([FromBody] CreateComboPromotionDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
            {
                return BadRequest("Combo phải có ít nhất 1 sản phẩm");
            }

            var combo = new ComboPromotion
            {
                ComboName = dto.ComboName,
                Description = dto.Description,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit,
                Status = "active"
            };

            _context.ComboPromotions.Add(combo);
            await _context.SaveChangesAsync();

            // Thêm items
            foreach (var item in dto.Items)
            {
                var comboItem = new ComboPromotionItem
                {
                    ComboId = combo.ComboId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity
                };
                _context.ComboPromotionItems.Add(comboItem);
            }

            await _context.SaveChangesAsync();

            // Load lại để trả về đầy đủ
            return await GetById(combo.ComboId);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ComboPromotionDto>> Update(int id, [FromBody] UpdateComboPromotionDto dto)
        {
            var combo = await _context.ComboPromotions
                .Include(c => c.ComboItems)
                .FirstOrDefaultAsync(c => c.ComboId == id);

            if (combo == null) return NotFound();

            // Cập nhật thông tin
            if (dto.Description != null) combo.Description = dto.Description;
            if (dto.EndDate != null) combo.EndDate = dto.EndDate.Value;
            if (dto.Status != null) combo.Status = dto.Status;

            // Cập nhật items nếu có
            if (dto.Items != null && dto.Items.Count > 0)
            {
                // Xóa items cũ
                _context.ComboPromotionItems.RemoveRange(combo.ComboItems);

                // Thêm items mới
                foreach (var item in dto.Items)
                {
                    var comboItem = new ComboPromotionItem
                    {
                        ComboId = combo.ComboId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity
                    };
                    _context.ComboPromotionItems.Add(comboItem);
                }
            }

            await _context.SaveChangesAsync();

            return await GetById(id);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var combo = await _context.ComboPromotions.FindAsync(id);
            if (combo == null) return NotFound();

            _context.ComboPromotions.Remove(combo);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa combo khuyến mãi thành công" });
        }

        // Helper: Update statuses
        private async Task UpdateAllComboStatusesAsync()
        {
            var combos = await _context.ComboPromotions.ToListAsync();
            var now = DateTime.Now.Date;

            foreach (var combo in combos)
            {
                var startDate = combo.StartDate.Date;
                var endDate = combo.EndDate.Date;

                if (now < startDate || now > endDate || 
                    (combo.UsageLimit > 0 && combo.UsedCount >= combo.UsageLimit))
                {
                    combo.Status = "inactive";
                }
                else if (combo.Status == "inactive" && now >= startDate && now <= endDate && 
                         (combo.UsageLimit == 0 || combo.UsedCount < combo.UsageLimit))
                {
                    combo.Status = "active";
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
