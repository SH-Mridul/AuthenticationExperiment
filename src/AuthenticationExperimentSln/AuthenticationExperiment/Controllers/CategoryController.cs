using AuthenticationExperiment.Models;
using AuthenticationExperiment.Models.CategoryModel;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Web;

namespace AuthenticationExperiment.Controllers
{
    public class CategoryController : Controller
    {
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(ILogger<CategoryController> logger)
        {
            _logger = logger;
        }

        private static readonly List<string[]> _dummyRows = new()
        {
            new[] { "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100", "Electronics",            "12", "23",  "cat-001" },
            new[] { "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100", "Watches &amp; Accessories","8",  "45",  "cat-002" },
            new[] { "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100",    "Footwear",               "6",  "98",  "cat-003" },
            new[] { "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100",    "Home &amp; Living",      "15", "67",  "cat-004" },
            new[] { "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=100", "Sports &amp; Outdoors",  "10", "112", "cat-005" },
            new[] { "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=100", "Fashion &amp; Clothing", "20", "203", "cat-006" },
            new[] { "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100", "Cameras &amp; Photography","5", "34", "cat-007" },
            new[] { "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=100", "Computers &amp; Laptops","9",  "56",  "cat-008" },
            new[] { "https://images.unsplash.com/photo-1519183071298-a2962e7b8f5b?w=100", "Mobile Phones",          "11", "89",  "cat-009" },
            new[] { "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=100", "Beauty &amp; Personal Care","7","44", "cat-010" },
            new[] { "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100",    "Smart Home",             "4",  "18",  "cat-011" },
            new[] { "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100",    "Bags &amp; Luggage",     "6",  "37",  "cat-012" },
            new[] { "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100", "Audio &amp; Headphones", "8",  "29",  "cat-013" },
            new[] { "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100",    "Books &amp; Stationery", "3",  "72",  "cat-014" },
            new[] { "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100", "Sunglasses &amp; Eyewear","5", "21",  "cat-015" },
            new[] { "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100", "Food &amp; Beverages",   "14", "108", "cat-016" },
            new[] { "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=100", "Toys &amp; Games",       "9",  "63",  "cat-017" },
            new[] { "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100",    "Jewellery",              "6",  "52",  "cat-018" },
            new[] { "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=100", "Pet Supplies",           "5",  "38",  "cat-019" },
            new[] { "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=100", "Art &amp; Craft",        "4",  "27",  "cat-020" },
        };

        // Subcategories keyed by category id
        private static readonly Dictionary<string, object[]> _dummySubcategories = new()
        {
            ["cat-001"] = new object[]
            {
                new { name = "Headphones",      sku = "ELEC-HP",  color = "#1e293b", stock = 12, price = 129.00 },
                new { name = "Smart TVs",        sku = "ELEC-TV",  color = "#0284c7", stock = 3,  price = 499.00 },
                new { name = "Charging Cables",  sku = "ELEC-CBL", color = "#64748b", stock = 0,  price = 9.99  },
            },
            ["cat-002"] = new object[]
            {
                new { name = "Luxury Watches",   sku = "WTC-LUX",  color = "#92400e", stock = 5,  price = 350.00 },
                new { name = "Smart Bands",       sku = "WTC-BND",  color = "#1d4ed8", stock = 22, price = 79.00  },
            },
            ["cat-003"] = new object[]
            {
                new { name = "Running Shoes",    sku = "SHO-RUN",  color = "#dc2626", stock = 34, price = 89.00  },
                new { name = "Casual Sneakers",  sku = "SHO-CAS",  color = "#d1d5db", stock = 2,  price = 59.00  },
                new { name = "Formal Shoes",     sku = "SHO-FRM",  color = "#0f172a", stock = 8,  price = 119.00 },
            },
            ["cat-004"] = new object[]
            {
                new { name = "Sofas",            sku = "HOM-SFA",  color = "#a3a3a3", stock = 6,  price = 699.00 },
                new { name = "Curtains",          sku = "HOM-CRT",  color = "#fbbf24", stock = 40, price = 29.00  },
            },
            ["cat-005"] = new object[]
            {
                new { name = "Treadmills",       sku = "SPT-TRD",  color = "#16a34a", stock = 4,  price = 890.00 },
                new { name = "Yoga Mats",         sku = "SPT-YGA",  color = "#9333ea", stock = 55, price = 24.00  },
                new { name = "Dumbbells",         sku = "SPT-DUM",  color = "#475569", stock = 0,  price = 45.00  },
            },
            ["cat-006"] = new object[]
            {
                new { name = "Men's T-Shirts",   sku = "FSH-MTS",  color = "#1e40af", stock = 120, price = 19.99 },
                new { name = "Women's Dresses",  sku = "FSH-WDR",  color = "#db2777", stock = 3,   price = 49.99 },
            },
            ["cat-007"] = new object[]
            {
                new { name = "DSLR Cameras",     sku = "CAM-DSL",  color = "#292524", stock = 7,  price = 799.00 },
                new { name = "Tripods",           sku = "CAM-TRP",  color = "#78716c", stock = 14, price = 49.00  },
            },
        };

