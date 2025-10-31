using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Diagnostics;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using Microsoft.Extensions.Options;
using System.Net.Http;
using Backend.Services;
using System.IO.Compression;
using Backend.DTOs;
using System.Text;
using System.Globalization;


namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActionController : ControllerBase
{
    private readonly ILogger<ActionController> _logger;
    private readonly AppConfig _config;
    private readonly HttpClient _client;

    private const string ACTIONS_RELATIVE_PATH = "CalibrationApplications";
    private const string INPUT_FOLDER_NAME     = "Input";
    private const string OUTPUT_FOLDER_NAME    = "Output";
    private const string REPORT_FOLDER_NAME    = "Reports";
    private const string ANGULAR_FOLDER_NAME   = "wwwroot"; 

    
    public ActionController(ILogger<ActionController> logger, IOptions<AppConfig> config, IHttpClientFactory factory)
    {
        _logger = logger;
        _config = config.Value;
        _client = factory.CreateClient("ServerApi");
    }

    private Dictionary<string, string> GetOutputJsonData(string targetPath)
    {
        //output.json name shall be called as:
        //"output_" + whatever the action application wants + ".json"
        string[] matchingFiles = Directory.GetFiles(Path.Combine(targetPath, OUTPUT_FOLDER_NAME), "output*.json");

        if (matchingFiles.Length == 0)
        {
            _logger.LogError($"No matching JSON files found at {targetPath}.");
            return null;
        }

        string jsonFilePath = matchingFiles[0]; // Use the first matching file
        string jsonContent = System.IO.File.ReadAllText(jsonFilePath);

        _logger.LogInformation($"Json data will be read from {jsonFilePath}");

        // Deserialize into dictionary
        return JsonSerializer.Deserialize<Dictionary<string, string>>(jsonContent);
    }

    private string CreatePdf(string basePath, 
                             string actionName, 
                             string actionVersionNumber, 
                             string itemSN, 
                             string itemType, 
                             DateTime endExecutionDateTimeLocal,
                             Dictionary<string, string> jsonData)
    {
        string pathForReport = Path.Combine(basePath, ANGULAR_FOLDER_NAME, REPORT_FOLDER_NAME);

        //ensure folder exists
        if (!Directory.Exists(pathForReport))
            Directory.CreateDirectory(pathForReport);

        string reportPdfName = itemSN + "_" + actionName + "_" + endExecutionDateTimeLocal.ToString("MMM-dd-yyyy_HH_mm", CultureInfo.InvariantCulture) + "_" + "Report.pdf";  
        string reportPdfPathAndName = Path.Combine(pathForReport, reportPdfName);

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
        reportMetaData.Add("Report Creation Date and Time", endExecutionDateTimeLocal.ToString("MMM dd, yyyy, h:mm tt", CultureInfo.InvariantCulture));

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
        int rowHeight = 35;
        int colWidth = 115;

        string[] headers = { "", "Name", "Role", "Date", "Sign" };
        string[] rows_col_0 = { "Performed by", "Approved by" };
        string[] rows_col_1 = { "Julia", "" };
        string[] rows_col_3 = { endExecutionDateTimeLocal.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture) 
                                + "\n" +
                                endExecutionDateTimeLocal.ToString("h:mm tt", CultureInfo.InvariantCulture),"" };

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


        document.Save(reportPdfPathAndName);

        return reportPdfPathAndName;
    }

