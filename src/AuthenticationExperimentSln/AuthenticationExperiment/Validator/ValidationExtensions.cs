using FluentValidation;

namespace AuthenticationExperiment.Validator
{
    public static class ValidationExtensions
    {
        public static IRuleBuilderOptions<T, string?> ValidName<T>(this IRuleBuilder<T, string?> rule)
        {
            return rule
                .NotEmpty()
                .MinimumLength(2)
                .Must(name => !string.IsNullOrWhiteSpace(name) && name.All(char.IsLetter))
                .WithMessage("Invalid name");
        }

        public static IRuleBuilderOptions<T, string?> ValidEmail<T>(this IRuleBuilder<T, string?> rule)
        {
            return rule
                .NotEmpty()
                .EmailAddress()
                .WithMessage("Invalid email address");
        }

        public static IRuleBuilderOptions<T, string?> ValidPassword<T>(this IRuleBuilder<T, string?> rule)
        {
            return rule
                .NotEmpty()
                .MinimumLength(6)
                .Matches(@"[A-Z]")
                .Matches(@"[0-9]")
                .WithMessage("Password must contain uppercase and number");
        }

        public static IRuleBuilderOptions<T, decimal> ValidPrice<T>(this IRuleBuilder<T, decimal> rule)
        {
            return rule
                .GreaterThan(0)
                .WithMessage("Price must be greater than 0");
        }

        public static IRuleBuilderOptions<T, string?> ValidPhone<T>(this IRuleBuilder<T, string?> rule)
        {
            return rule
                .NotEmpty()
                .Matches(@"^\+?[1-9]\d{7,14}$")
                .WithMessage("Invalid phone number");
        }

        public static IRuleBuilderOptions<T, int> ValidNumber<T>(this IRuleBuilder<T, int> rule)
        {
            return rule
                .GreaterThan(0)
                .WithMessage("Must be greater than 0");
        }
    }
}
