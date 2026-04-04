using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace AuthenticationExperiment.Utility
{
    public class EmailSender : IEmailUtility
    {
        private readonly EmailSettings _settings;

        public EmailSender(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async void SendEmail(string email, string subject, string body)
        {
            try
            {
                var client = new SmtpClient(_settings.Host, _settings.Port)
                {
                    Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                    EnableSsl = true
                };

                var mail = new MailMessage
                {
                    From = new MailAddress(_settings.FromEmail, _settings.FromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mail.To.Add(email);
                await client.SendMailAsync(mail);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
            }
        }
    }
}
