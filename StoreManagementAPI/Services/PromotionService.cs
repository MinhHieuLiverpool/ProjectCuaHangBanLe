using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;

namespace StoreManagementAPI.Services
{
    public interface IPromotionService
    {
        Task<Promotion?> ValidateAndGetPromotionAsync(string promoCode);
        Task<bool> UpdatePromotionStatusAsync(int promoId);
        Task UpdateAllPromotionStatusesAsync();
        Task<bool> IncrementUsageCountAsync(int promoId);
    }

    public class PromotionService : IPromotionService
    {
        private readonly IRepository<Promotion> _promotionRepository;

        public PromotionService(IRepository<Promotion> promotionRepository)
        {
            _promotionRepository = promotionRepository;
        }

        /// <summary>
        /// Kiểm tra và lấy thông tin khuyến mãi hợp lệ
        /// </summary>
        public async Task<Promotion?> ValidateAndGetPromotionAsync(string promoCode)
        {
            var promotions = await _promotionRepository.FindAsync(p => p.PromoCode == promoCode);
            var promotion = promotions.FirstOrDefault();

            if (promotion == null)
                return null;

            // Cập nhật trạng thái trước khi kiểm tra
            await UpdatePromotionStatusAsync(promotion.PromoId);

            // Lấy lại promotion sau khi update
            promotion = await _promotionRepository.GetByIdAsync(promotion.PromoId);

            // Kiểm tra các điều kiện
            if (promotion == null || promotion.Status != "active")
                return null;

            var today = DateTime.Now.Date;
            var startDate = promotion.StartDate.Date;
            var endDate = promotion.EndDate.Date;

            if (today < startDate || today > endDate)
                return null;

            if (promotion.UsedCount >= promotion.UsageLimit && promotion.UsageLimit > 0)
                return null;

            return promotion;
        }

        /// <summary>
        /// Cập nhật trạng thái của một khuyến mãi dựa trên thời gian và số lượt sử dụng
        /// </summary>
        public async Task<bool> UpdatePromotionStatusAsync(int promoId)
        {
            var promotion = await _promotionRepository.GetByIdAsync(promoId);
            if (promotion == null)
                return false;

            var today = DateTime.Now.Date; // Chỉ lấy phần ngày, bỏ giờ phút giây
            var startDate = promotion.StartDate.Date;
            var endDate = promotion.EndDate.Date;
            string newStatus = promotion.Status;

            // Kiểm tra theo thứ tự ưu tiên
            if (today < startDate)
            {
                // Chưa đến thời gian áp dụng
                newStatus = "inactive";
            }
            else if (today > endDate)
            {
                // Đã hết hạn - chuyển về inactive
                newStatus = "inactive";
            }
            else if (promotion.UsedCount >= promotion.UsageLimit && promotion.UsageLimit > 0)
            {
                // Đã hết lượt sử dụng - chuyển về inactive
                newStatus = "inactive";
            }
            else if (today >= startDate && today <= endDate && (promotion.UsedCount < promotion.UsageLimit || promotion.UsageLimit == 0))
            {
                // Trong thời gian áp dụng và còn lượt (hoặc không giới hạn)
                newStatus = "active";
            }

            // Cập nhật nếu trạng thái thay đổi
            if (newStatus != promotion.Status)
            {
                promotion.Status = newStatus;
                await _promotionRepository.UpdateAsync(promotion);
                return true;
            }

            return false;
        }

        /// <summary>
        /// Cập nhật trạng thái tất cả khuyến mãi
        /// </summary>
        public async Task UpdateAllPromotionStatusesAsync()
        {
            var allPromotions = await _promotionRepository.GetAllAsync();
            
            foreach (var promotion in allPromotions)
            {
                await UpdatePromotionStatusAsync(promotion.PromoId);
            }
        }

        /// <summary>
        /// Tăng số lượt sử dụng và cập nhật trạng thái nếu cần
        /// </summary>
        public async Task<bool> IncrementUsageCountAsync(int promoId)
        {
            var promotion = await _promotionRepository.GetByIdAsync(promoId);
            if (promotion == null)
                return false;

            promotion.UsedCount++;

            // Kiểm tra nếu đã đủ lượt sử dụng thì chuyển sang trạng thái "inactive"
            if (promotion.UsedCount >= promotion.UsageLimit && promotion.UsageLimit > 0)
            {
                promotion.Status = "inactive";
            }

            await _promotionRepository.UpdateAsync(promotion);
            return true;
        }
    }
}
