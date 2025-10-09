namespace StoreManagementAPI.DTOs
{
    public class StockReceiptDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class InventoryResponseDto
    {
        public int InventoryId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
