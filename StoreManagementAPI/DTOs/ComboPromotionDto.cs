namespace StoreManagementAPI.DTOs
{
    public class ComboPromotionDto
    {
        public int ComboId { get; set; }
        public string ComboName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public string Status { get; set; } = "active";
        public List<ComboItemDto> Items { get; set; } = new();
    }

    public class ComboItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateComboPromotionDto
    {
        public string ComboName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public decimal DiscountValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; } = 0;
        public List<CreateComboItemDto> Items { get; set; } = new();
    }

    public class CreateComboItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateComboPromotionDto
    {
        public string? Description { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public List<CreateComboItemDto>? Items { get; set; }
    }
}
