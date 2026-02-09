# LLM Reference Guide for Loq

**Purpose:** This document is designed for Large Language Models (LLMs) without internet access. It provides a comprehensive overview of loq's capabilities and points to detailed documentation files within this repository.

**Version:** 2.2.0  
**Last Updated:** 2026-02-04

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Examples](#quick-start-examples)
3. [SQL Reference Summary](#sql-reference-summary)
4. [SQL Functions Summary](#sql-functions-summary)
5. [Input Formats Summary](#input-formats-summary)
6. [Output Formats Summary](#output-formats-summary)
7. [.NET Bindings Summary](#net-bindings-summary)
8. [FFI (C/Foreign Function Interface) Summary](#ffi-cfforeign-function-interface-summary)
9. [Windows COM DLL Summary](#windows-com-dll-summary)
10. [CLI Syntax Overview](#cli-syntax-overview)
11. [Performance & Benchmarking](#performance--benchmarking)
12. [REST API Server](#rest-api-server)
13. [Documentation Index](#documentation-index)

---

## Project Overview

**loq** (Log Query) is a cross-platform replacement for Microsoft Log Parser 2.2, built in Rust.

### Key Features

- **100% CLI Compatible** with MS Log Parser 2.2 syntax
- **2-5x Faster** performance than the original
- **Cross-Platform**: Windows, macOS, Linux
- **25+ Input Formats**: CSV, JSON, XML, IIS logs, EVTX, PCAP, Syslog, etc.
- **15+ Output Formats**: CSV, JSON, XML, SQLite, PostgreSQL, Charts, etc.
- **Full SQL Support**: JOINs, subqueries, window functions, CTEs, UNION
- **Multiple Interfaces**: CLI binary, .NET bindings, C/FFI library, Windows COM DLL, REST API

### Project Status

- **Phase 7 Complete**: Advanced SQL features (JOINs, subqueries, window functions, CTEs, UNION)
- **Performance Optimized**: CSV parsing optimized for 2-5x throughput improvement
- **Production Ready**: Comprehensive test suite, benchmarks, and documentation

### Binary Name

- **CLI Binary**: `loq` (not `logparser` to avoid trademark issues)
- **Windows COM DLL**: Uses `MSUtil.LogQuery` ProgID for drop-in compatibility

### Architecture

```
loq/
├── cli/          # loq binary (CLI)
├── core/         # logparser-core (SQL parser and executor)
├── formats/      # logparser-formats (input/output format handlers)
├── ffi/          # loq-ffi (C/FFI library for Python, Ruby, Go, etc.)
├── bindings/     # Language bindings (.NET)
├── dll/          # logparser-dll (Windows COM DLL)
├── server/       # logparser-server (REST API)
└── benches/      # Performance benchmarks
```

---

## Quick Start Examples

### Basic Query

```bash
# Query a CSV file
loq "SELECT * FROM data.csv WHERE age > 30"
```

### Aggregation

```bash
# Group by and count
loq "SELECT city, COUNT(*) FROM users.csv GROUP BY city"
```

### IIS Log Analysis

```bash
# Analyze IIS W3C logs
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) FROM u_ex*.log GROUP BY cs-uri-stem"
```

### Output Format Conversion

```bash
# CSV to JSON
loq -o:JSON "SELECT * FROM data.csv" > output.json

# Using INTO clause
loq "SELECT * INTO output.json FROM data.csv"
```

---

## SQL Reference Summary

### Supported SQL Clauses

| Clause | Description | Example |
|--------|-------------|---------|
| **SELECT** | Column selection, wildcards, expressions | `SELECT *, name, age*2` |
| **FROM** | Source file/path (supports glob patterns) | `FROM logs/*.csv` |
| **WHERE** | Row filtering with conditions | `WHERE age > 30 AND status = 'active'` |
| **GROUP BY** | Aggregate data by columns | `GROUP BY city, country` |
| **HAVING** | Filter aggregated results | `HAVING COUNT(*) > 10` |
| **ORDER BY** | Sort results (ASC/DESC) | `ORDER BY age DESC, name ASC` |
| **LIMIT** | Limit number of rows | `LIMIT 100` |
| **TOP** | MS Log Parser compatible limit | `TOP 10` or `TOP 25 PERCENT` |
| **DISTINCT** | Remove duplicate rows | `SELECT DISTINCT city FROM data` |
| **INTO** | Output routing with format inference | `INTO output.json` |
| **JOIN** | Combine tables (INNER, LEFT, CROSS) | `FROM a.csv JOIN b.csv ON a.id = b.id` |
| **UNION** | Combine queries (UNION/UNION ALL) | `SELECT * FROM a UNION SELECT * FROM b` |
| **WITH** | Common Table Expressions (CTEs) | `WITH temp AS (SELECT ...) SELECT * FROM temp` |

### Operators

| Category | Operators |
|----------|-----------|
| **Comparison** | `=`, `!=`, `<`, `>`, `<=`, `>=` |
| **Logical** | `AND`, `OR`, `NOT` |
| **Pattern Matching** | `LIKE`, `IN`, `BETWEEN` |
| **Null Testing** | `IS NULL`, `IS NOT NULL` |
| **Case Expressions** | `CASE WHEN ... THEN ... ELSE ... END` |

### Aggregate Functions

- `COUNT(*)`, `COUNT(column)`
- `SUM(column)`, `AVG(column)`
- `MAX(column)`, `MIN(column)`
- `GROUP_CONCAT(column)`

### Window Functions

- **Ranking**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`
- **Aggregates**: `SUM(...) OVER (...)`, `AVG(...) OVER (...)`, `COUNT(...) OVER (...)`
- **Navigation**: `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`
- **Window Specification**: `PARTITION BY`, `ORDER BY`, `ROWS BETWEEN`

> **Detailed reference:** See [sql.md](sql.md) (to be created)

---

## SQL Functions Summary

loq includes 60+ built-in SQL functions organized by category:

### String Functions

`UPPER`, `LOWER`, `SUBSTR`, `REPLACE`, `TRIM`, `LTRIM`, `RTRIM`, `STRLEN`, `CONCAT`, `INDEX_OF`, `LAST_INDEX_OF`, `EXTRACT_PREFIX`, `EXTRACT_SUFFIX`, `EXTRACT_PATH`, `EXTRACT_FILENAME`, `EXTRACT_EXTENSION`, `PRINTF`, `STRCNT`, `STRREPEAT`, `STRREV`, `REPLACE_CHR`, `ROT13`, `EXTRACT_TOKEN`, `EXTRACT_VALUE`

### Math Functions

`ROUND`, `FLOOR`, `CEIL`, `ABS`, `MOD`, `POWER`, `SQRT`, `SQR`, `LOG`, `LOG10`, `EXP`, `EXP10`, `QNTFLOOR_TO_DIGIT`, `QNTROUND_TO_DIGIT`

### Bitwise Functions

`BIT_AND`, `BIT_OR`, `BIT_XOR`, `BIT_NOT`, `BIT_SHL`, `BIT_SHR`

### Date/Time Functions

`TO_TIMESTAMP`, `TO_DATE`, `TO_TIME`, `EXTRACT`, `NOW`, `DATE_ADD`, `DATE_DIFF`, `QUANTIZE`, `TO_LOCALTIME`, `TO_UTCTIME`, `SYSTEM_DATE`, `SYSTEM_TIME`, `SYSTEM_TIMESTAMP`, `SYSTEM_UTCOFFSET`

### Type Conversion Functions

`TO_INT`, `TO_INTEGER`, `TO_REAL`, `TO_FLOAT`, `TO_STRING`, `TO_STR`

### Conditional Functions

`COALESCE`, `NULLIF`, `IF`, `CASE WHEN`

### Network Functions

`REVERSEDNS`, `IPMASK`, `IPNETWORK`

### IP/Hex Functions

`TO_HEX`, `HEX_TO_INT`, `HEX_TO_ASC`, `IPV4_TO_INT`, `INT_TO_IPV4`

### URL Functions

`URLESCAPE`, `URL_ESCAPE`, `URLUNESCAPE`, `URL_UNESCAPE`

### System Functions

`COMPUTER_NAME`, `SYSTEM_DATE`, `SYSTEM_TIME`, `SYSTEM_TIMESTAMP`, `SYSTEM_UTCOFFSET`

### Security Functions

`HASHMD5`, `HASHMD5_FILE`, `RESOLVE_SID` (Windows), `WIN32_ERROR_DESCRIPTION` (Windows)

### Formatting Functions

`PRINTF` - C-style printf formatting (e.g., `PRINTF('%s: %.2f', name, value)`)

> **Detailed reference:** See [FUNCTIONS.md](../../FUNCTIONS.md)

---

## Input Formats Summary

loq supports 25+ input formats for reading structured and unstructured data:

| Format | Flag | Description | Platform |
|--------|------|-------------|----------|
| **CSV** | `-i:CSV` | Comma-separated values (default) | All |
| **TSV** | `-i:TSV` | Tab-separated values | All |
| **FIXEDWIDTH** | `-i:FIXEDWIDTH` | Fixed-width text files (requires `--iFieldDef`) | All |
| **JSON** | `-i:JSON` | JSON array or NDJSON | All |
| **XML** | `-i:XML` | XML documents with schema detection | All |
| **W3C** | `-i:W3C` | IIS W3C extended log format | All |
| **IIS** | `-i:IIS` | IIS native log format (15-field fixed schema) | All |
| **BIN** | `-i:BIN` | IIS Centralized Binary Logging (.ibl files) | All |
| **HTTPERR** | `-i:HTTPERR` | HTTP.sys error logs | All |
| **URLSCAN** | `-i:URLSCAN` | URLScan security logs | All |
| **NCSA** | `-i:NCSA` | Apache/Nginx combined logs | All |
| **TEXTLINE** | `-i:TEXTLINE` | Line-by-line with optional regex | All |
| **TEXTWORD** | `-i:TEXTWORD` | Word-by-word parsing with position tracking | All |
| **EVTX** | `-i:EVTX` | Windows Event Log files | All (cross-platform) |
| **SYSLOG** | `-i:SYSLOG` | RFC 3164/5424 syslog | All |
| **FS** | `-i:FS` | Filesystem metadata queries | All |
| **REG** | `-i:REG` | Windows Registry .reg files | All (cross-platform) |
| **PCAP** | `-i:PCAP` | Network capture files | All (cross-platform) |
| **ETW** | `-i:ETW` | Event Tracing for Windows | Windows only |
| **ADS** | `-i:ADS` | Active Directory queries | Windows only |
| **IISODBC** | `-i:IISODBC` | IIS ODBC logging | Windows only |
| **NAT** | `-i:NAT` | Native binary format for re-ingestion | All |
| **PARQUET** | `-i:PARQUET` | Apache Parquet columnar format | All |
| **S3** | `-i:S3` | Amazon S3 objects with compression | All |

> **Detailed reference:** See [formats/README.md](../formats/README.md) (to be created)

---

## Output Formats Summary

loq supports 15+ output formats for writing results:

| Format | Flag | Description | Requires File |
|--------|------|-------------|---------------|
| **CSV** | `-o:CSV` | Comma-separated values (default to stdout) | No |
| **TSV** | `-o:TSV` | Tab-separated values | No |
| **JSON** | `-o:JSON` | JSON/NDJSON | No |
| **XML** | `-o:XML` | XML documents with element/attribute styles | No |
| **W3C** | `-o:W3C` | W3C extended log format | No |
| **IIS** | `-o:IIS` | IIS native log format (15-field fixed schema) | No |
| **DATAGRID** | `-o:DATAGRID` | Formatted ASCII tables | No |
| **SQLITE** | `-o:SQLITE` | SQLite database | Yes (`--ofile PATH`) |
| **PostgreSQL** | `-o:POSTGRES` | PostgreSQL database | Library only |
| **MySQL** | `-o:MYSQL` | MySQL database | Library only |
| **SYSLOG** | `-o:SYSLOG` | Syslog via UDP/TCP | Library only |
| **ODBC** | `-o:ODBC` | ODBC/MS Access | Windows only, library |
| **CHART** | `-o:CHART` | PNG/SVG charts (Bar, Line, Pie) | Yes (`--ofile PATH`) |
| **NAT** | `-o:NAT` | Native binary format | Yes |
| **PARQUET** | `-o:PARQUET` | Apache Parquet columnar format | Yes |
| **CLOUDWATCH** | `-o:CLOUDWATCH` | AWS CloudWatch Logs | Library only |
| **TEMPLATE** | `-o:TEMPLATE` | Custom template-based output | Requires `--tpl` |
| **NULL** | `-o:NULL` | Discard output (benchmarking) | No |

> **Detailed reference:** See [formats/README.md](../formats/README.md) (to be created)

---

## .NET Bindings Summary

loq provides three .NET packages for cross-platform integration:

### Packages

| Package | Description | Use Case |
|---------|-------------|----------|
| **Loq.Native** | Low-level P/Invoke bindings | Direct native library access |
| **Loq.Classic** | COM-compatible API | Drop-in MS Log Parser replacement |
| **Loq** | Modern C# API | New applications with LINQ/async |

### Installation

```bash
# Classic API (drop-in replacement)
dotnet add package Loq.Classic

# Modern API (recommended for new code)
dotnet add package Loq
```

### Classic API Example

```csharp
using Loq.Classic;

using var lp = new LogQuery();
using var rs = lp.Execute("SELECT * FROM data.csv WHERE age > 30");

while (!rs.AtEnd)
{
    var record = rs.GetRecord();
    var name = record.GetValue("name");
    var age = record.GetInt("age");
    Console.WriteLine($"{name}: {age}");
    rs.MoveNext();
}
```

### Modern API Example

```csharp
using Loq;

// Strongly-typed results
public record Person(string Name, int Age, string City);

var people = LogEngine.Query<Person>(
    "SELECT name, age, city FROM data.csv WHERE age > 30"
);

foreach (var person in people)
{
    Console.WriteLine($"{person.Name} is {person.Age} years old");
}

// Get count efficiently
long count = LogEngine.Count("SELECT * FROM data.csv WHERE status = 'active'");
```

### Cross-Platform Deployment

.NET bindings require platform-specific native libraries:

- **Windows**: `loq.dll`
- **Linux**: `libloq.so`
- **macOS**: `libloq.dylib`

Use RID-specific runtime assets in `runtimes/{rid}/native/` directory structure.

> **Detailed reference:** See [docs/bindings/dotnet.md](../bindings/dotnet.md) or [bindings/dotnet/README.md](../../bindings/dotnet/README.md)

---

## FFI (C/Foreign Function Interface) Summary

loq provides a C-compatible FFI library (`libloq`) for integration with Python, Ruby, Go, Node.js, and other languages.

### Library Files

| Platform | Library File | Location |
|----------|--------------|----------|
| Linux | `libloq.so` | `target/release/libloq.so` |
| macOS | `libloq.dylib` | `target/release/libloq.dylib` |
| Windows | `loq.dll` | `target/release/loq.dll` |

### Building

```bash
cargo build --release -p loq-ffi
```

### API Styles

1. **Classic API**: Cursor-based iteration (MS Log Parser compatible)
2. **Modern API**: Bulk JSON transfer (high performance)

### Classic API Example (Python)

```python
from ctypes import *

libloq = CDLL("libloq.so")

# Create query
query = libloq.loq_query_create()

# Execute
sql = "SELECT * FROM data.csv LIMIT 10"
rs = libloq.loq_query_execute(query, sql.encode('utf-8'))

# Iterate rows
while not libloq.loq_recordset_at_end(rs):
    name_ptr = libloq.loq_recordset_get_string(rs, b"name")
    name = cast(name_ptr, c_char_p).value.decode('utf-8')
    print(name)
    libloq.loq_free_string(name_ptr)
    libloq.loq_recordset_move_next(rs)

# Cleanup
libloq.loq_recordset_free(rs)
libloq.loq_query_free(query)
```

### Modern API Example (Python)

```python
import json
from ctypes import *

libloq = CDLL("libloq.so")

# Execute query and get JSON
sql = "SELECT * FROM data.csv LIMIT 10"
result_ptr = libloq.loq_execute_json(sql.encode('utf-8'))

result_str = cast(result_ptr, c_char_p).value.decode('utf-8')
libloq.loq_free_string(result_ptr)

data = json.loads(result_str)
print(f"Found {data['row_count']} rows")
```

### Type System

| Type Constant | Rust Type | C Type | Description |
|---------------|-----------|--------|-------------|
| `INTEGER_TYPE` (1) | `i64` | `int64_t` | 64-bit signed integer |
| `REAL_TYPE` (2) | `f64` | `double` | 64-bit floating point |
| `STRING_TYPE` (3) | `String` | `char*` | UTF-8 string |
| `TIMESTAMP_TYPE` (4) | `DateTime` | `char*` | ISO 8601 timestamp |
| `NULL_TYPE` (5) | `Value::Null` | - | SQL NULL value |

### Memory Management

1. Strings returned by loq → Must be freed with `loq_free_string()`
2. Handles → Must be freed with appropriate free function
3. Strings passed to loq → Caller retains ownership

> **Detailed reference:** See [docs/bindings/ffi.md](../bindings/ffi.md)

---

## Windows COM DLL Summary

loq provides a Windows COM DLL (`logparser_dll.dll`) for drop-in compatibility with VBScript, PowerShell, and other COM scripts.

### Building

```bash
cargo build --release -p logparser-dll
```

### Registration

```cmd
# Register (as Administrator)
regsvr32 target\release\logparser_dll.dll

# Unregister
regsvr32 /u target\release\logparser_dll.dll
```

### COM Interfaces

- **MSUtil.LogQuery**: Main entry point
- **ILogRecordSet**: Result set with cursor iteration
- **ILogRecord**: Individual record/row access

### VBScript Example

```vbscript
Set objLogParser = CreateObject("MSUtil.LogQuery")
Set objRS = objLogParser.Execute("SELECT * FROM file.csv WHERE age > 30")

Do While Not objRS.atEnd
    Set objRecord = objRS.getRecord()
    WScript.Echo objRecord.getValue("name") & ": " & objRecord.getValue("age")
    objRS.moveNext
Loop

objRS.close
```

### PowerShell Example

```powershell
$logParser = New-Object -ComObject "MSUtil.LogQuery"
$rs = $logParser.Execute("SELECT name, COUNT(*) as cnt FROM logs.csv GROUP BY name")

while (-not $rs.atEnd) {
    $record = $rs.getRecord()
    Write-Host "$($record.getValue('name')): $($record.getValue('cnt'))"
    $rs.moveNext()
}

$rs.close()
```

> **Detailed reference:** See [dll/README.md](../../dll/README.md)

---

## CLI Syntax Overview

### Basic Syntax

```bash
loq [OPTIONS] "SQL_QUERY"
```

### CLI Options

#### Input Options

- `-i:FORMAT` - Input format (CSV, TSV, JSON, XML, W3C, etc.)
- `-headerRow:ON|OFF` - Control whether first row is headers (default: ON)
- `--iFieldDef "field:start-end,..."` - Field definitions for FIXEDWIDTH format
- `-e:<N>` - Maximum parse errors before abort (-1 for unlimited, default: 10)
- `--iCheckpoint:PATH` - Resume from checkpoint file

#### Output Options

- `-o:FORMAT` - Output format (CSV, JSON, XML, DATAGRID, SQLITE, etc.)
- `--ofile PATH` - Output file path (for formats requiring file output)
- `--oCheckpoint:PATH` - Save checkpoint on completion

#### Query/Display Options

- `-q:ON|OFF` - Quiet mode - suppress informational messages (default: OFF)
- `--stats:ON|OFF` - Show execution statistics (default: OFF)

#### Streaming Options

- `-f` / `--follow` - Follow mode - monitor files for changes (like tail -f)

#### Template Options

- `--tpl:PATH` - Template file path for TEMPLATE output format

### Examples

```bash
# Basic CSV query
loq "SELECT * FROM data.csv WHERE age > 30"

# Specify input/output formats
loq -i:W3C -o:JSON "SELECT cs-uri-stem FROM logs/*.log" > output.json

# Fixed-width file parsing
loq -i:FIXEDWIDTH --iFieldDef "name:0-9,age:10-13,city:14-" "SELECT * FROM data.txt"

# Top 25 percent of rows
loq "SELECT TOP 25 PERCENT * FROM data.csv ORDER BY age DESC"

# Resume from checkpoint
loq --iCheckpoint:progress.chk "SELECT * FROM large_file.csv"

# Follow mode (like tail -f)
loq -f "SELECT * FROM /var/log/app.log WHERE level = 'ERROR'"

# Quiet mode with statistics
loq -q:ON --stats:ON "SELECT COUNT(*) FROM data.csv"
```

### MS Log Parser Compatibility

loq uses `-option:value` syntax compatible with MS Log Parser 2.2:

```bash
# These work identically
loq -i:CSV "SELECT * FROM data.csv"
logparser.exe -i:CSV "SELECT * FROM data.csv"  # Original MS Log Parser
```

> **Detailed reference:** See [CLAUDE.md](../../CLAUDE.md) or [README.md](../../README.md)

---

## Performance & Benchmarking

### Performance Status

CSV parsing optimized for **2-5x throughput improvement** over MS Log Parser 2.2.

### Key Optimizations

- **64KB I/O buffers**: 8x larger than default (10-20% gain)
- **Pre-allocated vectors**: Eliminates reallocations (5-10% gain)
- **Fast-path type parsing**: Conditional trimming, length-based matching (15-25% gain)
- **Inline hints**: Reduced function call overhead (3-5% gain)
- **Optimized iteration**: Single-pass type inference (5-8% gain)

### Expected Throughput

- Small CSV (100 rows): ~100K rows/sec
- Medium CSV (10K rows): ~50K rows/sec
- Large CSV (1M rows): ~30K rows/sec

### Benchmarking

Comprehensive benchmark suite using Criterion.rs:

```bash
# Generate test data
cargo run --release -p logparser-benches --bin generate_data

# Run all benchmarks
cargo bench -p logparser-benches

# Run specific benchmark suites
cargo bench -p logparser-benches --bench parsing     # Input parsing
cargo bench -p logparser-benches --bench execution   # Query execution
cargo bench -p logparser-benches --bench end_to_end  # Full pipeline

# View results
open target/criterion/report/index.html
```

### Benchmark Coverage

- **Input Parsing**: CSV, JSON, W3C, XML parsing with various sizes
- **Query Execution**: SELECT, WHERE, aggregates, GROUP BY, ORDER BY, DISTINCT
- **End-to-End**: Complete query pipeline, complex queries

> **Detailed reference:** See [PERFORMANCE.md](../../PERFORMANCE.md), [benches/README.md](../../benches/README.md)

---

## REST API Server

loq includes a REST API server (`logparser-server`) for executing SQL queries over HTTP.

### Starting the Server

```bash
cargo run -p logparser-server
# Server listens on http://0.0.0.0:8080
```

### API Endpoints

#### POST /api/v1/query

Execute a SQL query.

**Request:**
```json
{
  "sql": "SELECT * FROM data.csv LIMIT 10",
  "input_format": "CSV"
}
```

**Response:**
```json
{
  "columns": ["name", "age", "city"],
  "rows": [
    {"values": ["Alice", 30, "NYC"]},
    {"values": ["Bob", 25, "SF"]}
  ],
  "stats": {
    "rows_scanned": 100,
    "rows_returned": 2,
    "execution_time_ms": 5
  }
}
```

#### GET /api/v1/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM test_data/sample.csv LIMIT 5"}'
```

### Features

- JSON request/response format
- Query execution statistics
- Comprehensive error handling
- CORS support for web applications
- Structured logging with tracing

> **Detailed reference:** See [server/README.md](../../server/README.md), [server/USAGE.md](../../server/USAGE.md)

---

## Documentation Index

This repository contains extensive documentation organized by topic. Here's a complete index:

### Core Documentation

- **[README.md](../../README.md)** - Project overview, installation, quick start
- **[CLAUDE.md](../../CLAUDE.md)** - Development guide for Claude Code (LLM)
- **[PROJECT_PLAN.md](../../PROJECT_PLAN.md)** - Development roadmap and phases

### SQL & Functions

- **[FUNCTIONS.md](../../FUNCTIONS.md)** - Complete function reference (60+ functions)
- `sql.md` (to be created) - Comprehensive SQL syntax reference

### Formats

- **Input Format Implementations**: `formats/src/*_input.rs`
- **Output Format Implementations**: `formats/src/*_output.rs`
- `formats/README.md` (to be created) - Format reference guide

### Performance

- **[PERFORMANCE.md](../../PERFORMANCE.md)** - Comprehensive optimization guide
- **[CSV_PERFORMANCE_GUIDE.md](../../CSV_PERFORMANCE_GUIDE.md)** - Developer quick reference
- **[OPTIMIZATION_SUMMARY.md](../../OPTIMIZATION_SUMMARY.md)** - Implementation details
- **[benches/README.md](../../benches/README.md)** - Benchmarking documentation

### Advanced Features

- **[JOIN_IMPLEMENTATION.md](../../JOIN_IMPLEMENTATION.md)** - JOIN support details
- **[SUBQUERY_FEATURE.md](../../SUBQUERY_FEATURE.md)** - Subquery implementation
- **[PARALLEL_PROCESSING.md](../../PARALLEL_PROCESSING.md)** - Parallel query execution

### Bindings & Interfaces

- **[docs/bindings/dotnet.md](../bindings/dotnet.md)** - .NET bindings reference
- **[docs/bindings/ffi.md](../bindings/ffi.md)** - C/FFI reference
- **[bindings/dotnet/README.md](../../bindings/dotnet/README.md)** - .NET package overview
- **[dll/README.md](../../dll/README.md)** - Windows COM DLL documentation

### Server & Deployment

- **[server/README.md](../../server/README.md)** - REST API server documentation
- **[server/USAGE.md](../../server/USAGE.md)** - API usage examples
- **[DOCKER.md](../../DOCKER.md)** - Docker deployment guide
- **[k8s/README.md](../../k8s/README.md)** - Kubernetes deployment

### Format-Specific Documentation

- **[BIN_FORMAT_IMPLEMENTATION.md](../../BIN_FORMAT_IMPLEMENTATION.md)** - IIS binary logging
- **[EVTX_IMPLEMENTATION.md](../../EVTX_IMPLEMENTATION.md)** - Windows Event Logs
- **[PCAP_FORMAT.md](../../PCAP_FORMAT.md)** - Network capture files
- **[PARQUET_IMPLEMENTATION.md](../../PARQUET_IMPLEMENTATION.md)** - Apache Parquet format
- **[S3_INPUT_GUIDE.md](../../S3_INPUT_GUIDE.md)** - Amazon S3 integration
- **[CLOUDWATCH_IMPLEMENTATION.md](../../CLOUDWATCH_IMPLEMENTATION.md)** - AWS CloudWatch Logs

### Implementation Summaries

- **[IMPLEMENTATION_COMPLETE.md](../../IMPLEMENTATION_COMPLETE.md)** - Feature completion status
- **[IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md)** - Implementation overview
- **[CLI_IMPLEMENTATION_SUMMARY.md](../../CLI_IMPLEMENTATION_SUMMARY.md)** - CLI features
- **[STATUS.md](../../STATUS.md)** - Current project status

### Known Issues

- **[KNOWN_ISSUES.md](../../KNOWN_ISSUES.md)** - Known limitations and workarounds
- **[test_comparison/MISSING_FEATURES.md](../../test_comparison/MISSING_FEATURES.md)** - Missing MS Log Parser features

---

## Usage Tips for LLMs

### When to Use This Reference

1. **Starting point**: Use this file to understand what loq can do
2. **Find specific documentation**: Use the pointers to detailed files
3. **Quick lookup**: Check function/format/SQL clause availability

### How to Navigate

1. **Check this file first** for high-level capabilities
2. **Follow "Detailed reference" links** for in-depth information
3. **Check Implementation Summaries** for implementation details
4. **Read CLAUDE.md** for development context

### Common Queries

- **"Can loq do X?"** → Check SQL Reference or Input/Output Formats tables
- **"How do I use function Y?"** → See FUNCTIONS.md
- **"What's the .NET API?"** → See docs/bindings/dotnet.md
- **"How do I optimize performance?"** → See PERFORMANCE.md
- **"How do I parse format Z?"** → Check Input Formats table, then format-specific docs

### Key Differences from MS Log Parser 2.2

1. **Binary name**: `loq` instead of `logparser.exe`
2. **Cross-platform**: Works on Windows, Linux, macOS
3. **Performance**: 2-5x faster
4. **Modern SQL**: Window functions, CTEs, UNION support
5. **More formats**: EVTX, PCAP, Parquet, S3, etc.
6. **Multiple interfaces**: CLI, .NET, FFI, COM, REST API

---

## Version Information

- **loq Version**: 2.2.0
- **Rust Edition**: 2021
- **Minimum Rust Version**: 1.70+
- **Target Platforms**: Windows, macOS, Linux (x86_64, ARM64)

---

## License

MIT License - see LICENSE file in repository root.

---

**End of LLM Reference Guide**
