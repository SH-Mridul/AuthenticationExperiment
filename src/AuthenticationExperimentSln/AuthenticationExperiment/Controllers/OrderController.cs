using AuthenticationExperiment.Models;
using AuthenticationExperiment.Models.OrderModel;
using Microsoft.AspNetCore.Mvc;

namespace AuthenticationExperiment.Controllers
{
   
     public class OrderController : Controller
     {
            private readonly ILogger<OrderController> _logger;

            public OrderController(ILogger<OrderController> logger)
            {
                _logger = logger;
            }



            private static readonly List<string[]> _dummyOrders = new()
            {
                new[] { "#ORD-2024-001", "Alex Johnson",   "alex.j@example.com",    "https://ui-avatars.com/api/?name=Alex+Johnson&background=0284c7&color=fff",   "$120.00", "Paid",     "Shipped",    "Jan 12, 2024", "ord-001" },
                new[] { "#ORD-2024-002", "Sarah Smith",    "sarah.s@example.com",   "https://ui-avatars.com/api/?name=Sarah+Smith&background=db2777&color=fff",    "$45.50",  "Pending",  "Pending",    "Feb 05, 2024", "ord-002" },
                new[] { "#ORD-2024-003", "Michael Brown",  "m.brown@example.com",   "https://ui-avatars.com/api/?name=Michael+Brown&background=16a34a&color=fff",  "$310.00", "Paid",     "Delivered",  "Feb 14, 2024", "ord-003" },
                new[] { "#ORD-2024-004", "Emma Wilson",    "emma.w@example.com",    "https://ui-avatars.com/api/?name=Emma+Wilson&background=9333ea&color=fff",    "$89.99",  "Refunded", "Cancelled",  "Mar 01, 2024", "ord-004" },
                new[] { "#ORD-2024-005", "James Lee",      "james.l@example.com",   "https://ui-avatars.com/api/?name=James+Lee&background=ea580c&color=fff",      "$220.00", "Paid",     "Processing", "Mar 10, 2024", "ord-005" },
                new[] { "#ORD-2024-006", "Olivia Davis",   "olivia.d@example.com",  "https://ui-avatars.com/api/?name=Olivia+Davis&background=0891b2&color=fff",   "$55.00",  "Pending",  "Pending",    "Mar 22, 2024", "ord-006" },
                new[] { "#ORD-2024-007", "William Martinez","w.martinez@example.com","https://ui-avatars.com/api/?name=William+Martinez&background=4f46e5&color=fff","$430.00","Paid",    "Shipped",    "Apr 03, 2024", "ord-007" },
                new[] { "#ORD-2024-008", "Sophia Anderson","sophia.a@example.com",  "https://ui-avatars.com/api/?name=Sophia+Anderson&background=b45309&color=fff","$78.25",  "Paid",     "Delivered",  "Apr 11, 2024", "ord-008" },
                new[] { "#ORD-2024-009", "Liam Thomas",    "liam.t@example.com",    "https://ui-avatars.com/api/?name=Liam+Thomas&background=065f46&color=fff",    "$199.00", "Pending",  "Processing", "Apr 19, 2024", "ord-009" },
                new[] { "#ORD-2024-010", "Ava Jackson",    "ava.j@example.com",     "https://ui-avatars.com/api/?name=Ava+Jackson&background=be123c&color=fff",    "$66.40",  "Refunded", "Cancelled",  "Apr 28, 2024", "ord-010" },
                new[] { "#ORD-2024-011", "Noah White",     "noah.w@example.com",    "https://ui-avatars.com/api/?name=Noah+White&background=0284c7&color=fff",     "$512.00", "Paid",     "Delivered",  "May 05, 2024", "ord-011" },
                new[] { "#ORD-2024-012", "Isabella Harris","i.harris@example.com",  "https://ui-avatars.com/api/?name=Isabella+Harris&background=7c3aed&color=fff","$33.00",  "Pending",  "Pending",    "May 13, 2024", "ord-012" },
                new[] { "#ORD-2024-013", "Elijah Clark",   "elijah.c@example.com",  "https://ui-avatars.com/api/?name=Elijah+Clark&background=0f766e&color=fff",   "$275.80", "Paid",     "Shipped",    "May 21, 2024", "ord-013" },
                new[] { "#ORD-2024-014", "Mia Lewis",      "mia.l@example.com",     "https://ui-avatars.com/api/?name=Mia+Lewis&background=b91c1c&color=fff",      "$144.00", "Paid",     "Processing", "Jun 02, 2024", "ord-014" },
                new[] { "#ORD-2024-015", "Lucas Robinson", "lucas.r@example.com",   "https://ui-avatars.com/api/?name=Lucas+Robinson&background=1d4ed8&color=fff", "$99.99",  "Refunded", "Cancelled",  "Jun 09, 2024", "ord-015" },
                new[] { "#ORD-2024-016", "Charlotte Walker","c.walker@example.com", "https://ui-avatars.com/api/?name=Charlotte+Walker&background=a21caf&color=fff","$380.00","Paid",    "Delivered",  "Jun 17, 2024", "ord-016" },
                new[] { "#ORD-2024-017", "Mason Hall",     "mason.h@example.com",   "https://ui-avatars.com/api/?name=Mason+Hall&background=4d7c0f&color=fff",     "$22.50",  "Pending",  "Pending",    "Jun 25, 2024", "ord-017" },
                new[] { "#ORD-2024-018", "Amelia Young",   "amelia.y@example.com",  "https://ui-avatars.com/api/?name=Amelia+Young&background=0369a1&color=fff",   "$610.00", "Paid",     "Shipped",    "Jul 04, 2024", "ord-018" },
                new[] { "#ORD-2024-019", "Ethan King",     "ethan.k@example.com",   "https://ui-avatars.com/api/?name=Ethan+King&background=92400e&color=fff",     "$187.30", "Paid",     "Delivered",  "Jul 14, 2024", "ord-019" },
                new[] { "#ORD-2024-020", "Harper Scott",   "harper.s@example.com",  "https://ui-avatars.com/api/?name=Harper+Scott&background=166534&color=fff",   "$49.00",  "Pending",  "Processing", "Jul 22, 2024", "ord-020" },
            };

