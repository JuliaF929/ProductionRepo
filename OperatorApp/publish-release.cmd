@echo off
echo [1/5] Building Angular (production)...

cd Frontend
call npm install
if errorlevel 1 (
    echo npm install failed!
    pause
    exit /b %errorlevel%
)
call ng build --configuration production
if errorlevel 1 (
    echo Angular build failed!
    pause
    exit /b %errorlevel%
)

cd ..

echo [2/5] Copying Angular build to Backend\wwwroot...
rmdir /s /q Backend\wwwroot
mkdir Backend\wwwroot
xcopy /E /I /Y Frontend\dist\frontend\browser\* Backend\wwwroot\
if errorlevel 1 (
    echo Failed to copy Angular build to Backend\wwwroot!
    pause
    exit /b %errorlevel%
)

echo [3/5] Publishing Backend (Release)...
dotnet publish Backend/Backend.csproj -c Release -r win-x64 --self-contained -o TempPublish\Backend
if errorlevel 1 (
    echo Backend publish failed!
    pause
    exit /b %errorlevel%
)

echo [4/5] Publishing DesktopHost (Release)...
dotnet publish DesktopHost/DesktopHost.csproj -c Release -r win-x64 --self-contained -o Publish
if errorlevel 1 (
    echo DesktopHost publish failed!
    pause
    exit /b %errorlevel%
)

echo [5/5] Moving Backend into Publish\Backend...
xcopy /E /I /Y TempPublish\Backend Publish\Backend\
if errorlevel 1 (
    echo Failed to copy Backend into Publish!
    pause
    exit /b %errorlevel%
)

echo Cleaning up temporary Backend publish folder...
rmdir /s /q TempPublish

echo Publish complete! Ready to distribute:
echo Publish\DesktopHost.exe
pause
