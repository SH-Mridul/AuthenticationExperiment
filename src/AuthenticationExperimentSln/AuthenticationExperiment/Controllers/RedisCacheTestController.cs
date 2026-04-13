using AuthenticationExperiment.Data;
using AuthenticationExperiment.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace AuthenticationExperiment.Controllers
{
    public class RedisCacheTestController : Controller
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<ProductController> _logger;
        private readonly ApplicationDbContext _context;


        public RedisCacheTestController(IDistributedCache cache, ApplicationDbContext context, ILogger<ProductController> logger)
        {
            _cache = cache;
            _logger = logger;
            _context = context;
        }
        public async Task<IActionResult> IndexAsync()
        {
            var cacheKey = "products";

            var cached = await _cache.GetStringAsync(cacheKey);

            List<Product> products;

            if (cached != null)
            {
                products = JsonConvert.DeserializeObject<List<Product>>(cached);
            }
            else
            {
                // Cache miss → get from PostgreSQL
                products = await _context.Products.ToListAsync();

                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                };

                await _cache.SetStringAsync(cacheKey, JsonConvert.SerializeObject(products), options);
            }

            return View(products);
        }
    }
}
