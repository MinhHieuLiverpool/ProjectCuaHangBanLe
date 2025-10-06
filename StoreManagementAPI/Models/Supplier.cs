using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagementAPI.Models
{
    [Table("suppliers")]
    public class Supplier
    {
        [Key]
        [Column("supplier_id")]
        public int SupplierId { get; set; }

        [Required]
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column("phone")]
        [StringLength(20)]
        public string? Phone { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string? Email { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        // Navigation property
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
