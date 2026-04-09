using AuthenticationExperiment.Data;
using AuthenticationExperiment.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace AuthenticationExperiment.Utility.DbIdentityStore
{
    using Microsoft.Extensions.DependencyInjection;

    public class PostgresTicketStore : ITicketStore
    {
        private readonly IServiceProvider _services;

        public PostgresTicketStore(IServiceProvider services)
        {
            _services = services;
        }

        public async Task<string> StoreAsync(AuthenticationTicket ticket)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var key = Guid.NewGuid().ToString();
            var data = TicketSerializer.Default.Serialize(ticket);

            db.AuthSessions.Add(new AuthSession
            {
                Id = key,
                Value = data,
                ExpiresAt = ticket.Properties.ExpiresUtc?.UtcDateTime ?? DateTime.UtcNow.AddHours(1)
            });

            await db.SaveChangesAsync();
            return key;
        }

        public async Task<AuthenticationTicket?> RetrieveAsync(string key)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var session = await db.AuthSessions.FindAsync(key);
            if (session == null || session.ExpiresAt < DateTime.UtcNow)
                return null;

            return TicketSerializer.Default.Deserialize(session.Value);
        }

        public async Task RenewAsync(string key, AuthenticationTicket ticket)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var session = await db.AuthSessions.FindAsync(key);
            if (session != null)
            {
                session.Value = TicketSerializer.Default.Serialize(ticket);
                session.ExpiresAt = ticket.Properties.ExpiresUtc?.UtcDateTime ?? DateTime.UtcNow.AddHours(1);
                await db.SaveChangesAsync();
            }
        }

        public async Task RemoveAsync(string key)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var session = await db.AuthSessions.FindAsync(key);
            if (session != null)
            {
                db.AuthSessions.Remove(session);
                await db.SaveChangesAsync();
            }
        }
    }
}
