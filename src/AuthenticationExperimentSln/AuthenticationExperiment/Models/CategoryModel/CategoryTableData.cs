namespace AuthenticationExperiment.Models.CategoryModel
{
    public class CategoryTableData
    {
        public int RecordsTotal { get; set; }
        public int RecordsFiltered { get; set; }
        public List<string[]> Data { get; set; } = new();
        public int PageSize { get; set; } = 8;
    }
}
