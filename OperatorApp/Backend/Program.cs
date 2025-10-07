using Microsoft.Extensions.Logging;
using Serilog;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration) // Reads from appsettings.json
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/OperatorApp_log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); // Replace default logger

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;//do not convert to camelCase (all small letters)
    });
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.Configure<AppConfig>(
    builder.Configuration.GetSection("AppConfig"));

var appConfig = builder.Configuration.GetSection("AppConfig").Get<AppConfig>();

builder.WebHost.UseUrls(appConfig.BackendUrl);

//TODO: add here logging of the OpeartorApp running (inside the Backend log)
//get the cmd line arguments passed from the DesktopHost/MacHostApp and containing serverIP and serverPort
string serverIP = "localhost";
string serverPort = "5000";//only for development and testing from developer's machine
Log.Information($"Command line arguments passed to the Backend of OperatorApp: {string.Join(", ", args)}");
if (args.Length > 1 && !string.IsNullOrWhiteSpace(args[0]) && !string.IsNullOrWhiteSpace(args[1]))
{
    serverIP = args[0];
    serverPort = args[1];
}
else
{
    Log.Error($"No command line arguments passed to the Backend of OperatorApp. Exiting...");
    return;
}
string version = "1.1.1.1";
Log.Information($"----------- Started Backend of OperatorApp --- ver. {version} ---------------");
Log.Information($"1. Server IP is {serverIP}, Server Port is {serverPort}");

string serverUrl = "http://" + serverIP + ":" + serverPort + "/";
Log.Information($"2. Rest requests will be sent to {serverUrl}");

// Bind options and HttpClient
builder.Services.Configure<GlobalOptions>(o => o.ServerURL = serverUrl);
builder.Services.AddHttpClient("ServerApi", (sp, http) =>
{
     var opt = sp.GetRequiredService<IOptions<GlobalOptions>>().Value;
     http.BaseAddress = new Uri(opt.ServerURL);
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowAll");

app.MapControllers();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapFallbackToFile("index.html");
});

app.Run();