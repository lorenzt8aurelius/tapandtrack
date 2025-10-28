using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace TapAndTrack.Models
{
    [Table("users")]
    public class User : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Column("role")]
        public string Role { get; set; } = string.Empty;

        [Column("department")]
        public string? Department { get; set; }

        [Column("year_level")]
        public string? YearLevel { get; set; }
    }
}