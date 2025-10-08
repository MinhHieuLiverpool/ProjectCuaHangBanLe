using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagementAPI.Models
{
    [Table("products")]
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("supplier_id")]
        public int? SupplierId { get; set; }

        [Required]
        [Column("product_name")]
        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [Column("barcode")]
        [StringLength(50)]
        public string? Barcode { get; set; }

        [Required]
        [Column("price", TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Column("unit")]
        [StringLength(20)]
        public string Unit { get; set; } = "pcs";

        [Column("status")]
        [StringLength(20)]
        public string Status { get; set; } = "active"; // active, inactive

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        [ForeignKey("SupplierId")]
        public virtual Supplier? Supplier { get; set; }

        public virtual Inventory? Inventory { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
