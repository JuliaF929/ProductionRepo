using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Diagnostics;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActionController : ControllerBase
{
    private readonly ILogger<ActionController> _logger;
    private const string ACTIONS_RELATIVE_PATH = "CalibrationApplications";
    private const string INPUT_FOLDER_NAME     = "Input";
    private const string OUTPUT_FOLDER_NAME    = "Output";
    private const string REPORT_FOLDER_NAME    = "Reports";


    public ActionController(ILogger<ActionController> logger)
    {
        _logger = logger;
    }

    private Dictionary<string, string> GetOutputJsonData(string targetPath)
    {
        //output.json name shall be called as:
        //"output_" + whatever the action application wants + ".json"
        string[] matchingFiles = Directory.GetFiles(Path.Combine(targetPath, OUTPUT_FOLDER_NAME), "output*.json");

        if (matchingFiles.Length == 0)
        {
            _logger.LogInformation($"No matching JSON files found at {targetPath}.");
            return null;
        }

        string jsonFilePath = matchingFiles[0]; // Use the first matching file
        string jsonContent = System.IO.File.ReadAllText(jsonFilePath);

        _logger.LogInformation($"Json data will be read from {jsonFilePath}");

        // Deserialize into dictionary
        return JsonSerializer.Deserialize<Dictionary<string, string>>(jsonContent);
    }

    private string CreatePdf(string targetPath, 
                             string actionName, 
                             string actionVersionNumber, 
                             string itemSN, 
                             string itemType, 
                             Dictionary<string, string> jsonData)
    {
        string pathForReport = Path.Combine(targetPath, REPORT_FOLDER_NAME);

        //ensure folder exists
        if (!Directory.Exists(pathForReport))
            Directory.CreateDirectory(pathForReport);

        string reportCreationDateTime = DateTime.Now.ToString("yyyyMMMdd_HHmmss");
        string reportPdfName = itemSN + "_" + actionName + "_" + reportCreationDateTime + "_" + "Report.pdf";  
        string outputPath = Path.Combine(pathForReport, reportPdfName);

        var document = new PdfDocument();
        var page = document.AddPage();
        var gfx = XGraphics.FromPdfPage(page);

        var fontHeader = new XFont("Arial", 18, XFontStyle.Bold);
        var font       = new XFont("Arial", 12);

        //header
        int y = 40;
        gfx.DrawString(actionName + " Report", 
                       fontHeader, 
                       XBrushes.Black, 
                       new XRect(0, y, page.Width, 20), 
                       XStringFormats.TopCenter);
        y += 40;


        //report meta data
        Dictionary<string, string> reportMetaData = new Dictionary<string, string>();
        reportMetaData.Add("Item Serial Number", itemSN);
        reportMetaData.Add("Item Type", itemType);
        reportMetaData.Add(actionName + " Version#:", actionVersionNumber);
        reportMetaData.Add("JuliaSW " + "Version#:", "6.6.6.6"); //TODO: set the ver# of this application
        reportMetaData.Add("Site", "Rio de Janeiro;-)"); //TODO: fill real site name
        reportMetaData.Add("Operator Name", "Julia"); //TODO: fill real operator name
        reportMetaData.Add("Report Creation Date and Time", reportCreationDateTime);

        foreach (var key in reportMetaData.Keys)
        {
            gfx.DrawString($"{key}: {reportMetaData[key]}", 
                            font, 
                            XBrushes.Black, 
                            new XRect(40, y, page.Width - 80, 20), 
                            XStringFormats.TopLeft);

            y += 20;
        }

        y += 60;

        // output json data written by the action application
        foreach (var pair in jsonData)
        {
            gfx.DrawString($"{pair.Key}: {pair.Value}", 
                           font, 
                           XBrushes.Black, 
                           new XRect(40, y, page.Width - 80, 20), 
                           XStringFormats.TopLeft);
            y += 20;
        }

        y += 60;

        //table for operator sign
        int startX = 15;
        int startY = y;
        int rowHeight = 30;
        int colWidth = 115;

        string[] headers = { "", "Name", "Role", "Date", "Sign" };
        string[] rows_col_0 = { "Performed by", "Approved by" };
        string[] rows_col_1 = { "Julia", "" };
        string[] rows_col_3 = { reportCreationDateTime, "" };

        // Draw header row
        for (int col = 0; col < headers.Length; col++)
        {
            DrawCell(gfx, font, headers[col], startX + col * colWidth, startY, colWidth, rowHeight);
        }

        // Draw data rows
        string text = string.Empty;
        for (int row = 0; row < 2; row++)
        {
            for (int col = 0; col < headers.Length; col++)
            {
                if (col == 0)
                    text = rows_col_0[row];
                if (col == 1)
                    text = rows_col_1[row];
                if (col == 2)
                    text = "";
                if (col == 3)
                    text = rows_col_3[row];
                if (col == 4)
                    text = "";

                DrawCell(gfx, font, text, startX + col * colWidth, startY + (row + 1) * rowHeight, colWidth, rowHeight);
            }
        }


        document.Save(outputPath);

        return pathForReport;
    }

    private void DrawCell(XGraphics gfx, XFont font, string text, int x, int y, int width, int height)
    {
        // Draw border
        gfx.DrawRectangle(XPens.Black, x, y, width, height);

        // Draw text centered
        gfx.DrawString(text, font, XBrushes.Black,
            new XRect(x, y, width, height),
            XStringFormats.Center);
    }

    [HttpGet("create-report")]
    public IActionResult CreateReport([FromQuery] string actionName,
                                      [FromQuery] string actionVersionNumber, 
                                      [FromQuery] string itemSN,
                                      [FromQuery] string itemType)
    {
        try
        {
            //the output json is located at the OUTPUT_FOLDER_NAME folder
            // relative to the backend's current directory
            string basePath = AppContext.BaseDirectory;
            string targetPath = Path.Combine(basePath, ACTIONS_RELATIVE_PATH);

            _logger.LogInformation($"CreateReport - going to create report for item {itemSN}, action {actionName}, actionVersionNumber {actionVersionNumber}");

            // parse as Dictionary or dynamic if structure is not predefined
            var outputJsonData = GetOutputJsonData(targetPath);
            if (outputJsonData == null)
            {
                return BadRequest("Output json is invalid.");
            }
            
            _logger.LogInformation($"Output Json data read, {outputJsonData}.");


            //put all metadata from json to report
            //put report at "Reports" folder
            string pathForReport = CreatePdf(targetPath, actionName, actionVersionNumber, itemSN, itemType, outputJsonData);

            //TODO: error handling
            return Ok(new { path = pathForReport });
        }
        catch (Exception ex)
        {
            _logger.LogInformation($"Exception in CreateReport, Ex. {ex.Message}.");
            return BadRequest("Exception in CreateReport");
        }
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

            string inputFolderPath = ClearFolder(INPUT_FOLDER_NAME);
            string outputFolderPath = ClearFolder(OUTPUT_FOLDER_NAME);

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

            //TODO: send to the server execution details and the output
            //so all these can be written to DB

            _logger.LogInformation($"Finished executing {actionName}, returning {actionLatestVer}.");
            return Ok(new { version = actionLatestVer });
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
        string targetPath = Path.Combine(basePath, ACTIONS_RELATIVE_PATH, actionName + "_" + actionVersion);

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
        string targetPath = Path.Combine(basePath, ACTIONS_RELATIVE_PATH, folderName);

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


