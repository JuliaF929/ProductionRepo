using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text.Json;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemActionsController : ControllerBase
{
    private readonly ILogger<ItemActionsController> _logger;
    private static List<ItemAction> _itemActions = new List<ItemAction>();
    private readonly HttpClient _client;

    public ItemActionsController(ILogger<ItemActionsController> logger, IHttpClientFactory factory)
    {
        _logger = logger;
        _client = factory.CreateClient("ServerApi");
    }

    [HttpGet]
    public async Task<IActionResult> GetAllItemActions(string itemSN, string itemTypeName)
    {
        //TODO:
        //2. download actions already done for this itemSN
        //3. remove duplicates for this itemSN so only the latest instance of each action remains
        //4. merge data of actions already done by this itemSN to default actions list for this item type 
        //5. return merged list

        _itemActions.Clear();

        _logger.LogInformation($"GetAllItemActions - going to get item ations for itemSN {itemSN}, item Type Name {itemTypeName}.");
        //1. download default actions for given item type
        var actions = await _client.GetAsync($"api/test-applications/{itemTypeName}");
        actions.EnsureSuccessStatusCode();

        var actionsReceivedFromServer = JsonSerializer.Deserialize<List<List<string>>>(await actions.Content.ReadAsStringAsync());
        _logger.LogInformation($"Got from server : {actionsReceivedFromServer}");

        _itemActions = actionsReceivedFromServer
                        .Select((row, index) => new ItemAction
        {
                Index = index + 1,
                Name = row[1], // 2nd value from actionsReceivedFromServer array
                LatestActionVersionNumber = "",
                LatestRunResult = "NotStarted",
                LatestReportUrl = "/assets/reports/checkA.pdf",
                LatestRunDateTime = "",
                LatestExecuter = $"Julia_{index + 1}"
        })
        .ToList();

        // _itemActions.AddRange(new[]
        // {
        //     new ItemAction { Index = 1, Name = actions[1], LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_1"},
        //     new ItemAction { Index = 2, Name = "Action_2", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_2"},
        //     new ItemAction { Index = 3, Name = "Action_3", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_3"},
        //     new ItemAction { Index = 4, Name = "Action_4", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_4"}
        // });

        _logger.LogInformation("ItemActions filled in BE.");
        return Ok(_itemActions);
    }
}


