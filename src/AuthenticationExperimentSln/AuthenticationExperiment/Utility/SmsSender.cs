
using AuthenticationExperiment.Models.Sms;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace AuthenticationExperiment.Utility
{
    public class SmsSender : ISmsSender
    {

        private readonly SmsSettingsModel _settings;

        public SmsSender(IOptions<SmsSettingsModel> settings)
        {
            _settings = settings.Value;
        }
        public async Task SendSmsAsync(string number, string message)
        {
            using (var client = new HttpClient())
            {
             
                client.BaseAddress = new Uri(_settings.Api);
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var response = client.GetAsync("?api_key=" + _settings.Key + "&msg=" + message + "&to=" + number).Result;
                using (HttpContent content = response.Content)
                {
                    var smsResult = content.ReadAsStringAsync().Result;
                    dynamic smsResp = JsonConvert.DeserializeObject(smsResult);

                    if (smsResp.error == "0")
                    {
                        Console.WriteLine(smsResp.msg);
                    }
                    else
                    {
                        Console.WriteLine("Sms Not Send, " + smsResp.msg);
                    }

                }
            }
        }
    }
}
