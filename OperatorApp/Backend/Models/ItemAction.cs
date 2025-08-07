using System;

namespace Backend.Models;

public class ItemAction
{
    public int    Index { get; set; }
    public string Name { get; set; }
    public string LatestActionVersionNumber { get; set; }
    public string LatestRunResult { get; set; }
    public string LatestReportUrl { get; set; }
    public string  LatestRunDateTime { get; set; }
    public string LatestExecuter { get; set; } 
}