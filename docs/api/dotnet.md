---
title: .NET API
---

# .NET API Reference

loq provides .NET bindings for programmatic log analysis. The `Loq.Classic` package is a drop-in replacement for the MS Log Parser 2.2 COM API.

## Installation

```bash
dotnet add package Loq.Classic  # COM-compatible API
dotnet add package Loq          # Modern C# API
```

## Quick Start

```csharp
using Loq.Classic;
using Loq.Classic.InputFormats;

// Basic query
using var lp = new LogQuery();
using var rs = lp.Execute("SELECT * FROM access.log WHERE sc-status >= 500");

while (!rs.AtEnd)
{
    var rec = rs.GetRecord();
    Console.WriteLine($"{rec.GetValue("date")}: {rec.GetString("cs-uri-stem")}");
    rs.MoveNext();
}
```

## COM API Compatibility

Loq.Classic implements the full MS Log Parser 2.2 COM API surface:

### Core Classes

- **LogQuery** - Query execution (`Execute`, `ExecuteBatch` with format context overloads)
- **LogRecordSet** - Cursor-based result iteration
- **LogRecord** - Row data access (`GetValue`, `GetValueEx`, `IsNull`)
- **LogStringCollection** - Error message collection

### Format Context Classes

16 input format contexts and 11 output format contexts matching every COM interface:

**Input:** COMCSVInputContext, COMIISW3CInputContext, COMTSVInputContext, COMXMLInputContext, COMIISIISInputContext, COMIISNCSAInputContext, COMIISBINInputContext, COMHttpErrorInputContext, COMURLScanLogInputContext, COMTextLineInputContext, COMTextWordInputContext, COMFileSystemInputContext, COMRegistryInputContext, COMW3CInputContext, COMNetMonInputContext, COMIISIISMSIDInputContext

**Output:** COMCSVOutputContext, COMTSVOutputContext, COMW3COutputContext, COMIISOutputContext, COMXMLOutputContext, COMSQLOutputContext, COMNativeOutputContext, COMTemplateOutputContext, COMDataGridOutputContext, COMChartOutputContext, COMSYSLOGOutputContext

### Migration Example

**Before (VBScript with MS Log Parser):**
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

### Cross-Platform

Unlike MS Log Parser (Windows-only COM), Loq.Classic runs on Windows, Linux, and macOS. No COM registration required.

::: tip
For new applications, consider the modern `Loq` API with LINQ support, strong typing, and `IEnumerable` results. See the [LLM docs](/llm-docs/) for details.
:::
