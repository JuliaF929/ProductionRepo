namespace Backend.DTOs;

public class BE2FE_ActionForItemDto
{
    public string itemSerialNumber { get; set; }
    public string itemType { get; set; }
    public string actionName { get; set; }
    public string actionSWVersionForExecution { get; set; }
    public string actionExeName { get; set; }

    public DateTime? latestExecutionDateTimeUTC { get; set; }
    public string latestResult { get; set; }
    public string latestOperatorName { get; set; }
    public string latestActionVersionNumber { get; set; }
}