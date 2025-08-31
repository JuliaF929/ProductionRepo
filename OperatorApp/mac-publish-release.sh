#!/bin/bash

# Running after build by
# OperatorApp> ./Publish/MacHostApp

echo "[1/5] Building Angular (production)..."

cd frontend
npm install --no-audit --silent || exit 1
ng build --configuration production || exit 1

cd ..

echo "[2/5] Copying Angular build to Backend\wwwroot..."
rm -rf Backend/wwwroot || exit 1
mkdir -p Backend/wwwroot || exit 1
cp -R frontend/dist/frontend/browser/* Backend/wwwroot/ || exit 1

echo "[3/5] Publishing Backend (Release)..."
dotnet publish Backend/Backend.csproj -c Release -r osx-arm64 --self-contained -o TempPublish/Backend || exit 1

echo "[4/5] Publishing MacHostApp (Release)..."
dotnet publish MacHostApp/MacHostApp.csproj -c Release -r osx-arm64 --self-contained -o Publish || exit 1

echo "[5/5] Moving Backend into Publish\Backend..."
mkdir -p Publish/Backend || exit 1
cp -R TempPublish/Backend/* Publish/Backend/ || exit 1

echo "Cleaning up temporary Backend publish folder..."
rm -rf TempPublish || exit 1

echo "Publish complete! Ready to distribute:"
echo "Publish\MacHostApp"
pause
