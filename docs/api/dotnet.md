---
title: .NET API
---

# .NET API Reference

loq provides .NET bindings for programmatic log analysis. The `Loq.Classic` package is a drop-in replacement for the MS Log Parser 2.2 COM API. Works on **Windows and Linux** — no COM registration required.

## Quick Start
## Installation

```bash
dotnet add package Loq.Classic  # COM-compatible API (MS Log Parser drop-in)
dotnet add package Loq          # Modern C# API (LINQ, async, streaming)
```

No additional setup needed — packages are on [nuget.org](https://www.nuget.org/packages/Loq.Classic).

```csharp
using Loq.Classic;
using Loq.Classic.InputFormats;

// Basic query — works on Windows and Linux
using var lp = new LogQuery();
using var rs = lp.Execute("SELECT * FROM 'access.log' WHERE sc-status >= 500");

while (!rs.AtEnd)
{
    var rec = rs.GetRecord();
    Console.WriteLine($"{rec.GetValue("date")}: {rec.GetString("cs-uri-stem")}");
    rs.MoveNext();
}
```

### With format context (configure input parsing)

```csharp
using Loq.Classic;
using Loq.Classic.InputFormats;

using var lp = new LogQuery();
var w3c = new COMIISW3CInputContext
{
    iCodepage = 65001,     // UTF-8
    consolidateLogs = true
};

using var rs = lp.Execute(
    "SELECT c-ip, cs(User-Agent), sc-status FROM 'access.log' WHERE sc-status >= 400",
    w3c
);

while (!rs.AtEnd)
{
    var rec = rs.GetRecord();
    Console.WriteLine($"{rec.GetValue("c-ip")}: {rec.GetInt("sc-status")}");
    rs.MoveNext();
}
```

### Batch execution (write to output file)

```csharp
using Loq.Classic;
using Loq.Classic.InputFormats;
using Loq.Classic.OutputFormats;

using var lp = new LogQuery();
var csvIn = new COMCSVInputContext { headerRow = true };
var sqlOut = new COMSQLOutputContext
{
    server = "localhost",
    database = "logs",
    createTable = true
};

lp.ExecuteBatch(
    "SELECT * INTO results FROM 'access.log' WHERE sc-status >= 500",
    csvIn, sqlOut
);

Console.WriteLine($"Processed {lp.inputUnitsProcessed} rows");
```

## COM API Compatibility

Loq.Classic implements the full MS Log Parser 2.2 COM API surface:

### Core Classes

| Class | Description |
|-------|-------------|
| **LogQuery** | Query execution (`Execute`, `ExecuteBatch` with format context overloads) |
| **LogRecordSet** | Cursor-based result iteration (`AtEnd`, `MoveNext`, `GetRecord`) |
| **LogRecord** | Row data access (`GetValue`, `GetValueEx`, `IsNull`, `ToNativeString`) |
| **LogStringCollection** | Error message collection (`IEnumerable<string>`) |

### LogQuery Properties

| Property | Type | Description |
|----------|------|-------------|
| `maxParseErrors` | `int` | Max parsing errors before abort (-1 = unlimited) |
| `lastError` | `int` | Last error code |
| `inputUnitsProcessed` | `int` | Rows processed in last ExecuteBatch |
| `outputUnitsProcessed` | `int` | Rows output in last ExecuteBatch |
| `errorMessages` | `LogStringCollection` | Error messages from last execution |
| `versionMaj` | `int` | Major version (2) |
| `versionMin` | `int` | Minor version (2) |

### Format Context Classes

16 input format contexts and 11 output format contexts matching every COM interface:

**Input:** `COMCSVInputContext`, `COMIISW3CInputContext`, `COMTSVInputContext`, `COMXMLInputContext`, `COMIISIISInputContext`, `COMIISNCSAInputContext`, `COMIISBINInputContext`, `COMHttpErrorInputContext`, `COMURLScanLogInputContext`, `COMTextLineInputContext`, `COMTextWordInputContext`, `COMFileSystemInputContext`, `COMRegistryInputContext`, `COMW3CInputContext`, `COMNetMonInputContext`, `COMIISIISMSIDInputContext`

**Output:** `COMCSVOutputContext`, `COMTSVOutputContext`, `COMW3COutputContext`, `COMIISOutputContext`, `COMXMLOutputContext`, `COMSQLOutputContext`, `COMNativeOutputContext`, `COMTemplateOutputContext`, `COMDataGridOutputContext`, `COMChartOutputContext`, `COMSYSLOGOutputContext`

### Migration from MS Log Parser

**Before (VBScript):**
```vbscript
Set lp = CreateObject("MSUtil.LogQuery")
Set csvFmt = CreateObject("MSUtil.LogQuery.CSVInputFormat")
csvFmt.headerRow = True
csvFmt.nSkipLines = 2

Set rs = lp.Execute("SELECT * FROM data.csv", csvFmt)
Do While Not rs.atEnd
    WScript.Echo rs.getRecord().getValue("name")
    rs.moveNext
Loop
rs.close
```

**After (C# with Loq.Classic):**
```csharp
using Loq.Classic;
using Loq.Classic.InputFormats;

using var lp = new LogQuery();
var csvFmt = new COMCSVInputContext
{
    headerRow = true,
    nSkipLines = 2
};

using var rs = lp.Execute("SELECT * FROM data.csv", csvFmt);
while (!rs.AtEnd)
{
    Console.WriteLine(rs.GetRecord().GetValue("name"));
    rs.MoveNext();
}
```

## Deployment

### Linux (Docker)

```dockerfile
FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY publish/ .
ENTRYPOINT ["dotnet", "YourApp.dll"]
```

```bash
dotnet publish -c Release -r linux-x64 -o ./publish
docker build -t your-app .
docker run -v $(pwd)/logs:/logs your-app
```

### Windows Service

```bash
dotnet publish -c Release -r win-x64 --self-contained
```

### Cross-Platform

The NuGet package includes native libraries for both platforms. Just `dotnet publish` for your target:

```bash
dotnet publish -c Release -r linux-x64    # Linux
dotnet publish -c Release -r win-x64      # Windows
```

## Cross-Platform Advantages

Unlike MS Log Parser (Windows-only COM), Loq.Classic:

- Runs on **Windows, Linux**, and containers
- No COM registration or `regsvr32` needed
- No platform-specific code — same C# on all platforms
- 2-5x faster (Rust engine with zero-copy parsing)
- Modern .NET 8 with `IDisposable`, nullable references

::: tip Modern API
For new applications, consider the `Loq` package with LINQ support, strong typing, and `IEnumerable` results. See the [LLM docs](/llm-docs/) for details.
:::
