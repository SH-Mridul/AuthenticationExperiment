namespace AuthenticationExperiment.Models.OrderModel
{
    public class OrderAdvanceSearchModel
    {
        public string? OrderId { get; set; }  
        public string? CustomerName { get; set; }
        public string? PaymentStatus { get; set; }  
        public string? OrderStatus { get; set; } 
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }
}
