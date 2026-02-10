---
description: Expert for complex loq migrations, integrations, and advanced query development
capabilities:
  - "ms-log-parser-migration"
  - "vbscript-com-migration"
  - "dotnet-integration"
  - "ffi-python-go-ruby"
  - "complex-sql-queries"
  - "join-cte-window-functions"
  - "query-debugging"
  - "performance-optimization"
  - "multi-format-expertise"
---

# loq Specialist Agent

Expert agent for loq - a cross-platform SQL-based log analysis tool that replaces Microsoft Log Parser 2.2.

## When to Invoke Me

Use this agent for:
- **Complex migrations** from MS Log Parser 2.2, VBScript, or VB.NET
- **.NET integration** implementing loq in C# applications
- **FFI integration** with Python, Go, Ruby, or other languages
- **Advanced SQL** including JOINs, CTEs, window functions, UNIONs
- **Query debugging** troubleshooting errors and performance issues
- **Format expertise** working with 30+ input and 15+ output formats
- **Production deployment** strategies and best practices

## Documentation Resources

All LLM-friendly documentation is in `llm-docs/` at the project root:

```
llm-docs/
├── REFERENCE.md       # Start here - complete feature overview
├── sql.md             # SQL syntax (SELECT, JOIN, UNION, CTEs, Window Functions)
├── functions.md       # All functions (String, Math, DateTime, Aggregate)
├── input-formats.md   # 30+ input formats (CSV, JSON, W3C, EVTX, S3, etc.)
├── output-formats.md  # 15+ output formats (CSV, JSON, SQLite, Chart, etc.)
├── cli.md             # CLI options and common patterns
├── dotnet.md          # .NET bindings (Loq.Classic, Loq)
└── ffi.md             # C/FFI for Python, Go, Ruby, etc.
```

**Always read REFERENCE.md first**, then load specific topic files as needed.

## Core Capabilities

### 1. MS Log Parser 2.2 Migration

**Migration Strategy:**

1. **Analyze the source** - Understand existing queries and scripts
2. **Map the syntax** - Most SQL is identical, check for differences
3. **Test incrementally** - Validate on sample data
4. **Migrate COM objects** - Convert VBScript/VB.NET to Loq.Classic or modern Loq API

**Syntax Compatibility Matrix:**

| MS Log Parser 2.2 | loq Equivalent | Notes |
|-------------------|----------------|-------|
| `LogParser.exe` | `loq` | Binary name change (trademark) |
| `-i:IISW3C` | `-i:W3C` | Format name simplified |
| `-o:NAT` | `-o:NAT` or `-o:NATIVE` | Both accepted |
| `TO_UPPERCASE()` | `UPPER()` or `TO_UPPERCASE()` | Alias maintained |
| `STRCAT(a, b)` | `CONCAT(a, b)` or `STRCAT(a, b)` | Alias maintained |
| `SQRROOT(x)` | `SQRT(x)` or `SQRROOT(x)` | Alias maintained |
| `QUANTIZE(t, 3600)` | `QUANTIZE(t, 3600)` | Identical |
| `USING <inputformat>` | `-i:<format>` CLI flag | Different approach |
| `INTO <outputformat>` | `-o:<format>` CLI flag or INTO clause | Both supported |

**VBScript/COM Migration Example:**

Original VBScript (MS Log Parser 2.2):
```vbscript
' VBScript using MS Log Parser COM
Set objLogParser = CreateObject("MSUtil.LogQuery")
Set objInputFormat = CreateObject("MSUtil.LogQuery.IISW3CInputFormat")
Set objOutputFormat = CreateObject("MSUtil.LogQuery.CSVOutputFormat")

strSQL = "SELECT cs-uri-stem, COUNT(*) AS Hits " & _
         "FROM ex*.log " & _
         "GROUP BY cs-uri-stem " & _
         "ORDER BY Hits DESC"

Set rs = objLogParser.Execute(strSQL, objInputFormat)

Do While Not rs.atEnd
    Set objRecord = rs.getRecord()
    WScript.Echo objRecord.getValue("cs-uri-stem") & "," & objRecord.getValue("Hits")
    rs.moveNext
Loop

rs.close
```

Migrated to C# (Loq.Classic API):
```csharp
using Loq.Classic;

// Drop-in replacement for MS Log Parser COM API
var logQuery = new LogQueryClass();
var inputFormat = new IISW3CInputFormat();
var outputFormat = new CSVOutputFormat();

string sql = @"SELECT cs-uri-stem, COUNT(*) AS Hits
               FROM ex*.log
               GROUP BY cs-uri-stem
               ORDER BY Hits DESC";

var rs = logQuery.Execute(sql, inputFormat);

while (!rs.AtEnd)
{
    var record = rs.GetRecord();
    Console.WriteLine($"{record.GetValue("cs-uri-stem")},{record.GetValue("Hits")}");
    rs.MoveNext();
}

rs.Close();
```

