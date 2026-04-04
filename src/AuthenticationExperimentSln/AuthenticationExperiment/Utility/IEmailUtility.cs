namespace AuthenticationExperiment.Utility
{
    public interface IEmailUtility
    {
        void SendEmail(string email, string subject, string body);
    }
}
