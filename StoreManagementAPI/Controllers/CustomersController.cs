// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using StoreManagementAPI.Data;
using System.Text.Json;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] - B? AUTHENTICATION
    public class CustomersController : ControllerBase
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly StoreDbContext _context;

        public CustomersController(IRepository<Customer> customerRepository, StoreDbContext context)
        {
            _customerRepository = customerRepository;
            _context = context;
        }

        private void LogAudit(string action, string entity, int? entityId, string? entityName, string changesSummary, object? oldValues, object? newValues)
        {
            var auditLog = new AuditLog
            {
                Action = action,
                EntityType = entity,
                EntityId = entityId,
                EntityName = entityName,
                ChangesSummary = changesSummary,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                CreatedAt = DateTime.Now, // Giờ địa phương (Việt Nam)
                UserId = 1,
                Username = "admin"
            };

            _context.AuditLogs.Add(auditLog);
            _context.SaveChanges();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetAll()
        {
            var customers = await _customerRepository.GetAllAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
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
            
            // Log audit
            LogAudit(
                action: "CREATE",
                entity: "Customer",
                entityId: created.CustomerId,
                entityName: created.Name,
                changesSummary: $"Tạo khách hàng mới: {created.Name} (SĐT: {created.Phone})",
                oldValues: null,
                newValues: new
                {
                    created.CustomerId,
                    created.Name,
                    created.Phone,
                    created.Email,
                    created.Address
                }
            );
            
            return CreatedAtAction(nameof(GetById), new { id = created.CustomerId }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Customer>> Update(int id, [FromBody] Customer customer)
        {
            var existing = await _customerRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Store old values for audit
            var oldValues = new
            {
                existing.CustomerId,
                existing.Name,
                existing.Phone,
                existing.Email,
                existing.Address
            };

            var oldName = existing.Name;
            existing.Name = customer.Name;
            existing.Phone = customer.Phone;
            existing.Email = customer.Email;
            existing.Address = customer.Address;

            var updated = await _customerRepository.UpdateAsync(existing);
            
            // Log audit
            LogAudit(
                action: "UPDATE",
                entity: "Customer",
                entityId: id,
                entityName: updated.Name,
                changesSummary: $"Cập nhật thông tin khách hàng: {oldName} → {updated.Name}",
                oldValues: oldValues,
                newValues: new
                {
                    updated.CustomerId,
                    updated.Name,
                    updated.Phone,
                    updated.Email,
                    updated.Address
                }
            );
            
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existing = await _customerRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();
            
            // Store values before deletion for audit
            var deletedValues = new
            {
                existing.CustomerId,
                existing.Name,
                existing.Phone,
                existing.Email,
                existing.Address
            };
            
            var result = await _customerRepository.DeleteAsync(id);
            if (!result) return NotFound();
            
            // Log audit
            LogAudit(
                action: "DELETE",
                entity: "Customer",
                entityId: id,
                entityName: existing.Name,
                changesSummary: $"Xóa khách hàng: {existing.Name} (SĐT: {existing.Phone})",
                oldValues: deletedValues,
                newValues: null
            );
            
            return Ok(new { message = "Customer deleted successfully" });
        }
    }
}
