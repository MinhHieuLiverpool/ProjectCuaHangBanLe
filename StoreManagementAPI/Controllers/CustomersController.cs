// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using System.Text.Json;


namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] - B? AUTHENTICATION
    public class CustomersController : ControllerBase
    {
        private readonly IRepository<Customer> _customerRepository;

        public CustomersController(IRepository<Customer> customerRepository)
        {
            _customerRepository = customerRepository;
        }

                        // ✅ Kiểm tra số điện thoại đã tồn tại chưa
[HttpGet("check-phone")]
public async Task<ActionResult> CheckPhone([FromQuery] string phone)
{
    if (string.IsNullOrWhiteSpace(phone))
        return BadRequest(new { message = "Phone is required" });

    // Chuẩn hóa số điện thoại (bỏ khoảng trắng, thay +84 bằng 0)
    phone = phone.Trim();
    if (phone.StartsWith("+84"))
        phone = phone.Replace("+84", "0");

    var customers = await _customerRepository.GetAllAsync();

    Console.WriteLine($"===> Tổng số customer: {customers.Count()}");
    Console.WriteLine($"===> Kiểm tra phone: {phone}");

    // So sánh mềm hơn (Trim, Replace, loại ký tự không cần thiết)
    var exists = customers.Any(c =>
    {
        if (string.IsNullOrWhiteSpace(c.Phone))
            return false;

        var dbPhone = c.Phone.Trim().Replace("+84", "0");
        return dbPhone == phone;
    });

    Console.WriteLine($"===> Kết quả: {exists}");

    return Ok(new { exists });
}

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetAll()
        {
            var customers = await _customerRepository.GetAllAsync();
            return Ok(customers);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Customer>> GetById(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> Create([FromBody] Customer customer)
        {
            var created = await _customerRepository.AddAsync(customer);
            return CreatedAtAction(nameof(GetById), new { id = created.CustomerId }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Customer>> Update(int id, [FromBody] Customer customer)
        {
            var existing = await _customerRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

                // Kiểm tra số điện thoại trùng với khách hàng khác
    if (!string.IsNullOrEmpty(customer.Phone))
    {
        var phoneExists = await _customerRepository.GetAllAsync();
        bool isDuplicate = phoneExists
            .Any(c => c.Phone == customer.Phone && c.CustomerId != id); // khác id hiện tại
        if (isDuplicate)
        {
            return BadRequest(new { message = "Số điện thoại này đã được sử dụng bởi khách hàng khác." });
        }
    }

            existing.Name = customer.Name;
            existing.Phone = customer.Phone;
            existing.Email = customer.Email;
            existing.Address = customer.Address;
            existing.Status = customer.Status ?? existing.Status;

            var updated = await _customerRepository.UpdateAsync(existing);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCustomer(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
            {
                return NotFound(new { message = "Không tìm thấy khách hàng" });
            }

            customer.Status = "Inactive"; // hoặc 0 nếu là kiểu int
            await _customerRepository.UpdateAsync(customer);

            return Ok(new
            {
                message = "Khách hàng đã được ẩn",
                softDeleted = true,
                customerId = id
            });
        }



        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] JsonElement body)
        {
            if (!body.TryGetProperty("status", out var statusProp))
                return BadRequest(new { message = "Trạng thái không hợp lệ!" });

            var status = statusProp.GetString()?.ToLower(); // ✅ chuẩn hóa lowercase

            if (string.IsNullOrWhiteSpace(status) || (status != "active" && status != "inactive"))
                return BadRequest(new { message = "Trạng thái không hợp lệ!" });

            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng!" });

            customer.Status = status;
            await _customerRepository.UpdateAsync(customer);

            return Ok(new { message = "Cập nhật trạng thái thành công!", status = customer.Status });
        }


    }
}
