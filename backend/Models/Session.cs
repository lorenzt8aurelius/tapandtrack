using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace TapAndTrack.Models
{
    [Table("sessions")]
    public class Session : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        [Column("teacher_id")]
        public Guid TeacherId { get; set; }

        [Column("subject")]
        public string Subject { get; set; } = string.Empty;

        [Column("session_code")]
        public string SessionCode { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }
    }
}