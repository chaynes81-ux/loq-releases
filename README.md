# loq - Log Query Tool

Cross-platform replacement for Microsoft Log Parser 2.2, built in Rust.

## Downloads

### Latest Release

Download the latest version for your platform:

| Platform | Download |
|----------|----------|
| Windows (x64) | [loq-windows-x64.zip](https://github.com/chaynes81-ux/loq-releases/releases/latest/download/loq-windows-x64.zip) |
| macOS (Intel) | [loq-macos-x64.tar.gz](https://github.com/chaynes81-ux/loq-releases/releases/latest/download/loq-macos-x64.tar.gz) |
| macOS (Apple Silicon) | [loq-macos-arm64.tar.gz](https://github.com/chaynes81-ux/loq-releases/releases/latest/download/loq-macos-arm64.tar.gz) |
| Linux (x64) | [loq-linux-x64.tar.gz](https://github.com/chaynes81-ux/loq-releases/releases/latest/download/loq-linux-x64.tar.gz) |

### Windows COM DLL

For VBScript/PowerShell compatibility with existing Log Parser scripts:

| Platform | Download |
|----------|----------|
| Windows (x64) | [logparser_dll-x64.zip](https://github.com/chaynes81-ux/loq-releases/releases/latest/download/logparser_dll-x64.zip) |

[View all releases](https://github.com/chaynes81-ux/loq-releases/releases)

## Documentation

Full documentation is available at: **https://chaynes81-ux.github.io/loq-releases/**

- [Getting Started](https://chaynes81-ux.github.io/loq-releases/getting-started/introduction.html)
- [Installation Guide](https://chaynes81-ux.github.io/loq-releases/getting-started/installation.html)
- [CLI Options](https://chaynes81-ux.github.io/loq-releases/cli/options.html)
- [SQL Reference](https://chaynes81-ux.github.io/loq-releases/sql/)
- [Input Formats](https://chaynes81-ux.github.io/loq-releases/input-formats/)
- [Output Formats](https://chaynes81-ux.github.io/loq-releases/output-formats/)

## Features

- **100% CLI compatible** with MS Log Parser 2.2 syntax
- **2-5x faster** than the original
- **Cross-platform**: Windows, macOS, Linux
- **Windows COM DLL** for drop-in script compatibility (`MSUtil.LogQuery`)
- **24+ input formats**: CSV, JSON, XML, IIS logs, EVTX, PCAP, and more
- **14+ output formats**: CSV, JSON, XML, SQLite, PostgreSQL, charts, and more
- **Full SQL support**: JOINs, subqueries, window functions, CTEs, UNION

## Quick Start

```bash
# Query a CSV file
loq "SELECT * FROM data.csv WHERE age > 30"

# Aggregate query
loq "SELECT city, COUNT(*) FROM users.csv GROUP BY city"

# IIS log analysis
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) FROM u_ex*.log GROUP BY cs-uri-stem"

# JSON output
loq -o:JSON "SELECT * FROM data.csv" > output.json
```

## Windows COM DLL Usage

Existing VBScript and PowerShell scripts work unchanged:

```powershell
# Register the DLL (run as Administrator)
regsvr32 logparser_dll.dll

# Use in PowerShell
$lp = New-Object -ComObject "MSUtil.LogQuery"
$rs = $lp.Execute("SELECT * FROM data.csv WHERE age > 30")

while (-not $rs.atEnd) {
    $rec = $rs.getRecord()
    Write-Host $rec.getValue("name")
    $rs.moveNext()
}
$rs.close()
```

## License

Proprietary - All rights reserved.

## Support

For issues or feature requests, please contact the development team.