        // ── Dummy sort + search + paginate helper ──────────────────────────────
        private static (List<string[]> rows, int total, int totalDisplay)
            ApplyDataTablesLogic(CategoryListModel model)
        {
            var rows = _dummyRows.AsEnumerable();

            // Global search (model.Search.Value)
            var searchVal = model.Search.Value?.Trim().ToLower() ?? "";
            if (!string.IsNullOrEmpty(searchVal))
                rows = rows.Where(r => r[1].ToLower().Contains(searchVal));

            // Advanced search (model.SearchItem?.Name)
            var nameFilter = model.SearchItem?.Name?.Trim().ToLower() ?? "";
            if (!string.IsNullOrEmpty(nameFilter))
                rows = rows.Where(r => r[1].ToLower().Contains(nameFilter));

            var filtered = rows.ToList();
            int totalDisplay = filtered.Count;

            // Sort (model.Order[0])
            if (model.Order != null && model.Order.Length > 0)
            {
                var ord = model.Order[0];
                bool isNumericCol = ord.Column == 2 || ord.Column == 3; // subcat / product counts

                filtered = isNumericCol
                    ? (ord.Dir == "desc"
                        ? filtered.OrderByDescending(r => int.TryParse(r[ord.Column], out var n) ? n : 0).ToList()
                        : filtered.OrderBy(r => int.TryParse(r[ord.Column], out var n) ? n : 0).ToList())
                    : (ord.Dir == "desc"
                        ? filtered.OrderByDescending(r => r[ord.Column]).ToList()
                        : filtered.OrderBy(r => r[ord.Column]).ToList());
            }

            // Page
            var paged = filtered
                .Skip(model.Start)
                .Take(model.PageSize)
                .ToList();

            return (paged, _dummyRows.Count, totalDisplay);
        }


        [HttpGet]
        public IActionResult Index()
        {
            const int pageSize = 8;

            try
            {
                // Simulate page-1 / default sort using the same helper
                var firstPageModel = new CategoryListModel
                {
                    Start = 0,
                    Length = pageSize,
                    Order = Array.Empty<SortColumn>(),
                    Search = new DataTablesSearch { Value = "", Regex = false },
                    SearchItem = new CategoryAdvanceSearchModel()
                };

                var (rows, total, totalDisplay) = ApplyDataTablesLogic(firstPageModel);

                var vm = new CategoryPageViewModel
                {
                    TotalCategories = total,
                    TotalSubcategories = _dummySubcategories.Values.Sum(s => s.Length),
                    TotalProducts = _dummyRows.Sum(r => int.TryParse(r[3], out var n) ? n : 0),

                    TableData = new CategoryTableData
                    {
                        RecordsTotal = total,
                        RecordsFiltered = totalDisplay,
                        PageSize = pageSize,
                        Data = rows
                    }
                };

                return View(vm);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading categories page");
                return View(new CategoryPageViewModel());
            }
        }


        [HttpPost]
        public IActionResult GetCategoriesData([FromBody] CategoryListModel model)
        {
            try
            {
                var (rows, total, totalDisplay) = ApplyDataTablesLogic(model);

                return Json(new
                {
                    recordsTotal = total,
                    recordsFiltered = totalDisplay,
                    data = rows.ToArray()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching categories data");
                return Json(DataTables.EmptyResult);
            }
        }


        [HttpGet]
        public IActionResult GetSubcategories(string id)
        {
            if (_dummySubcategories.TryGetValue(id, out var subs))
                return Json(subs);

            return Json(Array.Empty<object>());
        }
    }

}
