#!/bin/bash

# Running after build by while the server is running locally (not AWS) by
# OperatorApp> ./Publish_x64/MacHostApp localhost 5000 
# OperatorApp> ./Publish_arm64/MacHostApp localhost 5000

# Running after build while the server is running at AWS by
# OperatorApp> ./Publish_x64/MacHostApp <ElasticIP> 80
# OperatorApp> ./Publish_arm64/MacHostApp <ElasticIP> 80

# Prevent Angular CLI from prompting
export NG_CLI_ANALYTICS=ci

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
dotnet publish MacHostApp/MacHostApp.csproj -c Release -r osx-arm64 --self-contained -o Publish_arm64 || exit 1
dotnet publish MacHostApp/MacHostApp.csproj -c Release -r osx-x64 --self-contained -o Publish_x64 || exit 1


echo "[5/5] Copying Backend into Publish_arm64\Backend and into Publish_x64\Backend ..."
mkdir -p Publish_arm64/Backend || exit 1
cp -R TempPublish/Backend/* Publish_arm64/Backend/ || exit 1
mkdir -p Publish_x64/Backend || exit 1
cp -R TempPublish/Backend/* Publish_x64/Backend/ || exit 1

echo "Cleaning up temporary Backend publish folder..."
rm -rf TempPublish || exit 1

echo "Publish complete! Ready to distribute:"
echo "Publish_arm64/MacHostApp and Publish_x64/MacHostApp"
