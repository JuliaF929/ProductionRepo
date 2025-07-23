using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ILogger<ItemsController> _logger;
    private static List<Item> _items = new List<Item>();

    public ItemsController(ILogger<ItemsController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAllItems()
    {
        _items.Clear(); // remove old items
        _items.AddRange(new[]
        {
            new Item { SerialNumber = "001", Type = "Type A" },
            new Item { SerialNumber = "002", Type = "Type B" },
            new Item { SerialNumber = "003", Type = "Type C" }
        });

        _logger.LogInformation("kuku");
        return Ok(_items);
    }

    [HttpPost]
    public IActionResult CreateNewItem([FromBody] Item newItem)
    {
        if (string.IsNullOrWhiteSpace(newItem.SerialNumber))
            return BadRequest("Item Serial Number is required");

        //newItem.Id = Guid.NewGuid().ToString();
        _items.Add(newItem);

        return Ok(newItem);
    }
}


