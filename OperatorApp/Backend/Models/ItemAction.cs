using System;

namespace Backend.Models;

public class ItemAction
{
    public int    Index { get; set; }
    public string Name { get; set; }
    public string LatestRunStatus { get; set; }
    public string LatestReportUrl { get; set; }
    public DateTime?  LatestRunDateTime { get; set; }
    public string LatestExecuter { get; set; } 
}