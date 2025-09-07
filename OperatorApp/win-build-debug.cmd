@echo off
echo [1/4] Building Angular (Frontend)...

REM Go to Frontend folder and build Angular
cd Frontend
call npm install
if errorlevel 1 (
    echo npm install failed!
    pause
    exit /b %errorlevel%
)
call ng build
if errorlevel 1 (
    echo Angular build failed!
    pause
    exit /b %errorlevel%
)

REM Return to root folder
cd ..

echo [2/4] Copying Angular build to Backend\bin\Debug\net8.0\wwwroot...
rmdir /s /q Backend\bin\Debug\net8.0\wwwroot
mkdir Backend\bin\Debug\net8.0\wwwroot
xcopy /E /I /Y Frontend\dist\frontend\browser\* Backend\bin\Debug\net8.0\wwwroot\
if errorlevel 1 (
    echo Failed to copy Angular build to Backend\bin\Debug\net8.0\wwwroot!
    pause
    exit /b %errorlevel%
)


echo [3/4] Building Backend (.NET)...
dotnet build Backend/Backend.csproj -c Debug
if errorlevel 1 (
    echo Backend build failed!
    pause
    exit /b %errorlevel%
)

echo [4/4] Building DesktopHost (.NET)...
dotnet build DesktopHost/DesktopHost.csproj -c Debug
if errorlevel 1 (
    echo DesktopHost build failed!
    pause
    exit /b %errorlevel%
)

echo All projects built successfully (Debug configuration)!
pause

