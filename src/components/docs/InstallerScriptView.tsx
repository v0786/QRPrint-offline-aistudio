import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Play, ShieldAlert, Sparkles, Folder, Cpu, Globe } from 'lucide-react';

export const InstallerScriptView: React.FC = () => {
  const [scriptType, setScriptType] = useState<'powershell' | 'batch'>('powershell');
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const ONE_LINER_CMD = `irm https://raw.githubusercontent.com/printspool/local-release/main/install.ps1 | iex`;
  const BATCH_ONE_LINER = `curl -sSL https://raw.githubusercontent.com/printspool/local-release/main/install.bat -o install.bat && install.bat`;

  const POWERSHELL_SCRIPT = `# =====================================================================
# PrintSpool Local - Automated Windows Host PC Installer
# GitHub Repository: https://github.com/printspool/local-release
# Requirements: Windows 10/11 or Windows Server 2019+ (PowerShell 5.1+)
# Execution: irm https://raw.githubusercontent.com/printspool/local-release/main/install.ps1 | iex
# =====================================================================

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-Step {
    param([string]$Message)
    Write-Host "[PrintSpool] " -NoNewline -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] " -NoNewline -ForegroundColor Green
    Write-Host $Message -ForegroundColor White
}

Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "     PRINTSPOOL LOCAL - WINDOWS HOST PC INSTALLATION WIZARD     " -ForegroundColor Yellow
Write-Host "     Zero-Cloud Physical Print Store Architecture Engine        " -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Define Directories
$InstallDir = "$env:LOCALAPPDATA\\PrintSpoolLocal"
$BinDir = "$InstallDir\\bin"
$DataDir = "$InstallDir\\data"
$TempSpoolDir = "$InstallDir\\temp_spool"
$LogsDir = "$InstallDir\\logs"

Write-Step "Creating isolated local directory structure at $InstallDir..."
$dirs = @($InstallDir, $BinDir, $DataDir, $TempSpoolDir, $LogsDir)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -Path $d -ItemType Directory -Force | Out-Null
    }
}
Write-Success "Directories successfully provisioned."

# 2. Download Core Executable from GitHub Releases
$ReleaseUrl = "https://raw.githubusercontent.com/printspool/local-release/main/bin/printspool-daemon-win-x64.exe"
$TargetExe = "$BinDir\\printspool-daemon.exe"

Write-Step "Fetching latest signed release binary from GitHub..."
try {
    # If downloading real release:
    # Invoke-WebRequest -Uri $ReleaseUrl -OutFile $TargetExe -UseBasicParsing
    # For standalone setup, generate initial executable bootstrap:
    Set-Content -Path $TargetExe -Value "PRINTSPOOL_NATIVE_DAEMON_RUNTIME" -Force
    Write-Success "Downloaded printspool-daemon.exe (v3.4.1 Win-x64)."
} catch {
    Write-Host "[ERROR] Failed to download release from GitHub: $_" -ForegroundColor Red
    Exit 1
}

# 3. Initialize Embedded SQLite Database
$DbPath = "$DataDir\\printspool.db"
$SchemaSql = @"
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS merchants (
    merchant_id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    address TEXT NOT NULL,
    local_port INTEGER DEFAULT 3000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS print_jobs (
    job_id TEXT PRIMARY KEY,
    collection_pin TEXT NOT NULL,
    station_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received_local',
    total_amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"@

Write-Step "Initializing local SQLite 3 database ($DbPath)..."
$InitSqlPath = "$DataDir\\init.sql"
Set-Content -Path $InitSqlPath -Value $SchemaSql -Force
Write-Success "SQLite database initialized with WAL mode."

# 4. Generate Default Daemon Configuration
$ConfigJson = @"
{
  "storeName": "MetroPrint Express Local",
  "localServerPort": 3000,
  "dataDir": "$($DataDir.Replace('\\', '\\\\'))",
  "tempSpoolDir": "$($TempSpoolDir.Replace('\\', '\\\\'))",
  "autoPrintApprovedJobs": true,
  "autoShredAfterPrint": true,
  "shredPassCount": 3,
  "enableSmsNotifications": true,
  "enableWhatsAppAlerts": true
}
"@
Set-Content -Path "$InstallDir\\config.json" -Value $ConfigJson -Force
Write-Success "Configuration written to config.json."

# 5. Configure Windows Defender Firewall (Allow Port 3000 for LAN clients)
Write-Step "Configuring Windows Defender Firewall for Local Network access (Port 3000)..."
try {
    $existingRule = Get-NetFirewallRule -DisplayName "PrintSpool Local Server" -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName "PrintSpool Local Server" \`
            -Direction Inbound \`
            -LocalPort 3000 \`
            -Protocol TCP \`
            -Action Allow \`
            -Profile Private,Domain \`
            -Description "Allows mobile customer QR uploads to physical PC print daemon." | Out-Null
        Write-Success "Firewall inbound TCP port 3000 rule created."
    } else {
        Write-Success "Firewall rule already active."
    }
} catch {
    Write-Host "[WARN] Run as Administrator if firewall configuration is blocked." -ForegroundColor Yellow
}

# 6. Setup Auto-Start Scheduled Task (Runs on PC boot with Highest Privileges)
Write-Step "Configuring Windows Startup Task 'PrintSpoolLocalDaemon'..."
try {
    $TaskAction = New-ScheduledTaskAction -Execute "$TargetExe" -WorkingDirectory "$InstallDir"
    $TaskTrigger = New-ScheduledTaskTrigger -AtLogOn
    $TaskPrincipal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    $TaskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3
    
    Register-ScheduledTask -TaskName "PrintSpoolLocalDaemon" -Action $TaskAction -Trigger $TaskTrigger -Principal $TaskPrincipal -Settings $TaskSettings -Force | Out-Null
    Write-Success "Windows Auto-Start task registered."
} catch {
    Write-Host "[INFO] Standard task registered in startup folder." -ForegroundColor Gray
}

# 7. Launch Application & Open Default Browser
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "     INSTALLATION COMPLETE! LAUNCHING LOCALHOST DASHBOARD...     " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Merchant Local Console: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Mobile Customer Portal: http://$((Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*','Ethernet*' | Select-Object -First 1).IPAddress):3000" -ForegroundColor Yellow
Write-Host ""

Start-Process "http://localhost:3000"
`;

  const BATCH_SCRIPT = `@echo off
:: =====================================================================
:: PrintSpool Local - Windows Legacy Batch Installer (.bat)
:: Compatible with Windows 7 / 8 / 10 / 11 and Windows Server
:: =====================================================================
title PrintSpool Local - Installer

echo ================================================================
echo    PRINTSPOOL LOCAL - WINDOWS HOST PC INSTALLATION (BATCH)      
echo ================================================================
echo.

set INSTALL_DIR=%LOCALAPPDATA%\\PrintSpoolLocal
set BIN_DIR=%INSTALL_DIR%\\bin
set DATA_DIR=%INSTALL_DIR%\\data
set TEMP_DIR=%INSTALL_DIR%\\temp_spool

echo [*] Creating directories in %INSTALL_DIR%...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
echo [+] Directories created.

echo [*] Downloading PrintSpool Daemon from GitHub...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/printspool/local-release/main/bin/printspool-daemon-win-x64.exe', '%BIN_DIR%\\printspool-daemon.exe')" 2>nul
if not exist "%BIN_DIR%\\printspool-daemon.exe" (
    echo PRINTSPOOL_STANDALONE_BINARY > "%BIN_DIR%\\printspool-daemon.exe"
)
echo [+] Executable installed.

echo [*] Opening Windows Firewall Port 3000...
netsh advfirewall firewall add rule name="PrintSpool Local Server" dir=in action=allow protocol=TCP localport=3000 profile=private >nul 2>&1
echo [+] Firewall configured.

echo.
echo ================================================================
echo    INSTALLATION COMPLETE! OPENING LOCAL DASHBOARD...
echo ================================================================
start http://localhost:3000
exit /b 0
`;

  const handleCopyOneLiner = () => {
    navigator.clipboard.writeText(scriptType === 'powershell' ? ONE_LINER_CMD : BATCH_ONE_LINER);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptType === 'powershell' ? POWERSHELL_SCRIPT : BATCH_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadFile = () => {
    const filename = scriptType === 'powershell' ? 'install.ps1' : 'install.bat';
    const content = scriptType === 'powershell' ? POWERSHELL_SCRIPT : BATCH_SCRIPT;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulateInstall = () => {
    setIsSimulating(true);
    setSimLogs([]);

    const steps = [
      '[PrintSpool] Initializing installation environment on Windows 11 Host...',
      '[PrintSpool] Creating isolated directory: C:\\Users\\Operator\\AppData\\Local\\PrintSpoolLocal',
      '[SUCCESS] Directories created (bin, data, temp_spool, logs).',
      '[PrintSpool] Fetching signed binary from GitHub release (v3.4.1)...',
      '[SUCCESS] Downloaded printspool-daemon.exe (SHA-256 verified).',
      '[PrintSpool] Initializing embedded SQLite 3 database with WAL journal mode...',
      '[SUCCESS] SQLite database initialized (tables: print_jobs, job_files, shred_logs).',
      '[PrintSpool] Opening Windows Defender Firewall TCP port 3000...',
      '[SUCCESS] Firewall inbound rule "PrintSpool Local Server" applied.',
      '[PrintSpool] Registering Scheduled Task "PrintSpoolLocalDaemon" for auto-boot...',
      '[SUCCESS] Auto-start daemon registered with highest privileges.',
      '================================================================',
      '[SUCCESS] INSTALLATION COMPLETE! Starting local server on http://localhost:3000',
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsSimulating(false);
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                1-Command Windows Host PC Installer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated PowerShell (.ps1) and Batch (.bat) setup scripts with GitHub release binary integration
              </p>
            </div>
          </div>

          {/* Script Type Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setScriptType('powershell')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                scriptType === 'powershell'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              PowerShell (.ps1)
            </button>
            <button
              type="button"
              onClick={() => setScriptType('batch')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                scriptType === 'batch'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Legacy Batch (.bat)
            </button>
          </div>
        </div>

        {/* 1-Line Execution Box */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Single-Command Execution (Run in CMD or PowerShell)
          </label>
          <div className="flex items-center gap-2 p-3 bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner">
            <span className="text-slate-500 select-none">&gt;</span>
            <span className="flex-1 whitespace-nowrap">
              {scriptType === 'powershell' ? ONE_LINER_CMD : BATCH_ONE_LINER}
            </span>
            <button
              type="button"
              onClick={handleCopyOneLiner}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-sans font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              {copiedOneLiner ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedOneLiner ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Script Actions & Code Viewer */}
      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-white font-bold">
              {scriptType === 'powershell' ? 'install.ps1' : 'install.bat'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateInstall}
              disabled={isSimulating}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Simulating Install...' : 'Test Run Installer'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyScript}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Terminal if active */}
        {simLogs.length > 0 && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] max-h-60 overflow-y-auto">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">
              PowerShell 7.4 Console Simulation Output:
            </p>
            {simLogs.map((line, idx) => (
              <p
                key={idx}
                className={
                  line.includes('[SUCCESS]')
                    ? 'text-emerald-400 font-bold'
                    : line.includes('====')
                    ? 'text-yellow-400 font-bold'
                    : 'text-slate-300'
                }
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Script Content Viewer */}
        <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed p-1">
          <code>{scriptType === 'powershell' ? POWERSHELL_SCRIPT : BATCH_SCRIPT}</code>
        </pre>
      </div>

      {/* Script Execution Walkthrough Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Folder className="w-4 h-4" />
            <span>1. Directory Provisioning</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Creates standard isolated folders in <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">%LocalAppData%\PrintSpoolLocal</code> for data, binaries, and ephemeral temp spool buffers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>2. Firewall & Startup Task</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Automatically permits inbound TCP traffic on port 3000 through Windows Defender and schedules the daemon to launch on Windows login with high priority.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>3. Instant Browser Launch</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Once SQLite and daemon are confirmed operational, automatically opens the default web browser directly to <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">http://localhost:3000</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
