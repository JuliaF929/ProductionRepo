using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Diagnostics;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActionController : ControllerBase
{
    private readonly ILogger<ActionController> _logger;

    public ActionController(ILogger<ActionController> logger)
    {
        _logger = logger;
    }

    [HttpGet("execute")]
    public IActionResult ExecuteAction([FromQuery] string actionName, [FromQuery] string itemSN)
    {
        try
        {
            _logger.LogInformation($"Starting ExecuteAction for action {actionName}, itemSN {itemSN}");

            string actionLatestVer = "1.2.3.4"; //TODO: get latest version from server
            _logger.LogInformation($"The returned by BE action ver# for action name {actionName} is {actionLatestVer}");

            string actionFolderPath = PrepareActionFolder(actionName, actionLatestVer);
            if (string.IsNullOrWhiteSpace(actionFolderPath))
                return BadRequest("Invalid action folder name");

            string inputFolderPath = ClearFolder("Input");
            string outputFolderPath = ClearFolder("Output");

            //TODO: get item metadata from server
            var data = new Dictionary<string, string>
            {
                { "SerialNumber", itemSN },
                { "Type", "Type A" },
                { "Param1", "12.36" },
                { "Param2", "58.69" }
            };

            string json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });

            string inputFilePath = Path.Combine(inputFolderPath, "input_" + itemSN + ".json");
            System.IO.File.WriteAllText(inputFilePath, json);

               
            RunExecutable(actionFolderPath);

            //TODO: handle action output

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogInformation($"Exception in ExecuteAction, Ex. {ex.Message}.");
            return BadRequest("Exception in ExecuteAction");
        }
    }

    private void RunExecutable(string exePath)
    {
        //TODO: get the executable name for the action from server
        string exeName = "Tzabad_1.exe"; 
        _logger.LogInformation($"Going to start {exeName} action from {exePath}.");

        string exeFullPath = Path.Combine(exePath, exeName);

        var startInfo = new ProcessStartInfo
        {
            FileName = exeFullPath,
            UseShellExecute = true,
            WorkingDirectory = exePath
        };

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        // read output
        //string output = process.StandardOutput.ReadToEnd();
        //string error = process.StandardError.ReadToEnd();

        process.WaitForExit();

        _logger.LogInformation($"Finished running action from {exePath}.");       
    }

    private string PrepareActionFolder(string actionName, string actionVersion)
    {
        // Prevent path traversal
        if (string.IsNullOrWhiteSpace(actionName) || actionName.Contains("..") || Path.IsPathRooted(actionName))
        {
            _logger.LogInformation("PrepareActionFolder - Invalid action name.");
            return string.Empty;
        }

        if (string.IsNullOrWhiteSpace(actionVersion) || actionVersion.Contains("..") || Path.IsPathRooted(actionVersion))
        {
            _logger.LogInformation("PrepareActionFolder - Invalid action version.");
            return string.Empty;
        }

        // relative to the backend's current directory
        string basePath = AppContext.BaseDirectory;
        string targetPath = Path.Combine(basePath, "CalibrationApplications", actionName + "_" + actionVersion);

        if (!Directory.Exists(targetPath))
        {
            Directory.CreateDirectory(targetPath);
            //TODO:
            //1. download from BE a zip for action+ver#
            //2. unzip
            _logger.LogInformation($"The folder {targetPath} did not exist, prepared.");
        }
        else
        {
            _logger.LogInformation($"The folder {targetPath} exists. Doing nothing.");
        }

        _logger.LogInformation($"The folder {targetPath} is ready.");

        return targetPath;
    }

    private string ClearFolder(string folderName)
    {
        // relative to the backend's current directory
        string basePath = AppContext.BaseDirectory;
        string targetPath = Path.Combine(basePath, "CalibrationApplications", folderName);

        if (!Directory.Exists(targetPath))
        {
            Directory.CreateDirectory(targetPath);
            _logger.LogInformation($"The folder {targetPath} did not exist, prepared clear.");
        }
        else
        {
            Directory.Delete(targetPath, recursive: true);
            Directory.CreateDirectory(targetPath);
            _logger.LogInformation($"The folder {targetPath} exists. Doing nothing.");
        }

        _logger.LogInformation($"The folder {targetPath} is ready.");

        return targetPath;
    }

}


