using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagementAPI.Models
{
    [Table("combo_promotion_items")]
    public class ComboPromotionItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("combo_id")]
        public int ComboId { get; set; }

        [Required]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; } = 1; // Số lượng sản phẩm cần mua

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("ComboId")]
        public virtual ComboPromotion? ComboPromotion { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}