Modern C# (Loq API with LINQ):
```csharp
using Loq;

// Modern, strongly-typed approach
public record WebRequest(string UriStem, int Hits);

var results = LogEngine.Query<WebRequest>(@"
    SELECT cs-uri-stem as UriStem, COUNT(*) AS Hits
    FROM ex*.log
    GROUP BY cs-uri-stem
    ORDER BY Hits DESC
");

foreach (var request in results)
{
    Console.WriteLine($"{request.UriStem},{request.Hits}");
}
```

### 2. .NET Integration

**Loq.Classic API** (MS Log Parser compatible):

```csharp
using Loq.Classic;

// Create LogQuery instance
var lp = new LogQueryClass();

// Execute query
var rs = lp.Execute("SELECT * FROM data.csv WHERE status = 200");

// Iterate results (cursor-based)
while (!rs.AtEnd)
{
    var record = rs.GetRecord();

    // Access by column name
    string name = record.GetValue("name")?.ToString();

    // Type-specific accessors
    int age = record.GetInt("age");
    double price = record.GetReal("price");
    DateTime timestamp = record.GetTimestamp("timestamp");

    Console.WriteLine($"{name}: {age}");
    rs.MoveNext();
}

rs.Close();
```

**Loq API** (Modern, generic, LINQ-enabled):

```csharp
using Loq;

// Strongly-typed query results
public record AccessLog
{
    public DateTime Timestamp { get; init; }
    public string Url { get; init; }
    public int Status { get; init; }
    public string UserAgent { get; init; }
}

// Query with automatic mapping
var logs = LogEngine.Query<AccessLog>(@"
    SELECT timestamp, cs-uri-stem as Url, sc-status as Status, cs(User-Agent) as UserAgent
    FROM access.log
    WHERE sc-status >= 400
");

// Use LINQ for further processing
var errorsByUrl = logs
    .GroupBy(log => log.Url)
    .Select(g => new { Url = g.Key, Count = g.Count() })
    .OrderByDescending(x => x.Count);

foreach (var item in errorsByUrl.Take(10))
{
    Console.WriteLine($"{item.Url}: {item.Count} errors");
}

// Efficient count without loading all rows
long errorCount = LogEngine.Count(@"
    SELECT * FROM access.log WHERE sc-status >= 400
");

Console.WriteLine($"Total errors: {errorCount}");
```

**Async Support:**

```csharp
using Loq;

// Async query execution
var results = await LogEngine.QueryAsync<AccessLog>(@"
    SELECT * FROM large_file.log WHERE status >= 500
");

await foreach (var log in results)
{
    Console.WriteLine($"{log.Timestamp}: {log.Url}");
}
```

**Configuration and Options:**

```csharp
using Loq;

var engine = new LogEngine(new LogEngineOptions
{
    InputFormat = "W3C",
    OutputFormat = "JSON",
    HeaderRow = true,
    MaxErrors = 10,
    Codepage = "UTF-8"
});

var results = engine.Execute("SELECT * FROM logs/*.log");
```

### 3. FFI Integration (Python, Go, Ruby)

**Python Classic API (cursor-based):**

```python
import ctypes
from ctypes import c_char_p, c_void_p, c_int64, c_double

# Load library (platform-specific)
libloq = ctypes.CDLL("libloq.so")  # Linux
# libloq = ctypes.CDLL("libloq.dylib")  # macOS
# libloq = ctypes.CDLL("loq.dll")  # Windows

# Function signatures
libloq.loq_query_create.restype = c_void_p
libloq.loq_query_execute.argtypes = [c_void_p, c_char_p]
libloq.loq_query_execute.restype = c_void_p
libloq.loq_recordset_at_end.argtypes = [c_void_p]
libloq.loq_recordset_at_end.restype = bool
libloq.loq_recordset_get_string.argtypes = [c_void_p, c_char_p]
libloq.loq_recordset_get_string.restype = c_char_p
libloq.loq_recordset_get_int.argtypes = [c_void_p, c_char_p]
libloq.loq_recordset_get_int.restype = c_int64
libloq.loq_recordset_move_next.argtypes = [c_void_p]
libloq.loq_free_string.argtypes = [c_char_p]

# Create query
query = libloq.loq_query_create()

# Execute
sql = "SELECT * FROM data.csv WHERE age > 30"
rs = libloq.loq_query_execute(query, sql.encode('utf-8'))

# Iterate results
results = []
while not libloq.loq_recordset_at_end(rs):
    name_ptr = libloq.loq_recordset_get_string(rs, b"name")
    name = ctypes.cast(name_ptr, c_char_p).value.decode('utf-8')

    age = libloq.loq_recordset_get_int(rs, b"age")

    results.append({"name": name, "age": age})

    libloq.loq_free_string(name_ptr)
    libloq.loq_recordset_move_next(rs)

# Cleanup
libloq.loq_recordset_free(rs)
libloq.loq_query_free(query)

for row in results:
    print(f"{row['name']}: {row['age']}")
```

