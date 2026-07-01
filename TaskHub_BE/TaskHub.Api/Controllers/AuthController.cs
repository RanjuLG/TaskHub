using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskHub.Application.DTOs;
using TaskHub.Domain.Entities;
using TaskHub.Infrastructre.Data;

namespace TaskHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TaskDbContext _context;

        public AuthController(TaskDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { Message = "Username is already taken." });
            }

            var user = new User(dto.Username, BCrypt.Net.BCrypt.HashPassword(dto.Password));

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Registration successful. You can now log in." });
        }

        // GET: api/auth/login
        [HttpGet("login")]
        [Authorize]
        public IActionResult Login()
        {

            var username = User.FindFirstValue(ClaimTypes.Name);

            return Ok(new
            {
                Message = "Login successful",
                Username = username
            });
        }
    }

}
