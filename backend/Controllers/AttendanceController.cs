using Microsoft.AspNetCore.Mvc;
using TapAndTrack.Models;
using static Supabase.Postgrest.Constants;

namespace TapAndTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public AttendanceController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        [HttpPost("record")]
        public async Task<IActionResult> RecordAttendance([FromBody] AttendanceRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.SessionCode) || request.StudentId == Guid.Empty)
                {
                    return BadRequest(new { message = "SessionCode and StudentId are required" });
                }

                var sessionResponse = await _supabase.From<Session>()
                    .Select("*")
                    .Filter("session_code", Operator.Equals, request.SessionCode)
                    .Single();

                if (sessionResponse == null)
                {
                    return NotFound(new { message = "Session not found" });
                }
                var isActive = sessionResponse.IsActive;

                if (!isActive)
                {
                    return BadRequest(new { message = "This session is no longer active" });
                }

                var existingAttendance = await _supabase
                    .From<AttendanceRecord>()
                    .Select("*")
                    .Filter("student_id", Operator.Equals, request.StudentId.ToString())
                    .Filter("session_code", Operator.Equals, request.SessionCode)
                    .Single();

                if (existingAttendance != null)
                {
                    return BadRequest(new { message = "Attendance already recorded for this session" });
                }

                var attendanceRecord = new AttendanceRecord
                {
                    Id = Guid.NewGuid(),
                    StudentId = request.StudentId,
                    SessionCode = request.SessionCode,
                    TimeIn = DateTime.UtcNow
                };

                var response = await _supabase.From<AttendanceRecord>().Insert(attendanceRecord);
                var newRecord = response.Models.FirstOrDefault();

                if (newRecord == null)
                {
                    return StatusCode(500, new { message = "Failed to record attendance, could not retrieve created record." });
                }

                return Ok(new
                {
                    message = "Attendance recorded successfully",
                    attendance = newRecord
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to record attendance", error = ex.Message });
            }
        }

        [HttpGet("session/{sessionCode}")]
        public async Task<IActionResult> GetSessionAttendance(string sessionCode)
        {
            try
            {
                var response = await _supabase.From<AttendanceRecord>()
                    .Select("*, users(email, department, year_level)")
                    .Filter("session_code", Operator.Equals, sessionCode)
                    .Get();

                return Ok(new { attendance = response.Models });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch attendance", error = ex.Message });
            }
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentAttendance(Guid studentId)
        {
            try
            {
                var response = await _supabase.From<AttendanceRecord>()
                    .Select("*")
                    .Filter("student_id", Operator.Equals, studentId.ToString())
                    .Order("time_in", Ordering.Descending)
                    .Get();

                return Ok(new { attendance = response.Models });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch attendance", error = ex.Message });
            }
        }
    }

    public class AttendanceRequest
    {
        public string SessionCode { get; set; } = string.Empty;
        public Guid StudentId { get; set; }
    }
}
