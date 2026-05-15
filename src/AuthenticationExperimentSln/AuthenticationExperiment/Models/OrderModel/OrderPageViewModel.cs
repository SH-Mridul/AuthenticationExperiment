namespace AuthenticationExperiment.Models.OrderModel
{
    public class OrderPageViewModel
    {
        public OrderTableData TableData { get; set; } = new();
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int DeliveredOrders { get; set; }
    }
}
