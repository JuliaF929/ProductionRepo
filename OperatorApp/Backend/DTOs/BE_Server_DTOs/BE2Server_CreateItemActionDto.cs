namespace Backend.DTOs;

public class ActionParameter
{
    public string name { get; set; }
    public string value { get; set; }
}

public class BE2Server_CreateItemActionDto
{
    public string itemSerialNumber { get; set; }
    public string itemType { get; set; }
    public string actionName { get; set; }
    public string actionSWVersion { get; set; }
    public string calibrixOperatorAppSWVersion { get; set; }
    public DateTime startExecutionDateTimeUTC { get; set; }
    public DateTime endExecutionDateTimeUTC { get; set; }
    public string result { get; set; }
    public string errorMsg { get; set; }
    public string stationName { get; set; }
    public string siteName { get; set; }
    public string operatorName { get; set; }
    public List<ActionParameter> parameters { get; set; }
}