using System;

namespace Backend.Models;

public class PlannedAction
{
    public int    Index { get; set; }
    public string Name { get; set; }
    public string PlannedVersion { get; set; }
    public string CloudPath {get; set; }
    public string ExeName { get; set; }
    // public string LatestActionVersionNumber { get; set; }
    // public string LatestRunResult { get; set; }
    // public string LatestReportUrl { get; set; }
    // public string  LatestRunDateTime { get; set; }
    // public string LatestExecuter { get; set; } 
}