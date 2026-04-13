using AuthenticationExperiment.Data;
using AuthenticationExperiment.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AuthenticationExperiment.Controllers
{
    public class ProductController : Controller
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<ProductController> _logger;
        private readonly ApplicationDbContext _context;
        private const string ProductListCacheKey = "product_list";

        public ProductController(IMemoryCache cache, ApplicationDbContext context, ILogger<ProductController> logger)
        {
            _cache = cache;
            _logger = logger;
            _context = context;
        }
        public async Task<IActionResult> IndexAsync()
        {
            if (!_cache.TryGetValue(ProductListCacheKey, out List<Product> products))
            {
                products = await _context.Products.ToListAsync();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

                _cache.Set(ProductListCacheKey, products, cacheOptions);
            }

            return View(products);
        }
    }
}
