using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemActionsController : ControllerBase
{
    private readonly ILogger<ItemActionsController> _logger;
    private static List<ItemAction> _itemActions = new List<ItemAction>();

    public ItemActionsController(ILogger<ItemActionsController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAllItemActions(string itemSN)
    {
        //TODO:
        //1. download default actions for given item type
        //2. download actions already done for this itemSN
        //3. remove duplicates for this itemSN so only the latest instance of each action remain
        //4. merge data of actions already done by this itemSN to default actions list for this item type 
        //5. return merged list

        _itemActions.Clear(); // remove old items
        _itemActions.AddRange(new[]
        {
            new ItemAction { Index = 1, Name = "Action_1", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_1"},
            new ItemAction { Index = 2, Name = "Action_2", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_2"},
            new ItemAction { Index = 3, Name = "Action_3", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_3"},
            new ItemAction { Index = 4, Name = "Action_4", LatestActionVersionNumber = "", LatestRunResult = "NotStarted", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = "", LatestExecuter = "Julia_4"}
        });

        _logger.LogInformation("ItemActions filled in BE.");
        return Ok(_itemActions);
    }
}