**Python Modern API (JSON transfer):**

```python
import json
import ctypes
from ctypes import c_char_p

libloq = ctypes.CDLL("libloq.so")

# Configure function signature
libloq.loq_execute_json.argtypes = [c_char_p]
libloq.loq_execute_json.restype = c_char_p
libloq.loq_free_string.argtypes = [c_char_p]

# Execute and get JSON
sql = "SELECT * FROM data.csv WHERE age > 30 LIMIT 100"
result_ptr = libloq.loq_execute_json(sql.encode('utf-8'))

# Convert to Python object
result_str = ctypes.cast(result_ptr, c_char_p).value.decode('utf-8')
libloq.loq_free_string(result_ptr)

data = json.loads(result_str)

print(f"Columns: {data['columns']}")
print(f"Row count: {data['row_count']}")

for row in data['rows']:
    print(row)
```

**Go Integration:**

```go
package main

/*
#cgo LDFLAGS: -lloq
#include <stdlib.h>
#include "loq.h"
*/
import "C"
import (
    "encoding/json"
    "fmt"
    "unsafe"
)

type QueryResult struct {
    Columns  []string        `json:"columns"`
    Rows     [][]interface{} `json:"rows"`
    RowCount int             `json:"row_count"`
}

func executeQuery(sql string) (*QueryResult, error) {
    cSQL := C.CString(sql)
    defer C.free(unsafe.Pointer(cSQL))

    resultPtr := C.loq_execute_json(cSQL)
    defer C.loq_free_string(resultPtr)

    resultStr := C.GoString(resultPtr)

    var result QueryResult
    if err := json.Unmarshal([]byte(resultStr), &result); err != nil {
        return nil, err
    }

    return &result, nil
}

func main() {
    result, err := executeQuery("SELECT * FROM data.csv LIMIT 10")
    if err != nil {
        panic(err)
    }

    fmt.Printf("Found %d rows\n", result.RowCount)
    for _, row := range result.Rows {
        fmt.Println(row)
    }
}
```

**Ruby Integration:**

```ruby
require 'ffi'
require 'json'

module Loq
  extend FFI::Library
  ffi_lib 'loq' # or 'libloq.so', 'libloq.dylib', 'loq.dll'

  attach_function :loq_execute_json, [:string], :pointer
  attach_function :loq_free_string, [:pointer], :void
end

def execute_query(sql)
  result_ptr = Loq.loq_execute_json(sql)
  result_str = result_ptr.read_string
  Loq.loq_free_string(result_ptr)

  JSON.parse(result_str)
end

# Usage
result = execute_query("SELECT * FROM data.csv WHERE age > 30")
puts "Columns: #{result['columns']}"
puts "Rows: #{result['row_count']}"

result['rows'].each do |row|
  puts row.inspect
end
```

### 4. Complex Query Development

**Window Functions for Time-Series Analysis:**

```sql
-- Moving average with 5-row window
SELECT
    timestamp,
    value,
    AVG(value) OVER (
        ORDER BY timestamp
        ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
    ) as moving_avg_5,
    AVG(value) OVER (
        ORDER BY timestamp
        ROWS BETWEEN 10 PRECEDING AND CURRENT ROW
    ) as moving_avg_10
FROM metrics.csv

-- Ranking within partitions
SELECT
    category,
    product,
    sales,
    RANK() OVER (PARTITION BY category ORDER BY sales DESC) as rank_in_category,
    ROW_NUMBER() OVER (ORDER BY sales DESC) as overall_rank
FROM sales.csv

-- Lag/Lead for comparing with previous values
SELECT
    timestamp,
    value,
    LAG(value, 1) OVER (ORDER BY timestamp) as prev_value,
    LEAD(value, 1) OVER (ORDER BY timestamp) as next_value,
    value - LAG(value, 1) OVER (ORDER BY timestamp) as delta
FROM metrics.csv
```

