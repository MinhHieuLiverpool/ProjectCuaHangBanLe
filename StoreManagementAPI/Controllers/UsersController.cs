// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Services;
using StoreManagementAPI.DTOs;

namespace StoreManagementAPI.Controllers
{
    // [Authorize] - B? AUTHENTICATION
    [Route("api/[Controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UsersController(IAuthService authService)
        {
            _authService = authService;
        }

        // [Authorize] - B? AUTHENTICATION
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _authService.GetUsersAsync();
            return Ok(users);
        }

        // [Authorize] - B? AUTHENTICATION
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] RegisterDto registerDto)
        {
            var user = await _authService.RegisterAsync(registerDto);
            if (user == null)
            {
                return BadRequest(new { message = "Username already exists" });
            }

            return CreatedAtAction(nameof(GetUsers), new { id = user.UserId }, user);
        }

        // [Authorize] - B? AUTHENTICATION
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var result = await _authService.UpdateUserAsync(id, updateDto);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // [Authorize] - B? AUTHENTICATION
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _authService.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return NoContent();
        }

        // [Authorize] - B? AUTHENTICATION
        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] UpdatePasswordDto dto)
        {
            try
            {
                var result = await _authService.UpdatePasswordAsync(id, dto.OldPassword, dto.NewPassword);
                if (!result)
                {
                    return NotFound(new { message = "User not found or update failed" });
                }

                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // [Authorize] - B? AUTHENTICATION
        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            try
            {
                var result = await _authService.ToggleUserStatusAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "User status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
