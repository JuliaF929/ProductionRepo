namespace Backend.Models;

public class Item
{
    public string SerialNumber { get; set; }
    public ItemType Type { get; set; }
    public string CreationDate {get; set; }
    public string ReleaseDate {get; set; }
}