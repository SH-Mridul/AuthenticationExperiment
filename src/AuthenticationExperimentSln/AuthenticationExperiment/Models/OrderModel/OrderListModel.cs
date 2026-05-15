namespace AuthenticationExperiment.Models.OrderModel
{
    public class OrderListModel : DataTables
    {
        public OrderAdvanceSearchModel SearchItem { get; set; } = new();
    }
}
