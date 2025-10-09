using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Services;
using StoreManagementAPI.DTOs;

namespace StoreManagementAPI.Controllers
{
    [Authorize]
    [Route("api/[Controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UsersController(IAuthService authService)
        {
            _authService = authService;
        }

        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _authService.GetUsersAsync();
            return Ok(users);
        }

        [Authorize(Roles = "admin")]
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

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
        {
            var result = await _authService.UpdateUserAsync(id, updateDto);
            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return NoContent();
        }

        [Authorize(Roles = "admin")]
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

        [Authorize(Roles = "admin")]
        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] UpdatePasswordDto dto)
        {
            var result = await _authService.UpdatePasswordAsync(id, dto.Password);
            if (!result)
            {
                return NotFound(new { message = "User not found or update failed" });
            }

            return Ok(new { message = "Password updated successfully" });
        }
    }
}