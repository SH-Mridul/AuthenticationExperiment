using AuthenticationExperiment.Models;
using FluentValidation;

namespace AuthenticationExperiment.Validator
{
    public class UserRegistrationValidator:AbstractValidator<UserRegistrationDto>
    {
        public UserRegistrationValidator()
        {
            RuleFor(x => x.FirstName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .MinimumLength(4)
                .Must(IsValidName)
                .WithMessage("Should be a valid name");

            RuleFor(x => x.LastName)
                .ValidName()
                .NotEmpty()
                .MinimumLength(4)
                .Must(IsValidName)
                .WithMessage("Should be a valid name");

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .WithMessage("Should be a valid email address");
        }

        private static bool IsValidName(string? name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.All(char.IsLetter);
        }
    }
}
