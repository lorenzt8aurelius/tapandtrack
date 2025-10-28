using Microsoft.AspNetCore.Mvc;
using static Supabase.Postgrest.Constants;
using TapAndTrack.Models;

namespace TapAndTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public AnalyticsController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        [HttpGet("session/{sessionCode}/stats")]
        public async Task<IActionResult> GetSessionStats(string sessionCode)
        {
            try
            {
                var sessionResponse = await _supabase.From<Session>()
                    .Select("*")
                    .Filter("session_code", Operator.Equals, sessionCode)
                    .Single();

                if (sessionResponse == null)
                {
                    return NotFound(new { message = "Session not found" });
                }

                var attendanceResponse = await _supabase
                    .From<Models.AttendanceRecord>()
                    .Select("*")
                    .Filter("session_code", Operator.Equals, sessionCode)
                    .Get();

                var attendanceList = attendanceResponse?.Models ?? new List<Models.AttendanceRecord>();
                
                var stats = new
                {
                    totalAttendance = attendanceList.Count,
                    firstAttendance = attendanceList.Any() ? attendanceList.Min(x => x.TimeIn) : (DateTime?)null,
                    lastAttendance = attendanceList.Any() ? attendanceList.Max(x => x.TimeIn) : (DateTime?)null,
                    attendees = attendanceList.Select(a => new { a.StudentId, a.TimeIn })
                };

                return Ok(new { stats });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch stats", error = ex.Message });
            }
        }

        [HttpGet("teacher/{teacherId}/overview")]
        public async Task<IActionResult> GetTeacherOverview(Guid teacherId)
        {
            try
            {
                var sessionsResponse = await _supabase.From<Models.Session>()
                    .Select("*")
                    .Filter("teacher_id", Operator.Equals, teacherId.ToString())
                    .Get();

                var sessionsList = sessionsResponse?.Models ?? new List<Models.Session>();

                var totalSessions = sessionsList.Count;
                var activeSessions = sessionsList.Count(s => s.IsActive == true);
                var totalAttendance = 0;

                foreach (var session in sessionsList)
                {
                    var attendanceResponse = await _supabase
                        .From<Models.AttendanceRecord>()
                        .Select("*")
                        .Filter("session_code", Operator.Equals, session.SessionCode)
                        .Get();

                    if (attendanceResponse != null)
                    {
                        totalAttendance += attendanceResponse.Models.Count;
                    }
                }

                var overview = new
                {
                    totalSessions,
                    activeSessions,
                    completedSessions = totalSessions - activeSessions,
                    totalAttendance,
                    averageAttendancePerSession = totalSessions > 0 ? totalAttendance / totalSessions : 0
                };

                return Ok(new { overview });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch overview", error = ex.Message });
            }
        }

        [HttpGet("student/{studentId}/overview")]
        public async Task<IActionResult> GetStudentOverview(Guid studentId)
        {
            try
            {
                var attendanceResponse = await _supabase.From<Models.AttendanceRecord>()
                    .Select("*")
                    .Filter("student_id", Operator.Equals, studentId.ToString())
                    .Order("time_in", Ordering.Descending)
                    .Get();

                var attendanceList = attendanceResponse?.Models ?? new List<Models.AttendanceRecord>();

                var today = DateTime.UtcNow.Date;
                var startOfWeek = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
                var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

                var overview = new
                {
                    totalAttendance = attendanceList.Count,
                    todayAttendance = attendanceList.Count(a => a.TimeIn.Date == today),
                    thisWeekAttendance = attendanceList.Count(a => a.TimeIn.Date >= startOfWeek.Date),
                    thisMonthAttendance = attendanceList.Count(a => a.TimeIn.Date >= startOfMonth.Date),
                    recentAttendance = attendanceList.Take(10).ToList()
                };

                return Ok(new { overview });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch overview", error = ex.Message });
            }
        }

        [HttpGet("export/{sessionCode}")]
        public async Task<IActionResult> ExportSessionData(string sessionCode)
        {
            try
            {
                var attendanceResponse = await _supabase.From<Models.AttendanceRecord>()
                    .Select("*")
                    .Filter("session_code", Operator.Equals, sessionCode)
                    .Order("time_in", Ordering.Ascending)
                    .Get();

                var sessionResponse = await _supabase
                    .From<Models.Session>()
                    .Select("*")
                    .Filter("session_code", Operator.Equals, sessionCode)
                    .Single();

                var exportData = new
                {
                    session = sessionResponse,
                    attendance = attendanceResponse?.Models,
                    exportedAt = DateTime.UtcNow
                };

                return Ok(new { data = exportData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to export data", error = ex.Message });
            }
        }
    }
}
