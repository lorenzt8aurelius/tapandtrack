namespace TapAndTrack.Models
{
    public class TimerSession
    {
        public string SessionCode { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired { get; set; }
    }

    public class CreateTimerSessionRequest
    {
        public Guid TeacherId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public int DurationMinutes { get; set; } = 60;
    }
}
