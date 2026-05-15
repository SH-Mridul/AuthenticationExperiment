using AuthenticationExperiment.Models;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace AuthenticationExperiment.Controllers
{
    public class ValidationTestController : Controller
    {
        private readonly IValidator<UserRegistrationDto> _validator;

        public ValidationTestController(IValidator<UserRegistrationDto> validator)
        {
            _validator = validator;
        }
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(UserRegistrationDto model)
        {
            var result = await _validator.ValidateAsync(model);

            if (!result.IsValid)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                }

                return View(model);
            }

            TempData["Success"] = "User registered successfully!";
            return RedirectToAction("Register");
        }
    }
}
