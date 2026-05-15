namespace AuthenticationExperiment.Models.CategoryModel
{
    public class CategoryListModel:DataTables
    {
        public CategoryAdvanceSearchModel SearchItem { get; set; } = new();
    }
}
