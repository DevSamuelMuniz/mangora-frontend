# Register a selectable Windows paper form. This does not print or change defaults.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$PrinterName = 'HPRT MPT-II',
    [ValidateRange(25.4, 210)][double]$WidthMm = 58,
    [ValidateRange(25.4, 1000)][double]$HeightMm = 40
)
$ErrorActionPreference = 'Stop'
$formName = 'Mangora {0}x{1}mm' -f $WidthMm.ToString('0.##', [cultureinfo]::InvariantCulture), $HeightMm.ToString('0.##', [cultureinfo]::InvariantCulture)
if (-not $PSCmdlet.ShouldProcess($PrinterName, "Register selectable paper $formName")) { return }

Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public static class MangoraPaperForms {
    [StructLayout(LayoutKind.Sequential)] public struct Size { public int Width, Height; }
    [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public struct Form { public uint Flags; public string Name; public Size Size; public Rect ImageableArea; }
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public struct Defaults { public string DataType; public IntPtr DevMode; public uint DesiredAccess; }
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool OpenPrinter(string name, out IntPtr printer, ref Defaults defaults);
    [DllImport("winspool.drv", EntryPoint="AddFormW", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool AddForm(IntPtr printer, uint level, ref Form form);
    [DllImport("winspool.drv", SetLastError=true)] static extern bool ClosePrinter(IntPtr printer);
    public static void Register(string printerName, string formName, int width, int height) {
        var defaults = new Defaults { DesiredAccess = 0xC };
        IntPtr printer;
        if (!OpenPrinter(printerName, out printer, ref defaults)) throw new Win32Exception(Marshal.GetLastWin32Error());
        try {
            var form = new Form { Name=formName, Size=new Size { Width=width, Height=height },
                ImageableArea=new Rect { Left=0, Top=0, Right=width, Bottom=height } };
            if (!AddForm(printer, 1, ref form)) {
                int error = Marshal.GetLastWin32Error();
                // An existing form is not replaced or resized.
                if (error == 183) throw new InvalidOperationException("Paper form already exists; verify its dimensions in printer properties.");
                throw new Win32Exception(error);
            }
        } finally { ClosePrinter(printer); }
    }
}
'@
[MangoraPaperForms]::Register($PrinterName, $formName, [int][math]::Round($WidthMm * 1000), [int][math]::Round($HeightMm * 1000))
Write-Output "Registered $formName. Reopen the browser print dialog and select this paper."
