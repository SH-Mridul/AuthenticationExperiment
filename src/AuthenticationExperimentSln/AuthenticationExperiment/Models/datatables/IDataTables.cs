using AuthenticationExperiment.Models;

namespace Demo.Domain
{
    public interface IDataTables
    {
        static abstract object EmptyResult { get; }
        int Length { get; set; }
        SortColumn[] Order { get; set; }
        int PageIndex { get; }
        int PageSize { get; }
        DataTablesSearch Search { get; set; }
        int Start { get; set; }

        string? FormatSortExpression(params string[] columns);
    }
}