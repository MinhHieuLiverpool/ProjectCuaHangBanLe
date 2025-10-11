// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BarcodeController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public BarcodeController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpPost("generate-all")]
        // [AllowAnonymous] - B? AUTHENTICATION
        public async Task<ActionResult> GenerateAllBarcodes()
        {
            try
            {
                var products = await _context.Products
                    .OrderBy(p => p.ProductId)
                    .ToListAsync();

                long startBarcode = 8900000000001;
                int index = 0;
                int updatedCount = 0;

                var results = new List<object>();

                foreach (var product in products)
                {
                    string newBarcode = (startBarcode + index).ToString().PadLeft(13, '0');
                    string oldBarcode = product.Barcode ?? "NULL";

                    product.Barcode = newBarcode;
                    updatedCount++;

                    results.Add(new
                    {
                        productId = product.ProductId,
                        productName = product.ProductName,
                        oldBarcode = oldBarcode,
                        newBarcode = newBarcode,
                        price = product.Price
                    });

                    index++;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã tạo barcode thành công!",
                    totalProducts = products.Count,
                    updatedCount = updatedCount,
                    startBarcode = startBarcode,
                    endBarcode = (startBarcode + products.Count - 1).ToString().PadLeft(13, '0'),
                    products = results
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Lỗi khi tạo barcode: " + ex.Message
                });
            }
        }

        [HttpGet("export")]
        // [AllowAnonymous] - B? AUTHENTICATION
        public async Task<ActionResult> ExportBarcodes()
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.Barcode != null)
                    .OrderBy(p => p.ProductId)
                    .Select(p => new
                    {
                        p.Barcode,
                        p.ProductName,
                        p.Price
                    })
                    .ToListAsync();

                var exportText = string.Join("\n", products.Select(p =>
                    $"{p.Barcode}|{p.ProductName}|{(int)p.Price}"
                ));

                return Ok(new
                {
                    success = true,
                    count = products.Count,
                    exportText = exportText,
                    products = products
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Lỗi khi xuất barcode: " + ex.Message
                });
            }
        }
    }
}
