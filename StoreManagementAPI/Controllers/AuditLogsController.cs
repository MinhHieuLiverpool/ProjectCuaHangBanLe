using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Services;
using System.Security.Claims;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        // GET: api/AuditLogs
        [HttpGet]
        public async Task<ActionResult<List<AuditLogDto>>> GetLogs([FromQuery] AuditLogFilterDto filter)
        {
            try
            {
                var logs = await _auditLogService.GetLogsAsync(filter);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving audit logs", error = ex.Message });
            }
        }

        // GET: api/AuditLogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AuditLogDto>> GetLog(int id)
        {
            try
            {
                var log = await _auditLogService.GetLogByIdAsync(id);
                if (log == null)
                {
                    return NotFound(new { message = "Audit log not found" });
                }
                return Ok(log);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving audit log", error = ex.Message });
            }
        }

        // GET: api/AuditLogs/entity/Product/123
        [HttpGet("entity/{entityType}/{entityId}")]
        public async Task<ActionResult<List<AuditLogDto>>> GetLogsByEntity(string entityType, int entityId)
        {
            try
            {
                var logs = await _auditLogService.GetLogsByEntityAsync(entityType, entityId);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving entity logs", error = ex.Message });
            }
        }

        // GET: api/AuditLogs/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<AuditLogDto>>> GetLogsByUser(int userId)
        {
            try
            {
                var logs = await _auditLogService.GetLogsByUserAsync(userId);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving user logs", error = ex.Message });
            }
        }

        // GET: api/AuditLogs/summary
        [HttpGet("summary")]
        public async Task<ActionResult<AuditLogSummaryDto>> GetSummary([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var summary = await _auditLogService.GetSummaryAsync(fromDate, toDate);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving audit summary", error = ex.Message });
            }
        }

        // GET: api/AuditLogs/my-activities
        [HttpGet("my-activities")]
        public async Task<ActionResult<List<AuditLogDto>>> GetMyActivities()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var logs = await _auditLogService.GetLogsByUserAsync(userId);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving activities", error = ex.Message });
            }
        }
    }
}
