namespace StoreManagementAPI.DTOs
{
    public class PromotionDto
    {
        public int PromoId { get; set; }
        public string PromoCode { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MinOrderAmount { get; set; }
        public int? UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public string Status { get; set; } = "active"; // Trạng thái trong DB (active/hidden)
        public string PromotionStatus { get; set; } = "active"; // Trạng thái thực tế: upcoming/active/expired/hidden
        public string ApplyType { get; set; } = "order"; // order, product, combo
        public List<ProductSimpleDto> Products { get; set; } = new();
    }

    public class CreatePromotionDto
    {
        public string PromoCode { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MinOrderAmount { get; set; }
        public int? UsageLimit { get; set; }
        public string ApplyType { get; set; } = "order"; // order, product, category
        public List<int> ProductIds { get; set; } = new();
    }

    public class UpdatePromotionDto
    {
        public string? Description { get; set; }
        public string? DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinOrderAmount { get; set; }
        // Status không được phép cập nhật qua API Update
        // Chỉ có thể ẩn promotion thông qua Delete API (soft delete)
        public string? ApplyType { get; set; }
        public List<int>? ProductIds { get; set; }
    }

    public class PromotionSearchDto
    {
        // Tìm kiếm theo mã hoặc mô tả
        public string? Keyword { get; set; }

        // Lọc theo thể loại giảm giá (percentage, fixed)
        public string? DiscountType { get; set; }

        // Lọc theo loại áp dụng (order, product, combo)
        public string? ApplyType { get; set; }

        // Lọc theo thời gian
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        // Lọc theo trạng thái khuyến mãi
        // upcoming: chưa đến (StartDate > Now)
        // active: đang còn hạn (StartDate <= Now && EndDate >= Now && Status != hidden)
        // expired: hết hạn (EndDate < Now)
        // hidden: đã ẩn (Status == hidden)
        public string? PromotionStatus { get; set; }
    }
}
