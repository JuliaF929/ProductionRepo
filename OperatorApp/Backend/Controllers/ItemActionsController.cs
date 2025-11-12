using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text.Json;
using Backend.DTOs;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemActionsController : ControllerBase
{
    private readonly ILogger<ItemActionsController> _logger;
    private readonly HttpClient _client;

    public ItemActionsController(ILogger<ItemActionsController> logger, IHttpClientFactory factory)
    {
        _logger = logger;
        _client = factory.CreateClient("ServerApi");
    }

    [HttpGet]
    public async Task<IActionResult> GetAllItemActions(string itemSN, string itemTypeName)
    {
        List<BE2FE_ActionForItemDto> _itemActionsDtos = new List<BE2FE_ActionForItemDto>();

        _logger.LogInformation($"GetAllItemActions - going to get item ations for itemSN {itemSN}, item Type Name {itemTypeName}.");
        //1. download merged list of default and done actions for given item according to its item type
        var actions = await _client.GetAsync($"api/test-applications/{itemTypeName}/{itemSN}");
        actions.EnsureSuccessStatusCode();

        var actionsReceivedFromServer = JsonSerializer.Deserialize<List<Server2BE_ActionForItemDto>>(await actions.Content.ReadAsStringAsync());
        _logger.LogInformation($"Got from server : {JsonSerializer.Serialize(actionsReceivedFromServer)}");

        //2. copy server2be dtos list to be2fe dtos list 
        foreach (var actionFromServer in actionsReceivedFromServer)
        {
            BE2FE_ActionForItemDto actionForFEDto = new BE2FE_ActionForItemDto
            {
                itemSerialNumber = actionFromServer.itemSerialNumber,
                itemType = actionFromServer.itemType,
                actionName = actionFromServer.actionName,
                actionSWVersionForExecution = actionFromServer.actionSWVersionForExecution,
                actionExeName = actionFromServer.actionExeName,
                latestExecutionDateTimeUTC = actionFromServer.latestExecutionDateTimeUTC,
                latestResult = actionFromServer.latestResult,
                latestOperatorName = actionFromServer.latestOperatorName,
                latestActionVersionNumber = actionFromServer.latestActionVersionNumber
            };
            _itemActionsDtos.Add(actionForFEDto);
        }

        _logger.LogInformation("ItemActions DTO filled in BE.");
        return Ok(_itemActionsDtos);
    }
}


