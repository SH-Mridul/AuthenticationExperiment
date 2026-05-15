namespace AuthenticationExperiment.Models.CategoryModel
{
    public class CategoryPageViewModel
    {

        public CategoryTableData TableData { get; set; } = new();
        public int TotalCategories { get; set; }
        public int TotalSubcategories { get; set; }
        public int TotalProducts { get; set; }
    }
}
