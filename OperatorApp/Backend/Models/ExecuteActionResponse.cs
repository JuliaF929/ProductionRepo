namespace Backend.Models;

public class ExecuteActionResponse
{
    public string version { get; set; }
    public string startExecutionDateTime { get; set; }
    public string endExecutionDateTime { get; set; }
    public string executionResult { get; set; }
    public string reportPdfPath { get; set; }
}