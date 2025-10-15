using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagementAPI.Models
{
    [Table("combo_promotions")]
    public class ComboPromotion
    {
        [Key]
        [Column("combo_id")]
        public int ComboId { get; set; }

        [Required]
        [Column("combo_name")]
        [StringLength(100)]
        public string ComboName { get; set; } = string.Empty;

        [Column("description")]
        [StringLength(255)]
        public string? Description { get; set; }

        [Required]
        [Column("discount_type")]
        [StringLength(10)]
        public string DiscountType { get; set; } = "percentage"; // percentage or fixed

        [Required]
        [Column("discount_value", TypeName = "decimal(10,2)")]
        public decimal DiscountValue { get; set; }

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("usage_limit")]
        public int UsageLimit { get; set; } = 0;

        [Column("used_count")]
        public int UsedCount { get; set; } = 0;

        [Column("status")]
        [StringLength(10)]
        public string Status { get; set; } = "active";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public virtual ICollection<ComboPromotionItem> ComboItems { get; set; } = new List<ComboPromotionItem>();
    }
}
