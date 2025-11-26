namespace Backend.DTOs;

public class BE2Server_ActionDataDto
{
    public string itemType { get; set; }
    public string itemSN { get; set; }
    public string actionName { get; set; }
    public string actionSWVersion { get; set; }
    public DateTime endExecutionDateTimeUTC { get; set; }
}