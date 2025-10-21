using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using System.Text.Json;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly IRepository<Customer> _customerRepository;

        public CustomersController(IRepository<Customer> customerRepository)
        {
            _customerRepository = customerRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetAllCustomers()
        {
            var customers = await _customerRepository.GetAllAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomerById(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
                return NotFound(new { message = "Customer not found" });
            return Ok(customer);
        }

        [HttpGet("check-phone")]
        public async Task<ActionResult> CheckPhone([FromQuery] string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return BadRequest(new { message = "Phone is required" });

            phone = phone.Trim();
            if (phone.StartsWith("+84"))
                phone = phone.Replace("+84", "0");

            var customers = await _customerRepository.GetAllAsync();
            var exists = customers.Any(c => !string.IsNullOrWhiteSpace(c.Phone) && c.Phone.Trim().Replace("+84", "0") == phone);

            return Ok(new { exists });
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer([FromBody] Customer customer)
        {
            var created = await _customerRepository.AddAsync(customer);
            return CreatedAtAction(nameof(GetCustomerById), new { id = created.CustomerId }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Customer>> UpdateCustomer(int id, [FromBody] Customer customer)
        {
            var existing = await _customerRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Customer not found" });

            // Check phone duplication
            if (!string.IsNullOrEmpty(customer.Phone))
            {
                var allCustomers = await _customerRepository.GetAllAsync();
                if (allCustomers.Any(c => c.Phone == customer.Phone && c.CustomerId != id))
                {
                    return BadRequest(new { message = "Số điện thoại đã được sử dụng bởi khách hàng khác." });
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
                return NotFound(new { message = "Customer not found" });

            customer.Status = "Inactive"; // Soft delete
            await _customerRepository.UpdateAsync(customer);

            return Ok(new
            {
                message = "Khách hàng đã được ẩn",
                softDeleted = true,
                customerId = id
            });
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] JsonElement body)
        {
            if (!body.TryGetProperty("status", out var statusProp))
                return BadRequest(new { message = "Trạng thái không hợp lệ" });

            var status = statusProp.GetString()?.ToLower();
            if (status != "active" && status != "inactive")
                return BadRequest(new { message = "Trạng thái không hợp lệ" });

            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            customer.Status = status;
            await _customerRepository.UpdateAsync(customer);

            return Ok(new { message = "Cập nhật trạng thái thành công", status = customer.Status });
        }
    }
}
