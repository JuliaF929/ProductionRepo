using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text;
using System.Net.Http;
using Backend.DTOs;
using System.Reflection;
using System;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class GeneralController : ControllerBase
{
    private readonly ILogger<GeneralController> _logger;
    private readonly HttpClient _client;

    public GeneralController(ILogger<GeneralController> logger, IHttpClientFactory factory)
    {
        _logger = logger;
        _client = factory.CreateClient("ServerApi");
    }

    [HttpGet("version")]
    public async Task<IActionResult> ValidateServerAndVersions()
    {
        try
        {
            // 1. Check server is up + get version
            var response = await _client.GetAsync("api/version");

            if (!response.IsSuccessStatusCode)
            {
                string errMsg = $"Item Serial Number is required. StatusCode={response.StatusCode}.";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }

            var serverVersion = await response.Content.ReadFromJsonAsync<Server2BE_VersionResponseDto>();

            if (serverVersion == null || string.IsNullOrWhiteSpace(serverVersion.serverVersion))
            {
                string errMsg = "Server version response is invalid.";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }

            // 2. Compare be and server versions

            string backendVersion =
                Assembly.GetExecutingAssembly()
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
                .InformationalVersion
                ?? "unknown";
            if (!string.Equals(serverVersion.serverVersion, backendVersion,
                StringComparison.OrdinalIgnoreCase))
            {
                string errMsg = $"Version mismatch. Backend={backendVersion}, Server={serverVersion.serverVersion}";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }

            _logger.LogInformation($"Server connectivity and version check passed. Version={backendVersion}");
            return Ok();
        }
        catch (Exception ex)
        {
            string errMsg = $"Failed to contact server. Ex. message: {ex.Message}";
            _logger.LogError(errMsg);
            return BadRequest(errMsg);
        }
    }
}
