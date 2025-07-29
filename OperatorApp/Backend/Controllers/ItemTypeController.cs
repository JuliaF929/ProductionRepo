using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemTypeController : ControllerBase
{
    private readonly ILogger<ItemTypeController> _logger;
    private static List<ItemType> _itemTypes = new List<ItemType>();

    public ItemTypeController(ILogger<ItemTypeController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAllItemTypes()
    {
        _itemTypes.Clear(); // remove old item types
        _itemTypes.AddRange(new[]
        {
            new ItemType { Name = "Type AA" },
            new ItemType { Name = "Type BB" },
            new ItemType { Name = "Type CC" }
        });

        _logger.LogInformation($"GetAllItemTypes - {JsonSerializer.Serialize(_itemTypes)}");
        return Ok(_itemTypes);
    }
}