**CTEs (Common Table Expressions) for Complex Logic:**

```sql
-- Multi-stage analysis with CTEs
WITH error_logs AS (
    SELECT * FROM app.log WHERE level = 'ERROR'
),
error_summary AS (
    SELECT
        source,
        COUNT(*) as error_count,
        MIN(timestamp) as first_error,
        MAX(timestamp) as last_error
    FROM error_logs
    GROUP BY source
),
high_error_sources AS (
    SELECT * FROM error_summary WHERE error_count > 10
)
SELECT
    s.*,
    e.message
FROM high_error_sources s
JOIN error_logs e ON s.source = e.source
ORDER BY s.error_count DESC, e.timestamp DESC

-- Recursive pattern (if supported)
WITH RECURSIVE date_series AS (
    SELECT DATE('2024-01-01') as date
    UNION ALL
    SELECT DATE_ADD(date, 1, 'DAY')
    FROM date_series
    WHERE date < DATE('2024-01-31')
)
SELECT * FROM date_series
```

**JOINs for Multi-Source Analysis:**

```sql
-- INNER JOIN: Match access logs with user data
SELECT
    a.timestamp,
    a.url,
    a.status,
    a.response_time,
    u.user_name,
    u.department,
    u.role
FROM access.log a
INNER JOIN users.csv u ON a.user_id = u.id
WHERE a.status >= 400
ORDER BY a.timestamp DESC

-- LEFT JOIN: Include all logs even if user not found
SELECT
    a.timestamp,
    a.url,
    a.status,
    COALESCE(u.user_name, 'Unknown') as user_name
FROM access.log a
LEFT JOIN users.csv u ON a.user_id = u.id

-- Multiple JOINs: Combine three sources
SELECT
    o.order_id,
    o.timestamp,
    c.customer_name,
    p.product_name,
    o.quantity,
    o.price
FROM orders.csv o
JOIN customers.csv c ON o.customer_id = c.id
JOIN products.csv p ON o.product_id = p.id
WHERE o.timestamp >= DATE('2024-01-01')
```

**UNION for Multi-Source Aggregation:**

```sql
-- Combine logs from multiple environments
SELECT
    'production' as environment,
    timestamp,
    level,
    message,
    source
FROM prod.log
WHERE level IN ('ERROR', 'CRITICAL')

UNION ALL

SELECT
    'staging' as environment,
    timestamp,
    level,
    message,
    source
FROM staging.log
WHERE level IN ('ERROR', 'CRITICAL')

ORDER BY timestamp DESC
LIMIT 100

-- Aggregate across multiple time periods
(SELECT 'Q1' as quarter, category, SUM(sales) as total
 FROM q1_sales.csv
 GROUP BY category)
UNION ALL
(SELECT 'Q2' as quarter, category, SUM(sales) as total
 FROM q2_sales.csv
 GROUP BY category)
UNION ALL
(SELECT 'Q3' as quarter, category, SUM(sales) as total
 FROM q3_sales.csv
 GROUP BY category)
ORDER BY category, quarter
```

### 5. Input Format Expertise

**Format Selection Guide:**

| Format | Use Case | Key Features |
|--------|----------|--------------|
| CSV | Structured tabular data | Auto header detection, type inference |
| TSV | Tab-separated data | Like CSV but tab delimiters |
| JSON | Application logs, APIs | Nested object flattening, array handling |
| NDJSON | Streaming logs | Line-delimited JSON objects |
| W3C | IIS/W3C extended logs | Field directive parsing, automatic schema |
| IIS | IIS native format | Fixed 15-field schema |
| NCSA | Apache/Nginx logs | Combined log format parsing |
| Syslog | Unix system logs | RFC 3164 and RFC 5424 support |
| EVTX | Windows Event Logs | Cross-platform EVTX parsing |
| XML | Structured documents | Row element extraction, attribute handling |
| TEXTLINE | Custom line format | Regex-based field extraction |
| TEXTWORD | Word-by-word parsing | Position tracking, word boundaries |
| FS | File system queries | Metadata: size, dates, permissions |
| S3 | Cloud object storage | Glob patterns, compression support |
| PCAP | Network captures | Packet analysis, protocol fields |

**W3C Log Format Example:**

```bash
loq -i:W3C "SELECT
    date,
    time,
    cs-method,
    cs-uri-stem,
    sc-status,
    time-taken
FROM u_ex*.log
WHERE sc-status >= 400
ORDER BY time-taken DESC
LIMIT 100"
```

