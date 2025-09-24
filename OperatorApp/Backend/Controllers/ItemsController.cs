using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text;
using System.Net.Http;

namespace Backend.Controllers;

public class NewItemDto
{
    public string SerialNumber { get; set; }
    public string Type { get; set; }
}

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
    public IActionResult GetAllItems()
    {
        _items.Clear(); // remove old items
        _items.AddRange(new[]
        {
            new Item { SerialNumber = "001", Type = new ItemType {Name = "Type A"} },
            new Item { SerialNumber = "002", Type = new ItemType {Name = "Type B"} },
            new Item { SerialNumber = "003", Type = new ItemType {Name = "Type C"} }
        });

        _logger.LogInformation("kuku");
        return Ok(_items);
    }

    [HttpPost]
    public async Task<IActionResult> CreateNewItem([FromBody] Item newItem)
    {
        try
        {            
            _logger.LogInformation ($"CreateNewItem called - SN - {newItem.SerialNumber}, type - {newItem.Type}.");
         
            if (string.IsNullOrWhiteSpace(newItem.SerialNumber))
                return BadRequest("Item Serial Number is required");

            var newItemToServer = new NewItemDto
            {
                SerialNumber = newItem.SerialNumber,
                Type = newItem.Type!.Name
            };

            // ❗ Explicitly disable camelCase when serializing
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

            //GetAllDefaultParametersForItemType(newItem.Type.Name);
            //_items.Add(newItem);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogInformation ($"CreateNewItem with item SN {newItem.SerialNumber} and type {newItem.Type!.Name} got exception. Ex. {ex.Message}");
            return BadRequest("Exception in CreateNewItem");
        }
    }

    // //this is an internal function that shall be used during new item creation
    // public async Task<List<string>> GetAllDefaultParametersForItemType(string itemType)
    // {
    //     _logger.LogInformation($"GetAllDefaultParametersForItemType - going to retrieve all parameter defaults for item of type {itemType}");
        
    //     // GET all default parameters for item type request
    //     var response = await _client.GetAsync("api/parameter-defaults/" + itemType);
    //     response.EnsureSuccessStatusCode();

    //     string result = await response.Content.ReadAsStringAsync();
    //     _logger.LogInformation ($"GetAllDefaultParametersForItemType - recieved {result} from server.");

    //     return new List<string>();

    // }
}


