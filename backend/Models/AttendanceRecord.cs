using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace TapAndTrack.Models
{
    [Table("attendance")]
    public class AttendanceRecord : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        [Column("student_id")]
        public Guid StudentId { get; set; }

        [Column("session_code")]
        public string SessionCode { get; set; } = string.Empty;

        [Column("time_in")]
        public DateTime TimeIn { get; set; }
    }
}