using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthenticationExperiment.Controllers
{
    public class AccountController(SignInManager<IdentityUser> SignInManager, UserManager<IdentityUser> UserManager) : Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager = SignInManager;
        private readonly UserManager<IdentityUser> _userManager = UserManager;

        public IActionResult ExternalLogin(string provider, string returnUrl = null)
        {
            var redirectUrl = Url.Action("ExternalLoginCallback", "Account", new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return Challenge(properties, provider);
        }

        [HttpGet]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            if (remoteError != null)
                return RedirectToAction("Login");

            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
                return RedirectToAction("Login");

            var signInResult = await _signInManager.ExternalLoginSignInAsync(
                info.LoginProvider,
                info.ProviderKey,
                isPersistent: false);

            if (signInResult.RequiresTwoFactor)
            {
                return RedirectToPage("/Account/LoginWith2fa", new
                {
                    area = "Identity",
                    ReturnUrl = returnUrl,
                    RememberMe = false
                });
            }

           if (signInResult.Succeeded)
                return Redirect(returnUrl ?? "/");

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return RedirectToAction("Login");

            var user = new IdentityUser { UserName = email, Email = email };
            var result = await _userManager.CreateAsync(user);

            if (result.Succeeded)
            {
                await _userManager.AddLoginAsync(user, info);
                await _signInManager.SignInAsync(user, isPersistent: false);
                return Redirect(returnUrl ?? "/");
            }

            return RedirectToAction("Login");
        }
    }
}
