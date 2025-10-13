using Microsoft.IdentityModel.Tokens;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StoreManagementAPI.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<User?> RegisterAsync(RegisterDto registerDto);
        string GenerateJwtToken(User user);
        Task<IEnumerable<User>> GetUsersAsync();
        Task<bool> UpdateUserAsync(int id, UpdateUserDto updateDto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> UpdatePasswordAsync(int userId, string OldPassword, string newPassword);
    }

    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var users = await _userRepository.FindAsync(u => u.Username == loginDto.Username);
            var user = users.FirstOrDefault();

            if (user == null || user.Password != loginDto.Password)
            {
                return null;
            }

            var token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                FullName = user.FullName ?? "",
                Role = user.Role
            };
        }

        public async Task<User?> RegisterAsync(RegisterDto registerDto)
        {
            // Nếu user muốn tạo admin, kiểm tra có admin chưa
            if (registerDto.Role == "admin")
            {
                var hasAdmin = await _userRepository.ExistsAsync(u => u.Role == "admin");
                if (hasAdmin)
                    throw new Exception("Only one admin account is allowed.");
            }

            // Nếu không chỉ định role, mặc định là staff
            if (string.IsNullOrEmpty(registerDto.Role))
                registerDto.Role = "staff";
            
            var exists = await _userRepository.ExistsAsync(u => u.Username == registerDto.Username);
            if (exists)
            {
                return null;
            }

            var user = new User
            {
                Username = registerDto.Username,
                Password = registerDto.Password, // In production, hash this!
                FullName = registerDto.FullName,
                Role = registerDto.Role
            };

            return await _userRepository.AddAsync(user);
        }

        public string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSuperSecretKeyForJwtTokenGeneration123456"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "StoreManagementAPI",
                audience: _configuration["Jwt:Audience"] ?? "StoreManagementClient",
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
         public async Task<IEnumerable<User>> GetUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserDto updateDto)
        {
            var users = await _userRepository.FindAsync(u => u.UserId == id);
            var user = users.FirstOrDefault();
            if (user == null) return false;

            if (!string.IsNullOrEmpty(updateDto.Password))
                user.Password = updateDto.Password; 

            if (!string.IsNullOrEmpty(updateDto.FullName))
                user.FullName = updateDto.FullName;

            if (!string.IsNullOrEmpty(updateDto.Role)&& user.Role != "admin")
                user.Role = updateDto.Role;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }

        public async Task<bool> UpdatePasswordAsync(int userId, string newPassword)
        {
            var users = await _userRepository.FindAsync(u => u.UserId == userId);
            var user = users.FirstOrDefault();

            if (user == null)
                return false;
                
             // Kiểm tra mật khẩu cũ
            if (user.Password != oldPassword)
                throw new Exception("Old password is incorrect.");

            user.Password = newPassword; 
            await _userRepository.UpdateAsync(user);
            return true;
        }
    }
}
