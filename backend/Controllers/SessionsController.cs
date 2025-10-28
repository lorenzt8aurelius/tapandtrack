using Microsoft.AspNetCore.Mvc;
using TapAndTrack.Models;
using QRCoder;
using static Supabase.Postgrest.Constants;

namespace TapAndTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public SessionsController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Subject) || request.TeacherId == Guid.Empty)
                {
                    return BadRequest(new { message = "Subject and TeacherId are required" });
                }

                var sessionCode = GenerateSessionCode();
                var session = new Session
                {
                    Id = Guid.NewGuid(),
                    TeacherId = request.TeacherId,
                    Subject = request.Subject,
                    SessionCode = sessionCode,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var response = await _supabase.From<Session>().Insert(session);
                var newSession = response.Models.FirstOrDefault();

                if (newSession == null)
                {
                    return StatusCode(500, new { message = "Failed to create session, could not retrieve created session." });
                }

                var qrCodeBase64 = GenerateQRCode(sessionCode);

                return Ok(new
                {
                    message = "Session created successfully",
                    session = new { newSession.Id, newSession.Subject, newSession.SessionCode, newSession.CreatedAt },
                    qrCode = qrCodeBase64
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create session", error = ex.Message });
            }
        }

        [HttpPost("create-timer")]
        public async Task<IActionResult> CreateTimerSession([FromBody] CreateTimerSessionRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Subject) || request.TeacherId == Guid.Empty)
                {
                    return BadRequest(new { message = "Subject and TeacherId are required" });
                }

                var sessionCode = GenerateSessionCode();
                var expiresAt = DateTime.UtcNow.AddMinutes(request.DurationMinutes);
                
                var session = new Session
                {
                    Id = Guid.NewGuid(),
                    TeacherId = request.TeacherId,
                    Subject = request.Subject,
                    SessionCode = sessionCode,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var response = await _supabase.From<Session>().Insert(session);
                var newSession = response.Models.FirstOrDefault();

                if (newSession == null)
                {
                    return StatusCode(500, new { message = "Failed to create timer session, could not retrieve created session." });
                }

                var qrCodeBase64 = GenerateQRCode(sessionCode);

                return Ok(new
                {
                    message = "Timer session created successfully",
                    session = new 
                    { 
                        newSession.Id, 
                        newSession.Subject, 
                        newSession.SessionCode, 
                        newSession.CreatedAt,
                        expiresAt,
                        durationMinutes = request.DurationMinutes
                    },
                    qrCode = qrCodeBase64
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create timer session", error = ex.Message });
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetSessions([FromQuery] Guid teacherId)
        {
            try
            {
                var response = await _supabase.From<Session>()
                    .Select("*")
                    .Filter("teacher_id", Operator.Equals, teacherId.ToString())
                    .Order("created_at", Ordering.Descending)
                    .Get();

                return Ok(new { sessions = response.Models });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch sessions", error = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSessions()
        {
            try
            {
                var response = await _supabase.From<Session>()
                    .Select("*")
                    .Filter("is_active", Operator.Equals, "true")
                    .Get();

                return Ok(new { sessions = response.Models });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch active sessions", error = ex.Message });
            }
        }

        [HttpGet("qr/{sessionCode}")]
        public IActionResult GetSessionQRCode(string sessionCode)
        {
            try
            {
                var qrCodeBase64 = GenerateQRCode(sessionCode);
                return Ok(new { qrCode = qrCodeBase64 });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to generate QR code", error = ex.Message });
            }
        }

        [HttpPost("refresh-qr/{sessionCode}")]
        public IActionResult RefreshQRCode(string sessionCode)
        {
            try
            {
                var qrCodeBase64 = GenerateQRCode(sessionCode);
                return Ok(new { qrCode = qrCodeBase64, sessionCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to refresh QR code", error = ex.Message });
            }
        }

        [HttpPost("end/{sessionCode}")]
        public async Task<IActionResult> EndSession(string sessionCode)
        {
            try
            {
                var session = await _supabase.From<Session>().Filter("session_code", Operator.Equals, sessionCode).Single();

                if (session == null)
                {
                    return NotFound(new { message = "Session not found" });
                }

                session.IsActive = false;
                await session.Update<Session>();

                return Ok(new { message = "Session ended successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to end session", error = ex.Message });
            }
        }

        private string GenerateSessionCode()
        {
            return Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        }

        private string GenerateQRCode(string data)
        {
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            { 
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
                using PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
                byte[] qrCodeImageBytes = qrCode.GetGraphic(20);
                return "data:image/png;base64," + Convert.ToBase64String(qrCodeImageBytes);
            }
        }
    }

    public class CreateSessionRequest
    {
        public string Subject { get; set; } = string.Empty;
        public Guid TeacherId { get; set; }
    }
}
