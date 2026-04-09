namespace AuthenticationExperiment.Utility
{
    public interface ISmsSender
    {
       Task SendSmsAsync(string number, string message);
    }
}
