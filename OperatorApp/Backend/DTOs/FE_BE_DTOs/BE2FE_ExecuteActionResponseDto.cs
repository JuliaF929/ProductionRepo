namespace Backend.Models;

public class BE2FE_ExecuteActionResponse
{
    public string version { get; set; }
    public DateTime startExecutionDateTimeUTC { get; set; }
    public DateTime endExecutionDateTimeUTC { get; set; }
    public string executionResult { get; set; }
    public string reportPdfPath { get; set; }
}