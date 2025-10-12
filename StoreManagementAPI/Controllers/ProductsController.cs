using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Services;
using System.Security.Claims;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // // [Authorize] - BỎ AUTHENTICATION
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null ? int.Parse(userIdClaim) : null;
        }

        [HttpGet]
        // // [AllowAnonymous] - B? AUTHENTICATION - BỎ HẾT AUTHENTICATION
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("search")]
        // // [AllowAnonymous] - B? AUTHENTICATION - BỎ HẾT AUTHENTICATION
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string searchTerm)
        {
            var products = await _productService.SearchProductsAsync(searchTerm);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(product);
        }

        [HttpGet("{id}/history")]
        // // [AllowAnonymous] - B? AUTHENTICATION - BỎ HẾT AUTHENTICATION
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductHistory(int id)
        {
            var history = await _productService.GetProductHistoryAsync(id);
            return Ok(history);
        }

        [HttpGet("barcode/{barcode}")]
        // // [AllowAnonymous] - B? AUTHENTICATION - BỎ HẾT AUTHENTICATION
        public async Task<ActionResult<ProductDto>> GetProductByBarcode(string barcode)
        {
            var product = await _productService.GetProductByBarcodeAsync(barcode);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm với mã barcode này" });
            }
            return Ok(product);
        }

        [HttpPost]
        // // [Authorize] - BỎ AUTHENTICATION
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
        {
            try
            {
                var product = await _productService.CreateProductAsync(dto);

                return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        // // [Authorize] - BỎ AUTHENTICATION
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            var product = await _productService.UpdateProductAsync(id, dto);
            
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(product);
        }

        [HttpDelete("{id}")]
        // // [Authorize] - BỎ AUTHENTICATION
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(new { message = "Product deleted successfully" });
        }

        [HttpPut("stock")]
        // // [Authorize] - B? AUTHENTICATION - BỎ HẾT AUTHENTICATION
        public async Task<ActionResult> UpdateStock([FromBody] UpdateStockDto dto)
        {
            try
            {
                await _productService.UpdateStockAsync(dto);
                return Ok(new { message = "Stock updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
