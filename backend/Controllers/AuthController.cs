using Microsoft.AspNetCore.Mvc;
using TapAndTrack.Models;
using BCrypt.Net;
using static Supabase.Postgrest.Constants;

namespace TapAndTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public AuthController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            try
            {
                if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                if (user.Role != "teacher" && user.Role != "student")
                {
                    return BadRequest(new { message = "Role must be 'teacher' or 'student'" });
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);

                // Update user object with hashed password before inserting
                user.Password = hashedPassword;

                var response = await _supabase.From<User>().Insert(user);
                var newUser = response.Models.FirstOrDefault();

                if (newUser == null)
                {
                    return StatusCode(500, new { message = "Registration failed, could not retrieve created user." });
                }

                return Ok(new 
                { 
                    message = "User registered successfully",
                    user = new { id = newUser.Id, email = newUser.Email, role = newUser.Role, department = newUser.Department, yearLevel = newUser.YearLevel }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Registration failed", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                var response = await _supabase.From<User>()
                    .Select("*")
                    .Filter("email", Operator.Equals, request.Email)
                    .Get();

                var user = response.Models.FirstOrDefault();

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                return Ok(new
                {
                    message = "Login successful",
                    user = new
                    {
                        id = user.Id, 
                        email = user.Email, 
                        role = user.Role,
                        department = user.Department,
                        yearLevel = user.YearLevel
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred during login.", error = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
