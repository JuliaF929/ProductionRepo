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
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Parameters: "{code:GetServerIP} {code:GetServerPort}"; WorkingDir: "{app}"

[Code]

var
  ServerPage: TWizardPage;
  ServerIPEdit: TEdit;
  ServerPortEdit: TEdit;

  procedure InitializeWizard;
begin
  ServerPage :=
    CreateCustomPage(
      wpSelectDir,
      'Server Configuration',
      'Configure Calibrix server connection'
    );

  { Server IP }
  ServerIPEdit := TEdit.Create(ServerPage);
  ServerIPEdit.Parent := ServerPage.Surface;
  ServerIPEdit.Left := 0;
  ServerIPEdit.Top := 0;
  ServerIPEdit.Width := ServerPage.SurfaceWidth;
  ServerIPEdit.Text := '127.0.0.1';

  { Label }
  with TLabel.Create(ServerPage) do
  begin
    Parent := ServerPage.Surface;
    Caption := 'Server IP address:';
    Left := 0;
    Top := ServerIPEdit.Top - ScaleY(15);
  end;

  { Server Port }
  ServerPortEdit := TEdit.Create(ServerPage);
  ServerPortEdit.Parent := ServerPage.Surface;
  ServerPortEdit.Left := 0;
  ServerPortEdit.Top := ServerIPEdit.Top + ScaleY(45);
  ServerPortEdit.Width := ServerPage.SurfaceWidth;
  ServerPortEdit.Text := '5000';

  { Label }
  with TLabel.Create(ServerPage) do
  begin
    Parent := ServerPage.Surface;
    Caption := 'Server port:';
    Left := 0;
    Top := ServerPortEdit.Top - ScaleY(15);
  end;
end;

function GetServerIP(Param: string): string;
begin
  Result := ServerIPEdit.Text;
end;

function GetServerPort(Param: string): string;
begin
  Result := ServerPortEdit.Text;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;

  if CurPageID = ServerPage.ID then
  begin
    if Trim(ServerIPEdit.Text) = '' then
    begin
      MsgBox('Server IP cannot be empty.', mbError, MB_OK);
      Result := False;
    end
    else if StrToIntDef(ServerPortEdit.Text, -1) <= 0 then
    begin
      MsgBox('Server port must be a valid number.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;
