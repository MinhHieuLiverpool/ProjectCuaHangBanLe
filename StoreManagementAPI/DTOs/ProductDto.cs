namespace StoreManagementAPI.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public decimal Price { get; set; }
        public string Unit { get; set; } = "pcs";
        public int? StockQuantity { get; set; }
    }

    public class CreateProductDto
    {
        public int? CategoryId { get; set; }
        public int? SupplierId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public decimal Price { get; set; }
        public string Unit { get; set; } = "pcs";
        public int InitialStock { get; set; } = 0;
    }

    public class UpdateProductDto
    {
        public int? CategoryId { get; set; }
        public int? SupplierId { get; set; }
        public string? ProductName { get; set; }
        public string? Barcode { get; set; }
        public decimal? Price { get; set; }
        public string? Unit { get; set; }
    }

    public class UpdateStockDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