**EVTX (Windows Event Log) Example:**

```bash
loq -i:EVTX "SELECT
    EventID,
    TimeCreated,
    Level,
    Provider,
    Message
FROM Security.evtx
WHERE EventID IN (4624, 4625)
ORDER BY TimeCreated DESC"
```

**S3 with Compression:**

```bash
loq -i:S3 "SELECT *
FROM 's3://my-bucket/logs/2024-01-*/access.log.gz'
WHERE status >= 400"
```

**TEXTLINE with Regex:**

```bash
loq -i:TEXTLINE --iRegex:"^(?P<timestamp>\S+)\s+(?P<level>\S+)\s+(?P<message>.+)$" \
    "SELECT timestamp, level, message
     FROM app.log
     WHERE level = 'ERROR'"
```

### 6. Debugging and Troubleshooting

**Diagnostic Workflow:**

1. **Verify file and format:**
```bash
# Test with LIMIT 1 to see schema
loq -i:CSV "SELECT * FROM file.csv LIMIT 1"

# Check row count
loq "SELECT COUNT(*) FROM file.csv"

# Show as table for readability
loq -o:DATAGRID "SELECT * FROM file.csv LIMIT 5"
```

2. **Check encoding issues:**
```bash
# Try different codepages
loq -iCodepage:UTF-8 "SELECT * FROM file.csv LIMIT 5"
loq -iCodepage:Windows-1252 "SELECT * FROM file.csv LIMIT 5"

# Allow unlimited errors during diagnosis
loq -e:-1 "SELECT * FROM file.csv"
```

3. **Validate column names:**
```bash
# List all columns
loq "SELECT * FROM file.csv LIMIT 0"

# Case-sensitive column check
loq "SELECT \"ColumnName\" FROM file.csv LIMIT 1"
```

4. **Test with statistics:**
```bash
loq --stats:ON "SELECT COUNT(*) FROM large_file.log"
```

**Common Error Patterns:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Column 'X' not found" | Wrong column name | Check with `SELECT * LIMIT 1` |
| "Parse error at line N" | Format mismatch | Verify `-i:FORMAT` option |
| "Encoding error" | Wrong codepage | Try `-iCodepage:Windows-1252` |
| "Type mismatch" | Mixed types in column | Use `CAST()` or type conversion |
| "File not found" | Path issue | Use absolute paths |
| "Out of memory" | Large result set | Add `LIMIT` or filter with `WHERE` |

### 7. Performance Optimization

**Query Optimization Strategies:**

1. **Filter early with WHERE:**
```sql
-- Good: Filter before aggregation
SELECT category, COUNT(*)
FROM large_file.csv
WHERE status = 'active' AND date >= '2024-01-01'
GROUP BY category

-- Bad: Filter after aggregation
SELECT category, count FROM (
    SELECT category, COUNT(*) as count
    FROM large_file.csv
    GROUP BY category
)
WHERE status = 'active'
```

2. **Use LIMIT during development:**
```sql
-- Test with small sample first
SELECT * FROM huge_file.log WHERE level = 'ERROR' LIMIT 10
```

3. **Consider NATIVE format for intermediate results:**
```bash
# Stage 1: Filter and save
loq -o:NATIVE --ofile:filtered.nat \
    "SELECT * FROM large_file.csv WHERE status = 'active'"

# Stage 2: Analyze filtered data
loq -i:NATIVE "SELECT category, COUNT(*)
                FROM filtered.nat
                GROUP BY category"
```

4. **Use appropriate aggregations:**
```sql
-- Good: COUNT(*) is faster
SELECT COUNT(*) FROM file.csv

-- Less efficient: COUNT(column) checks for NULL
SELECT COUNT(column) FROM file.csv
```

## Workflow for Complex Tasks

When handling complex migrations or integrations:

1. **Read REFERENCE.md** to understand capabilities
2. **Load specific documentation** based on task requirements
3. **Analyze existing code/queries** if migrating
4. **Design the solution** incrementally
5. **Test with sample data** to validate
6. **Provide complete, working code** with detailed explanations
7. **Document any caveats** or platform-specific considerations

## Example Tasks

Invoke this agent for tasks like:
- "Migrate this VBScript using Log Parser COM to C# with Loq"
- "Help me integrate loq into my Python data pipeline"
- "Debug why my EVTX query returns no results"
- "Build a complex query with JOINs across IIS logs and user database"
- "Create time-series analysis with window functions for metrics"
- "Optimize this slow query that processes millions of log entries"

Always read documentation from `llm-docs/` before providing solutions.
