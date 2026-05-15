using AuthenticationExperiment.Models;
using Fluid;
using Microsoft.AspNetCore.Mvc;
using System;

namespace AuthenticationExperiment.Controllers
{
    public class FluidTestController : Controller
    {
        public IActionResult Index()
        {
            var templateSource = @"
                <div style='font-family:Arial; background:#f9f9f9; padding:20px; border-radius:8px;'>
                  <h2 style='color:#2c3e50;'>Welcome, {{ user }}!</h2>
                  <p style='color:#555;'>Today is <strong>{{ date }}</strong>.</p>
  
                  <div style='margin-top:15px; padding:10px; background:#ecf0f1; border-left:4px solid #3498db;'>
                    <p>Your favorite quote:</p>
                    <blockquote style='font-style:italic; color:#34495e;'>{{ quote }}</blockquote>
                  </div>
  
                  <footer style='margin-top:20px; font-size:12px; color:#999;'>
                    Powered by Fluid & Liquid
                  </footer>
                </div>";

            var parser = new FluidParser();
            if (parser.TryParse(templateSource, out var template, out var errors))
            {
                var context = new TemplateContext();
                context.SetValue("user", "Sakhawat");
                context.SetValue("date", DateTime.Now.ToString("dddd, dd MMMM yyyy"));
                context.SetValue("quote", "Knowledge is power, but wisdom is using it well.");

                var result = template.Render(context);
                return Content(result, "text/html");
            }

            return Content("Template parsing failed: " + string.Join(", ", errors));
        }


        public IActionResult User()
        {
            var person = new Person { FirstName = "Sakhawat", LastName = "Hossain" };

            var parser = new FluidParser();
            var templateSource = System.IO.File.ReadAllText("Views/fluidtest/user.liquid");

            if (parser.TryParse(templateSource, out var template, out var errors))
            {
                var context = new TemplateContext();
                context.SetValue("person", person);

                var result = template.Render(context);
                return Content(result, "text/html");
            }

            return Content("Template parsing failed: " + string.Join(", ", errors));
        }

        
    }
}
