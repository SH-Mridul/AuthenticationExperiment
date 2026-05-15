namespace AuthenticationExperiment.Models.OrderModel
{
    public class OrderTableData
    {
        public int RecordsTotal { get; set; }
        public int RecordsFiltered { get; set; }
        public int PageSize { get; set; } = 8;
        public List<string[]> Data { get; set; } = new();
    }
}
