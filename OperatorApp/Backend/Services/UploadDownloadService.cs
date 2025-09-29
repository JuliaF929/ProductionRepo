using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace Backend.Services;

public class UploadDownloadService
{
    private static readonly HttpClient _http = new HttpClient();

    public static async Task DownloadFileAsync(string url, string filePathAndName)
    {
        using var response = await _http.GetAsync(url);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        await using var fileStream = File.Create(filePathAndName);
        await stream.CopyToAsync(fileStream);

        //_logger.LogInformation($"File downloaded to {localPath}");
    }
}
