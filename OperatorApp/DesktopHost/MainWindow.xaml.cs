using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace DesktopHost;



/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    [System.Runtime.InteropServices.DllImport("kernel32.dll")]
    static extern bool AllocConsole();

    private Process backendProcess = new Process();

    public MainWindow()
    {
        InitializeComponent();

        //TODO: After connecting DB get from BE the company name here
        OperatorAppWindow.Title = "Julia - Manufacturing Operator Application";
        OperatorAppWindow.WindowState = WindowState.Maximized;

        AllocConsole();
        Console.WriteLine("DesktopHost started...");

        var config = new ConfigurationBuilder()
                                                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                                                .AddJsonFile("appsettings.json")
                                                .Build();
        var backendUrl = config["AppConfig:BackendUrl"];

        // Start Backend silently
        //string backendDir;
  

        // #if DEBUG
        // backendDir = System.IO.Path.Combine("C:\\JuliaF\\Julia\\ProductionClean22\\OperatorApp\\", "Backend", "bin", "Debug", "net8.0");
        // #else
        // backendDir = System.IO.Path.Combine("C:\\JuliaF\\Julia\\ProductionClean22\\OperatorApp\\", "Backend", "bin", "Release", "net8.0", "win-x64", "publish");
        // #endif

        // backendProcess.StartInfo.FileName = System.IO.Path.Combine(backendDir, "Backend.exe");
        // backendProcess.StartInfo.WorkingDirectory = backendDir;


        string baseDir = AppContext.BaseDirectory;

        // Figure out Debug vs Release
        #if DEBUG
        string backendDir = System.IO.Path.Combine(baseDir, "..", "..", "..", "..", "Backend", "bin", "Debug", "net8.0");
        #else
        string backendDir = System.IO.Path.Combine(baseDir, "Backend");
        #endif

        backendDir = System.IO.Path.GetFullPath(backendDir);

        backendProcess.StartInfo.FileName = System.IO.Path.Combine(backendDir, "Backend.exe");
        backendProcess.StartInfo.WorkingDirectory = backendDir;


        backendProcess.StartInfo.CreateNoWindow = true;
        backendProcess.StartInfo.UseShellExecute = false;

        backendProcess.StartInfo.RedirectStandardOutput = true;
        backendProcess.StartInfo.RedirectStandardError = true;

        backendProcess.OutputDataReceived += (s, e) => Console.WriteLine(e.Data);
        backendProcess.ErrorDataReceived += (s, e) => Console.WriteLine(e.Data);

        backendProcess.Start();
        backendProcess.BeginOutputReadLine();
        backendProcess.BeginErrorReadLine();

        // Give backend a second to start up
        Thread.Sleep(2000);

        // Load Angular UI from Backend
        webView.Source = new Uri(backendUrl);
    }

    protected override void OnClosed(EventArgs e)
    {
        base.OnClosed(e);

        try
        {
            if (backendProcess != null && !backendProcess.HasExited)
            {
                backendProcess.Kill(true); // Kill Backend and any child processes
                backendProcess.Dispose();
            }
        }
        catch (Exception ex)
        {
            // Log or ignore
            MessageBox.Show($"Error closing Backend: {ex.Message}");
        }
    }

}