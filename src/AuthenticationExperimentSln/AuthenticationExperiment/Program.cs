using AuthenticationExperiment.Data;
using AuthenticationExperiment.Models.OAuthModels.Facebook;
using AuthenticationExperiment.Models.OAuthModels.Google;
using AuthenticationExperiment.Models.Sms;
using AuthenticationExperiment.Utility;
using AuthenticationExperiment.Utility.DbIdentityStore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Serilog;
using System.Configuration;

#region Boostrap Logger
Log.Logger = new LoggerConfiguration()
            .WriteTo.File("Logs/Applog-.txt", rollingInterval: RollingInterval.Day)
            .CreateBootstrapLogger();
#endregion
try
{
    Log.Information("Application Starting......");
    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container.
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));

    builder.Services.AddDatabaseDeveloperPageExceptionFilter();

    builder.Services.AddDefaultIdentity<IdentityUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders() 
    .AddTokenProvider<AuthenticatorTokenProvider<IdentityUser>>(TokenOptions.DefaultAuthenticatorProvider);

    builder.Services.AddSession(options =>
    {
        options.IdleTimeout = TimeSpan.FromMinutes(5);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
    });

    builder.Services.AddDataProtection()
    .PersistKeysToDbContext<ApplicationDbContext>();

    builder.Services.AddDistributedMemoryCache();


    #region store data
    // Register TicketStore
    builder.Services.AddSingleton<ITicketStore, PostgresTicketStore>();

    // Configure cookie middleware
    builder.Services.ConfigureApplicationCookie(options =>
    {
        options.Cookie.Name = ".dev.Auth";
        options.Cookie.HttpOnly = true;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
        options.SlidingExpiration = true;

        // Set SessionStore dynamically at runtime
        options.Events = new CookieAuthenticationEvents
        {
            OnSigningIn = context =>
            {
                var store = context.HttpContext.RequestServices
                    .GetRequiredService<ITicketStore>();

                context.Options.SessionStore = store;
                return Task.CompletedTask;
            }
        };
    });
    #endregion

    #region google authentication settings
    var googleSettings = builder.Configuration
      .GetSection("Authentication:Google")
      .Get<GoogleAuthSettings>();

    builder.Services.AddAuthentication().AddGoogle(options =>
    {
        options.ClientId = googleSettings.ClientId;
        options.ClientSecret = googleSettings.ClientSecret;
        options.CallbackPath = "/signin-google";
    });
    #endregion

    #region facebook login
    var facebookSettings = builder.Configuration
   .GetSection("Authentication:Facebook")
   .Get<FacebookAuthSettings>();

    builder.Services.AddAuthentication().AddFacebook(options =>
    {
        options.AppId = facebookSettings.AppId;
        options.AppSecret = facebookSettings.AppSecret;
        options.CallbackPath = "/signin-facebook";
        options.Fields.Add("email"); 
        options.SaveTokens = true;
    });
    #endregion

    #region SMS settings
    builder.Services.Configure<SmsSettingsModel>(builder.Configuration.GetSection("MobileSmsSettings"));
    builder.Services.AddTransient<ISmsSender, SmsSender>();
    #endregion

    #region mail settings
    builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
    builder.Services.AddTransient<IEmailUtility, EmailSender>();
    #endregion

    #region Serilog
    builder.Host.UseSerilog((ctx, lc) => lc
            .ReadFrom.Configuration(ctx.Configuration));
    #endregion

    builder.Services.AddControllersWithViews();

    var app = builder.Build();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseMigrationsEndPoint();
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
        // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
        app.UseHsts();
    }

    app.UseHttpsRedirection();
    app.UseRouting();

    app.UseSession();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapStaticAssets();

    app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
        .WithStaticAssets();

    app.MapRazorPages()
       .WithStaticAssets();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application Crushed!");
}
finally
{
    Log.CloseAndFlush();
}