            private static (List<string[]> rows, int total, int totalDisplay) ApplyDataTablesLogic(OrderListModel model)
            {
                var rows = _dummyOrders.AsEnumerable();

  
                var q = model.Search.Value?.Trim().ToLower() ?? "";
                if (!string.IsNullOrEmpty(q))
                    rows = rows.Where(r =>
                        r[0].ToLower().Contains(q) ||   
                        r[1].ToLower().Contains(q) ||   
                        r[2].ToLower().Contains(q));    

                var si = model.SearchItem;

                if (!string.IsNullOrWhiteSpace(si?.OrderId))
                    rows = rows.Where(r => r[0].ToLower().Contains(si.OrderId.ToLower()));

                if (!string.IsNullOrWhiteSpace(si?.CustomerName))
                    rows = rows.Where(r => r[1].ToLower().Contains(si.CustomerName.ToLower()));

                if (!string.IsNullOrWhiteSpace(si?.PaymentStatus))
                    rows = rows.Where(r => r[5].Equals(si.PaymentStatus, StringComparison.OrdinalIgnoreCase));

                if (!string.IsNullOrWhiteSpace(si?.OrderStatus))
                    rows = rows.Where(r => r[6].Equals(si.OrderStatus, StringComparison.OrdinalIgnoreCase));

                var filtered = rows.ToList();
                int totalDisplay = filtered.Count;

        
                if (model.Order != null && model.Order.Length > 0)
                {
                    var ord = model.Order[0];
                    bool desc = ord.Dir == "desc";

                    filtered = ord.Column switch
                    {
                        0 => desc ? filtered.OrderByDescending(r => r[0]).ToList()
                                  : filtered.OrderBy(r => r[0]).ToList(),

                        1 => desc ? filtered.OrderByDescending(r => r[1]).ToList()
                                  : filtered.OrderBy(r => r[1]).ToList(),

                        4 => desc ? filtered.OrderByDescending(r => decimal.TryParse(r[4].TrimStart('$'), out var n) ? n : 0).ToList()
                                  : filtered.OrderBy(r => decimal.TryParse(r[4].TrimStart('$'), out var n) ? n : 0).ToList(),

                        5 => desc ? filtered.OrderByDescending(r => r[5]).ToList()
                                  : filtered.OrderBy(r => r[5]).ToList(),

                        6 => desc ? filtered.OrderByDescending(r => r[6]).ToList()
                                  : filtered.OrderBy(r => r[6]).ToList(),

                        7 => desc ? filtered.OrderByDescending(r => r[7]).ToList()
                                  : filtered.OrderBy(r => r[7]).ToList(),

                        _ => filtered
                    };
                }

                // Paginate
                var paged = filtered
                    .Skip(model.Start)
                    .Take(model.PageSize)
                    .ToList();

                return (paged, _dummyOrders.Count, totalDisplay);
            }



            [HttpGet]
            public IActionResult Index()
            {
                const int pageSize = 8;

                try
                {
                    var firstPageModel = new OrderListModel
                    {
                        Start = 0,
                        Length = pageSize,
                        Order = Array.Empty<SortColumn>(),
                        Search = new DataTablesSearch { Value = "", Regex = false },
                        SearchItem = new OrderAdvanceSearchModel()
                    };

                    var (rows, total, totalDisplay) = ApplyDataTablesLogic(firstPageModel);

                    var vm = new OrderPageViewModel
                    {
                        TotalOrders = total,
                        PendingOrders = _dummyOrders.Count(r => r[6] == "Pending"),
                        DeliveredOrders = _dummyOrders.Count(r => r[6] == "Delivered"),

                        TableData = new OrderTableData
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
                    _logger.LogError(ex, "Error loading orders page");
                    return View(new OrderPageViewModel());
                }
            }



            [HttpPost]
            public IActionResult GetOrdersData([FromBody] OrderListModel model)
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
                    _logger.LogError(ex, "Error fetching orders data");
                    return Json(DataTables.EmptyResult);
                }
            }
     }
}
