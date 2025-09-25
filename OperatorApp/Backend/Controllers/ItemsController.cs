using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text;
using System.Net.Http;
using Backend.DTOs;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ILogger<ItemsController> _logger;
    private static List<Item> _items = new List<Item>();
    private readonly HttpClient _client;

    public ItemsController(ILogger<ItemsController> logger, IHttpClientFactory factory)
    {
        _logger = logger;
        _client = factory.CreateClient("ServerApi");
    }

    [HttpGet]
    public async Task<IActionResult> GetAllItems()
    {
        _logger.LogInformation("GetAllItems called.");

        _items.Clear(); // remove old items
        _logger.LogInformation("Cleared _items list.");

        // GET all items request
        var response = await _client.GetAsync("api/items");
        response.EnsureSuccessStatusCode();

        string result = await response.Content.ReadAsStringAsync();
        _logger.LogInformation ($"GetAllItems - recieved {result} from server.");

        using var doc = JsonDocument.Parse(result);
        var items = doc.RootElement.EnumerateArray()
                                                .Select(e => new Item
                                                {
                                                    SerialNumber = e.GetProperty("serialNumber").GetString(), // JSON property is case-sensitive
                                                    Type = new ItemType
                                                    {
                                                        Name = e.GetProperty("type").GetString()
                                                    }
                                                })
                                                .Where(i => !string.IsNullOrWhiteSpace(i.SerialNumber))
                                                .DistinctBy(i => i.SerialNumber);

        _items.AddRange(items);

        //TODO: error handling
        _logger.LogInformation($"GetAllItems - {JsonSerializer.Serialize(_items)}");
        return Ok(_items);
    }

    [HttpPost]
    public async Task<IActionResult> CreateNewItem([FromBody] FE2BE_CreateItemDto newItem)
    {
        try
        {            
            _logger.LogInformation ($"CreateNewItem called - SN - {newItem.SerialNumber}, type - {newItem.Type}.");
         
            if (string.IsNullOrWhiteSpace(newItem.SerialNumber))
                return BadRequest("Item Serial Number is required");

            var newItemToServer = new BE2Server_CreateItemDto
            {
                SerialNumber = newItem.SerialNumber,
                Type = newItem.Type!.Name
            };

            //Explicitly disable camelCase when serializing
            var pascalCaseOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = null // <== this is key
            };

            string json = JsonSerializer.Serialize(newItemToServer, pascalCaseOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation ($"Going to post new item {json}.");

            var resp = await _client.PostAsync("api/items", content);
            if (!resp.IsSuccessStatusCode)
            {
                var error = await resp.Content.ReadAsStringAsync();
                string errorStr = $"Error {resp.StatusCode}: {error}";
                _logger.LogInformation (errorStr);
                return BadRequest(new { message = error });
            }

            _logger.LogInformation ($"New item saved successfully at server, status is {resp.StatusCode}.");

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogInformation ($"CreateNewItem with item SN {newItem.SerialNumber} and type {newItem.Type!.Name} got exception. Ex. {ex.Message}");
            return BadRequest("Exception in CreateNewItem");
        }
    }
}


