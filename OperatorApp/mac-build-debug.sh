#!/bin/bash

# Running after build by
#OperatorApp>./MacHostApp/bin/Debug/net8.0/MacHostApp

# Prevent Angular CLI from prompting
export NG_CLI_ANALYTICS=ci

echo "Building OperatorApp for Mac, Debug configuration"

echo "[1/4] Building Angular (Frontend)..."

cd frontend
npm install --no-audit --silent|| exit 1
ng build || exit 1

echo "Return to root folder (OperatorApp)"
cd ..

echo "[2/4] Copying Angular build to Backend\bin\Debug\net8.0\wwwroot..."
rm -rf Backend/bin/Debug/net8.0/wwwroot || exit 1
mkdir -p Backend/bin/Debug/net8.0/wwwroot || exit 1
cp -R frontend/dist/frontend/browser/* Backend/bin/Debug/net8.0/wwwroot/ || exit 1

echo "[3/4] Building Backend (.NET)..."
dotnet build Backend/Backend.csproj -c Debug || exit 1

echo "[4/4] Building MacHostApp (.NET Core)..."
cd MacHostApp || exit 1
dotnet build || exit 1

echo "All projects built successfully (Debug configuration)!"

