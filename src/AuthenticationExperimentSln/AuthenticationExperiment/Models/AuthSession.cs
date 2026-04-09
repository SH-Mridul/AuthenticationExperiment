namespace AuthenticationExperiment.Models
{
    public class AuthSession
    {
        public string Id { get; set; } = default!;
        public byte[] Value { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
    }
}
