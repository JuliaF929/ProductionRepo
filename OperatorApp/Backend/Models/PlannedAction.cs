using System;

namespace Backend.Models;

public class PlannedAction
{
    public int    Index { get; set; }
    public string Name { get; set; }
    public string PlannedVersion { get; set; }
    public string CloudPath {get; set; }
    public string ExeName { get; set; }
}