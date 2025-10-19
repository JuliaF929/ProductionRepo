using System;
using System.Diagnostics;
using System.IO;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Avalonia.Controls;
using MsBox.Avalonia;
using ReactiveUI;
using AvaloniaWebView;
using Microsoft.Extensions.Configuration;


namespace MacHostApp.Views;

public partial class MainWindow : Window
{
    private Process backendProcess = new Process();

    public MainWindow()
    {
        InitializeComponent();

        this.Closing += OnWindowClosing;

        OperatorAppWindow.Title = "Operator Application ver#1.1.1.1 for Mac";
        OperatorAppWindow.WindowState = WindowState.Maximized;

        Console.WriteLine("MacHostApp started...");

        var config = new ConfigurationBuilder()
                                                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                                                .AddJsonFile("appsettings.json")
                                                .Build();
        var backendUrl = config["AppConfig:BackendUrl"];

        Console.WriteLine("Backend URL is: " + backendUrl);

        StartBackend();

        //Give backend a second to start up
        Thread.Sleep(2000);

        //Load Angular UI from Backend
        var vw = this.FindControl<WebView>("webView");
        vw.Url = new Uri(backendUrl);
    }

    void StartBackend()
	{
        //get the 1st cmd line parameter with the server IP definition (localhost vs ElasticIP of the AWS)
        string _serverIP = "localhost";

        //get the 2nd cmd line parameter with the server port definition (5000 for local host, 80 for AWS)
        string _serverPort = "5000";


        // args[0] = exe path, args[1] = first user arg, args[2] = second user arg
        var args = Environment.GetCommandLineArgs();
        if (args.Length == 3 && !string.IsNullOrWhiteSpace(args[1]) && !string.IsNullOrWhiteSpace(args[2]))
        {
            _serverIP = args[1];
            _serverPort = args[2];
        }
        else
        {
            Console.WriteLine("ServerIP and ServerPort shall be a cmd line arguments. One or both are missing. Press any key to exit ...");
            Console.ReadLine();
            Environment.Exit(0);
        }

#if DEBUG
		string backendPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Backend", "bin", "Debug", "net8.0", "Backend");
#else
        string backendPath = Path.Combine(AppContext.BaseDirectory, "Backend", "Backend");
#endif        
		
		Console.WriteLine("This is a backendPath: " + backendPath);
		Console.WriteLine("This is a working directory: " + Path.GetDirectoryName(backendPath));
		Console.WriteLine("File exists? " + File.Exists(backendPath));
		Console.WriteLine("These are arguments: " + $"\"{backendPath}\"" + _serverIP);

		backendProcess = new Process
		{
			StartInfo = new ProcessStartInfo
			{
				FileName = backendPath,
				Arguments = _serverIP + " " + _serverPort,
				WorkingDirectory = Path.GetDirectoryName(backendPath),
			    CreateNoWindow = true,
			    UseShellExecute = false,
			    RedirectStandardOutput = true,
		        RedirectStandardError = true,
			}
		};

        backendProcess.OutputDataReceived += (s, e) => Console.WriteLine(e.Data);
        backendProcess.ErrorDataReceived += (s, e) => Console.WriteLine(e.Data);

        try
        {
            backendProcess.Start();
            Console.WriteLine("Backend started");
		}
        catch (System.ComponentModel.Win32Exception ex)
        {
            Console.WriteLine($"Error Code: {ex.ErrorCode}");
            Console.WriteLine($"Message: {ex.Message}");
        }

		backendProcess.BeginOutputReadLine();
		backendProcess.BeginErrorReadLine();
	}
    
    private void OnWindowClosing(object? sender, WindowClosingEventArgs e)
    {
        base.OnClosed(e);

        try
        {
            if (backendProcess != null && !backendProcess.HasExited)
            {
                backendProcess.Kill(true);
                backendProcess.Dispose();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error closing Backend: {ex.Message}");
        }

    }
}