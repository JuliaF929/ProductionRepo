#ifndef MyAppVersion
  #error MyAppVersion "NOT_DEFINED"
#endif
#define MyAppName "Calibrix Desktop Operator Windows"
#define MyAppVersion MyAppVersion
#define MyAppExeName "CalibrixOperatorWin.exe"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName=C:\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputBaseFilename=CalibrixOperatorWin_{#MyAppVersion}
Compression=lzma
SolidCompression=yes

[Files]
Source: "Publish\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
