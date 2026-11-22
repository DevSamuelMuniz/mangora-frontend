# Run with Windows PowerShell 5.1. Changes only the current user's printer defaults.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$PrinterName = 'HPRT MPT-II',
    [ValidateRange(25.4, 210)][double]$WidthMm = 58,
    [ValidateRange(25.4, 1000)][double]$HeightMm = 40,
    [string]$RestoreFrom
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Printing
$printServer = New-Object System.Printing.LocalPrintServer
$printQueue = $printServer.GetPrintQueue($PrinterName)

function Read-PaperMm($Ticket) {
    [pscustomobject]@{
        Width = [math]::Round($Ticket.PageMediaSize.Width * 25.4 / 96, 2)
        Height = [math]::Round($Ticket.PageMediaSize.Height * 25.4 / 96, 2)
    }
}

try {
    $originalTicket = $printQueue.UserPrintTicket
    $before = Read-PaperMm $originalTicket
    if ($RestoreFrom) {
        $restorePath = (Resolve-Path -LiteralPath $RestoreFrom).Path
        $restoreStream = [System.IO.File]::OpenRead($restorePath)
        try { $requestedTicket = New-Object System.Printing.PrintTicket($restoreStream) }
        finally { $restoreStream.Dispose() }
    } else {
        $requestedTicket = $originalTicket.Clone()
        $requestedTicket.PageMediaSize = New-Object System.Printing.PageMediaSize(($WidthMm * 96 / 25.4), ($HeightMm * 96 / 25.4))
        $requestedTicket.PageOrientation = [System.Printing.PageOrientation]::Portrait
        $requestedTicket.CopyCount = 1
    }

    $validation = $printQueue.MergeAndValidatePrintTicket($originalTicket, $requestedTicket)
    $expected = Read-PaperMm $requestedTicket
    $validated = Read-PaperMm $validation.ValidatedPrintTicket
    if ([math]::Abs($validated.Width - $expected.Width) -gt 0.5 -or [math]::Abs($validated.Height - $expected.Height) -gt 0.5) {
        throw "Driver rejected custom paper: requested $($expected.Width) x $($expected.Height) mm; accepted $($validated.Width) x $($validated.Height) mm. No changes applied."
    }

    if ($PSCmdlet.ShouldProcess($PrinterName, "Set current-user paper to $($validated.Width) x $($validated.Height) mm")) {
        $backupFolder = Join-Path $env:LOCALAPPDATA 'Mangora\Printing\Backups'
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
        $backupPath = Join-Path $backupFolder ("printer-{0}-{1}.xml" -f (Get-Date -Format 'yyyyMMdd-HHmmss'), [guid]::NewGuid().ToString('N'))
        $backupStream = [System.IO.File]::Create($backupPath)
        try { $originalTicket.SaveTo($backupStream) }
        finally { $backupStream.Dispose() }

        $printQueue.UserPrintTicket = $validation.ValidatedPrintTicket
        $printQueue.Commit()
        $printQueue.Refresh()
        $after = Read-PaperMm $printQueue.UserPrintTicket
        if ([math]::Abs($after.Width - $validated.Width) -gt 0.5 -or [math]::Abs($after.Height - $validated.Height) -gt 0.5) {
            $printQueue.UserPrintTicket = $originalTicket
            $printQueue.Commit()
            throw 'Printer did not persist the requested paper. Original defaults restored.'
        }
        [pscustomobject]@{
            Printer = $PrinterName
            PreviousWidthMm = $before.Width
            PreviousHeightMm = $before.Height
            WidthMm = $after.Width
            HeightMm = $after.Height
            Backup = $backupPath
        }
    }
} finally {
    $printQueue.Dispose()
    $printServer.Dispose()
}