private void DrawCell(XGraphics gfx, XFont font, string text, int x, int y, int width, int height)
{
    // Draw border
    gfx.DrawRectangle(XPens.Black, x, y, width, height);

    // Split text by newline manually
    var lines = text.Split('\n');

    double lineHeight = font.GetHeight();

    for (int i = 0; i < lines.Length; i++)
    {
        double textY = y + (i + 0.5) * lineHeight;  // adjust vertical positioning
        gfx.DrawString(lines[i].Trim(), font, XBrushes.Black,
            new XRect(x + 2, textY, width - 4, height),
            XStringFormats.TopLeft);
    }
}

    private string CreateReport(string actionName,
                                string actionVersionNumber, 
                                string itemSN,
                                string itemType,
                                DateTime endExecutionDateTimeLocal,
                                Dictionary<string, string> outputJsonData)
    {
        try
        {

            _logger.LogInformation($"CreateReport - going to create report for item {itemSN}, action {actionName}, actionVersionNumber {actionVersionNumber}");

            //put all metadata from json to report
            //put report at "Reports" folder
            string basePath = AppContext.BaseDirectory;
            string pathForReport = CreatePdf(basePath, actionName, actionVersionNumber, itemSN, itemType, endExecutionDateTimeLocal, outputJsonData);
            //in order to pass the pdf path to angular, it shall be interpreted as a relative path as '/Reports/kuku.pdf'
            int basePathLength = basePath.Length;
            string pathForReportForAngularUse = pathForReport.Substring(basePathLength);
            pathForReportForAngularUse = pathForReportForAngularUse.Replace(ANGULAR_FOLDER_NAME, "").Replace("\\", "/");
            pathForReportForAngularUse = _config.BackendUrl + pathForReportForAngularUse;

            //TODO: error handling, if error - return empty string
            return pathForReportForAngularUse;
        }
        catch (Exception ex)
        {
            string errMsg = "Exception in CreateReport";
            _logger.LogError($"{errMsg}, Ex. {ex.Message}.");
            return errMsg;
        }
    }

    public class ParamLite
    {
        public string name { get; set; }
        public string type { get; set; }
        public string value { get; set; }
    }

    [HttpGet("execute")]
    public async Task<IActionResult> ExecuteAction([FromQuery] string actionName, 
                                              [FromQuery] string itemSN,
                                              [FromQuery] string itemType,
                                              [FromQuery] string actionVersion, 
                                              [FromQuery] string actionExeName)
    {
        try
        {
            BE2FE_ExecuteActionResponse actionResponse = new BE2FE_ExecuteActionResponse();

            _logger.LogInformation($"Starting ExecuteAction for action {actionName}, itemSN {itemSN}, itemType {itemType}, actionVersion {actionVersion}, actionExeName {actionExeName}.");

            string actionFolderPath = await PrepareActionFolder(actionName, actionVersion);
            if (string.IsNullOrWhiteSpace(actionFolderPath))
            {
                string errMsg = "Invalid action folder name";
                 _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }

            string inputFolderPath = ClearFolder(INPUT_FOLDER_NAME);
            string outputFolderPath = ClearFolder(OUTPUT_FOLDER_NAME);

            //get item metadata from server regarding the item's parameters
            var itemParameters = await _client.GetAsync($"api/items/{itemSN}");
            itemParameters.EnsureSuccessStatusCode();

            var itemParametersReceivedFromServer = JsonSerializer.Deserialize<List<ParamLite>>(await itemParameters.Content.ReadAsStringAsync());
            _logger.LogInformation($"Parameters for item {itemSN} got from server : {JsonSerializer.Serialize(itemParametersReceivedFromServer)}");

            var dataForInput = new Dictionary<string, string>
            {
                { "SerialNumber", itemSN },
                { "Type", itemType }
            };

            foreach (var param in itemParametersReceivedFromServer)
                dataForInput.Add(param.name, param.value);

            string jsonInput = JsonSerializer.Serialize(dataForInput, new JsonSerializerOptions { WriteIndented = true });

            string inputFilePath = Path.Combine(inputFolderPath, "input_" + itemSN + ".json");
            System.IO.File.WriteAllText(inputFilePath, jsonInput);

            _logger.LogInformation($"Input json for action {actionName}, itemSN {itemSN} written to {inputFilePath} : {jsonInput}");

            DateTime startExecutionDateTimeUTC = DateTime.UtcNow;

            _logger.LogInformation($"About to run executable {actionExeName} for action {actionName}, ver#{actionVersion}, startExecutionDateTimeUTC {startExecutionDateTimeUTC}.");
               
            RunExecutable(actionFolderPath, actionExeName);

            DateTime endExecutionDateTimeUTC = DateTime.UtcNow;

            _logger.LogInformation($"Finished executing {actionName}, ver#{actionVersion}.");

            // parse output*.json to find the Result  entry (mandatory entry)
            var outputJsonData = GetOutputJsonData(Path.Combine(AppContext.BaseDirectory, ACTIONS_RELATIVE_PATH));
            if (outputJsonData == null)
            {
                string errMsg = "ExecuteAction - Output json is invalid.";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }
            var resultEntry = outputJsonData.FirstOrDefault(kvp => kvp.Key == "Result");
            if (string.IsNullOrEmpty(resultEntry.Value))
            {
                string errMsg = "Output json does not contain 'Result' mandatory key.";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }

            string reportPath = CreateReport(actionName, actionVersion, itemSN, itemType, endExecutionDateTimeUTC.ToLocalTime(), outputJsonData);
            if (string.IsNullOrEmpty(reportPath))
            {
                string errMsg = "Failed to create report pdf.";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }
            
            //remove the Result entry from output json data to be saved at server
            outputJsonData.Remove("Result");

            var errorEntry = outputJsonData.FirstOrDefault(kvp => kvp.Key == "Error");
            //remove the Error entry from output json data to be saved at server
            outputJsonData.Remove("Error");

            var newItemActionToServer = new BE2Server_CreateItemActionDto
            {        
                itemSerialNumber = itemSN,
                itemType = itemType,
                actionName = actionName,
                actionSWVersion = actionVersion,
                calibrixOperatorAppSWVersion = "1111",//TODo: set real ver#
                startExecutionDateTimeUTC = startExecutionDateTimeUTC,
                endExecutionDateTimeUTC = endExecutionDateTimeUTC,
                result = resultEntry.Value,
                errorMsg = errorEntry.Value,
                stationName = "StationX", //TODO: fill real station name
                siteName = "Rio de Janeiro", //TODO: fill real site name
                operatorName = "Julia", //TODO: fill real operator name
                parameters = outputJsonData.Select(kvp => new ActionParameter
                {
                    name = kvp.Key,
                    value = kvp.Value
                }).ToList()
            };

            var result = await SaveItemActionAtServer(newItemActionToServer);
            if (result != string.Empty)
            {
                string errMsg = $"Failed to save action execution details at server, err = {result}.";
                _logger.LogError(errMsg);
                return BadRequest(errMsg);
            }

            actionResponse.reportPdfPath = reportPath;
            actionResponse.version = actionVersion;
            actionResponse.startExecutionDateTimeUTC = startExecutionDateTimeUTC;
            actionResponse.endExecutionDateTimeUTC = endExecutionDateTimeUTC;
            actionResponse.executionResult = resultEntry.Value;

            return Ok(actionResponse);
        }
        catch (Exception ex)
        {
            string errMsg = "Exception in ExecuteAction";
            _logger.LogError($"{errMsg}, Ex. {ex.Message}.");
            return BadRequest(errMsg);
        }
    }

    private async Task<string> SaveItemActionAtServer(BE2Server_CreateItemActionDto newItemActionToServer)
    {
        //Explicitly disable camelCase when serializing
        var pascalCaseOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = null // <== this is key
        };

        string json = JsonSerializer.Serialize(newItemActionToServer, pascalCaseOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _logger.LogInformation ($"Going to post new item action : {json}.");

        var resp = await _client.PostAsync("api/item-actions-history", content);
        if (!resp.IsSuccessStatusCode)
        {
            var error = await resp.Content.ReadAsStringAsync();
            string errorStr = $"Error {resp.StatusCode}: {error}";
            _logger.LogError (errorStr);
            return errorStr;
        }

        _logger.LogInformation ($"New item action saved successfully at server, status is {resp.StatusCode}.");

        return string.Empty;
    }

    private void RunExecutable(string exePath, string actionExeName)
    {
        _logger.LogInformation($"Going to start {actionExeName} action from {exePath}.");

        string exeFullPath = Path.Combine(exePath, actionExeName);

        var startInfo = new ProcessStartInfo
        {
            FileName = exeFullPath,
            UseShellExecute = true,
            WorkingDirectory = exePath
        };

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        process.WaitForExit();

        _logger.LogInformation($"Finished running exe {actionExeName} from {exePath}.");       
    }

    private async Task<string> PrepareActionFolder(string actionName, string actionVersion)
    {
        // Prevent path traversal
        if (string.IsNullOrWhiteSpace(actionName) || actionName.Contains("..") || Path.IsPathRooted(actionName))
        {
            _logger.LogError("PrepareActionFolder - Invalid action name.");
            return string.Empty;
        }

        if (string.IsNullOrWhiteSpace(actionVersion) || actionVersion.Contains("..") || Path.IsPathRooted(actionVersion))
        {
            _logger.LogError("PrepareActionFolder - Invalid action version.");
            return string.Empty;
        }

        // relative to the backend's current directory
        string basePath = AppContext.BaseDirectory;
        string targetPath = Path.Combine(basePath, ACTIONS_RELATIVE_PATH, actionName + "_" + actionVersion);

        try
        {
            if (!Directory.Exists(targetPath))
            {
                Directory.CreateDirectory(targetPath);

                //1. get a url for the action zip from server 
                var urlToDowloadTestApp = await _client.GetAsync($"api/test-applications/download-link/{actionName}/{actionVersion}");
                urlToDowloadTestApp.EnsureSuccessStatusCode();

                var urlToDowloadTestAppJson = await urlToDowloadTestApp.Content.ReadAsStringAsync();
                _logger.LogInformation($"Url to download action {actionName}, ver#{actionVersion} got from server : {urlToDowloadTestAppJson}");

                string urlStr = JsonDocument.Parse(urlToDowloadTestAppJson).RootElement.GetProperty("url").GetString();
                string fileNameStr = JsonDocument.Parse(urlToDowloadTestAppJson).RootElement.GetProperty("fileName").GetString();

                //2. download the action zip from received url
                string zipFilePathAndName = Path.Combine(targetPath, fileNameStr);
                await UploadDownloadService.DownloadFileAsync(urlStr, zipFilePathAndName);

                //3. unzip
                ZipFile.ExtractToDirectory(zipFilePathAndName, targetPath, overwriteFiles: true);

                _logger.LogInformation($"The folder {targetPath} did not exist, prepared.");
            }
            else
            {
                _logger.LogInformation($"The folder {targetPath} exists. Doing nothing.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Exception in PrepareActionFolder, Ex. {ex.Message}.");
            return string.Empty;
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


