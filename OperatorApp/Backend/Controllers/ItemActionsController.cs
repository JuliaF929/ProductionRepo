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
        _itemActions.Clear(); // remove old items
        _itemActions.AddRange(new[]
        {
            new ItemAction { Index = 1, Name = "Action_1_" + itemSN, LatestRunStatus = "Pass", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = new DateTime(), LatestExecuter = "Julia_1"},
            new ItemAction { Index = 2, Name = "Action_2_" + itemSN, LatestRunStatus = "Fail", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = new DateTime(), LatestExecuter = "Julia_2"},
            new ItemAction { Index = 3, Name = "Action_3_" + itemSN, LatestRunStatus = "Pass", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = new DateTime(), LatestExecuter = "Julia_3"},
            new ItemAction { Index = 4, Name = "Action_4_" + itemSN, LatestRunStatus = "Fail", LatestReportUrl = "/assets/reports/checkA.pdf", LatestRunDateTime = new DateTime(), LatestExecuter = "Julia_4"}
        });

        _logger.LogInformation("ItemActions filled in BE.");
        return Ok(_itemActions);
    }
}


