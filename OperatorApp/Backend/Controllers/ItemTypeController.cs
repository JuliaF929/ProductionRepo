using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemTypeController : ControllerBase
{
    private readonly ILogger<ItemTypeController> _logger;
    private static List<ItemType> _itemTypes = new List<ItemType>();
    private readonly AppConfig _config;
    private readonly HttpClient _client;

    public ItemTypeController(ILogger<ItemTypeController> logger, 
                              IOptions<AppConfig> config,
                              IHttpClientFactory factory)
    {
        _logger = logger;
        _config = config.Value;
        _client = factory.CreateClient("ServerApi");
    }

    [HttpGet]
    public async Task<IActionResult> GetAllItemTypes()
    {
        _itemTypes.Clear(); // remove old item types

        // GET all item types request
        var response = await _client.GetAsync("api/item-types");
        response.EnsureSuccessStatusCode();

        string result = await response.Content.ReadAsStringAsync();
        _logger.LogInformation ($"GetAllItemTypes - recieved {result} from server.");

        using var doc = JsonDocument.Parse(result);
        var names = doc.RootElement.EnumerateArray()
                                                .Select(e => e.GetProperty("name").GetString())
                                                .Where(n => !string.IsNullOrWhiteSpace(n))
                                                .Distinct();

        _itemTypes.AddRange(names.Select(n => new ItemType { Name = n }));

        _logger.LogInformation($"GetAllItemTypes - {JsonSerializer.Serialize(_itemTypes)}");
        return Ok(_itemTypes);
    }
}


