# .NET Bindings Reference for LLMs

This document provides a code-focused reference for Loq .NET bindings, designed for LLM consumption and code generation.

## Package Overview

Loq provides three .NET packages:

| Package | Purpose | Use Case |
|---------|---------|----------|
| **Loq.Native** | Low-level P/Invoke bindings | Direct native library access, advanced scenarios |
| **Loq.Classic** | COM-compatible API | Drop-in MS Log Parser 2.2 replacement for legacy code |
| **Loq** | Modern C# API | New applications requiring LINQ, type safety, and C# idioms |

**Installation:**
```bash
dotnet add package Loq.Classic  # For legacy migration
dotnet add package Loq          # For new applications
```

## Loq.Classic API (MS Log Parser Replacement)

Drop-in replacement for Microsoft Log Parser's COM interface. Use for migrating VBScript/VB.NET applications.

### LogQuery Class

Primary class for executing queries.

**Constructor:**
```csharp
using var lp = new LogQuery();
```

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `Execute(string sql)` | `LogRecordSet` | Execute SQL query and return result set |
| `ExecuteBatch(string sql)` | `long` | Execute query, return row count only (no iteration) |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `InputFormat` | `string` | Default input format: "CSV", "JSON", "W3C", "IIS", etc. |

**Example:**
```csharp
using Loq.Classic;

using var lp = new LogQuery
{
    InputFormat = "W3C"
};

// Execute with result set
using var rs = lp.Execute("SELECT * FROM access.log WHERE sc-status >= 500");

// Execute batch (write-only, faster)
long rows = lp.ExecuteBatch("SELECT * FROM data.csv INTO output.json");
```

### LogRecordSet Class

Represents query results with cursor-based iteration.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `AtEnd` | `bool` | True if cursor is past last row |
| `ColumnCount` | `int` | Number of columns |
| `RowCount` | `long` | Total number of rows |

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `GetRecord()` | `LogRecord` | Get current row as LogRecord |
| `MoveNext()` | `void` | Advance cursor to next row |
| `GetColumnName(int index)` | `string` | Get column name by zero-based index |
| `GetColumnType(int index)` | `int` | Get column type constant |
| `GetString(string name)` | `string` | Get string value by column name |
| `GetString(int index)` | `string` | Get string value by column index |
| `GetInt(string name)` | `long` | Get integer value by column name |
| `GetFloat(string name)` | `double` | Get float value by column name |
| `IsNull(string name)` | `bool` | Check if value is NULL by column name |
| `IsNull(int index)` | `bool` | Check if value is NULL by column index |
| `Close()` | `void` | Release resources (or use Dispose pattern) |

**Type Constants:**
```csharp
public const int INTEGER_TYPE = 1;
public const int REAL_TYPE = 2;
public const int STRING_TYPE = 3;
public const int TIMESTAMP_TYPE = 4;
public const int NULL_TYPE = 5;
```

**Iteration Pattern:**
```csharp
using var rs = lp.Execute("SELECT * FROM data.csv");

while (!rs.AtEnd)
{
    var record = rs.GetRecord();
    
    // Process record
    var name = record.GetValue("name");
    var age = record.GetInt("age");
    
    rs.MoveNext();
}

Console.WriteLine($"Processed {rs.RowCount} rows");
```

**Column Metadata:**
```csharp
using var rs = lp.Execute("SELECT * FROM data.csv");

Console.WriteLine($"Columns: {rs.ColumnCount}");
for (int i = 0; i < rs.ColumnCount; i++)
{
    var name = rs.GetColumnName(i);
    var type = rs.GetColumnType(i);
    Console.WriteLine($"{name}: {TypeName(type)}");
}

string TypeName(int type) => type switch
{
    LogRecordSet.INTEGER_TYPE => "INTEGER",
    LogRecordSet.REAL_TYPE => "REAL",
    LogRecordSet.STRING_TYPE => "STRING",
    LogRecordSet.TIMESTAMP_TYPE => "TIMESTAMP",
    LogRecordSet.NULL_TYPE => "NULL",
    _ => "UNKNOWN"
};
```

### LogRecord Class

Represents a single row of data.

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `GetValue(string name)` | `object` | Get value as object by column name |
| `GetValue(int index)` | `object` | Get value as object by column index |
| `GetString(string name)` | `string` | Get value as string by column name |
| `GetString(int index)` | `string` | Get value as string by column index |
| `GetInt(string name)` | `long` | Get value as integer by column name |
| `GetInt(int index)` | `long` | Get value as integer by column index |
| `GetFloat(string name)` | `double` | Get value as float by column name |
| `GetFloat(int index)` | `double` | Get value as float by column index |
| `IsNull(string name)` | `bool` | Check if NULL by column name |
| `IsNull(int index)` | `bool` | Check if NULL by column index |
| `GetColumnType(int index)` | `int` | Get type constant for column |
| `ToNativeString(string delimiter)` | `string` | Format record as delimited string |

**Access Patterns:**
```csharp
var record = rs.GetRecord();

// By name (recommended)
var name = record.GetValue("name");
var age = record.GetInt("age");
var salary = record.GetFloat("salary");

// By index (faster)
var col0 = record.GetValue(0);
var col1 = record.GetInt(1);

// NULL checking
if (!record.IsNull("email"))
{
    var email = record.GetString("email");
}
else
{
    Console.WriteLine("No email provided");
}

// Format as CSV/TSV
string csv = record.ToNativeString(",");    // "John Doe,35,New York"
string tsv = record.ToNativeString("\t");   // "John Doe\t35\tNew York"
```

### Complete Classic API Example

```csharp
using System;
using Loq.Classic;

class WebLogAnalyzer
{
    static void Main()
    {
        using var lp = new LogQuery();
        
        // Analyze IIS logs for errors
        using var rs = lp.Execute(@"
            SELECT 
                date,
                cs-method,
                cs-uri-stem,
                sc-status,
                sc-bytes,
                cs-username
            FROM access.log
            WHERE sc-status >= 500
            ORDER BY date DESC
        ");
        
        Console.WriteLine($"Found {rs.RowCount} server errors");
        Console.WriteLine();
        
        // Print column headers
        for (int i = 0; i < rs.ColumnCount; i++)
        {
            Console.Write($"{rs.GetColumnName(i)}\t");
        }
        Console.WriteLine();
        
        // Iterate results
        while (!rs.AtEnd)
        {
            var rec = rs.GetRecord();
            
            // Access typed values
            var date = rec.GetValue("date");
            var method = rec.GetString("cs-method");
            var uri = rec.GetString("cs-uri-stem");
            var status = rec.GetInt("sc-status");
            var bytes = rec.GetInt("sc-bytes");
            
            // Handle NULL
            var user = rec.IsNull("cs-username") 
                ? "(anonymous)" 
                : rec.GetString("cs-username");
            
            Console.WriteLine($"{date}\t{method}\t{uri}\t{status}\t{bytes}\t{user}");
            
            rs.MoveNext();
        }
    }
}
```

## Loq (Modern) API

Modern C# API with LINQ support, strong typing, and better performance.

### LogEngine Static Class

Entry point for all modern API operations.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `Version` | `string` | Native library version (e.g., "2.2.0") |

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `Query(string sql)` | `IEnumerable<Dictionary<string, object>>` | Execute query, return rows as dictionaries |
| `Query<T>(string sql)` | `IEnumerable<T>` | Execute query, map to typed objects |
| `Execute(string sql)` | `QueryResult` | Execute query, return result with metadata |
| `Count(string sql)` | `long` | Execute query, return row count only (efficient) |
| `GetSchema(string sql)` | `QueryResult` | Get schema without full execution |
| `ToDataTable(string sql)` | `DataTable` | Execute query, return as ADO.NET DataTable |

**Dictionary Results:**
```csharp
using Loq;

var rows = LogEngine.Query("SELECT * FROM data.csv WHERE age > 30");

foreach (var row in rows)
{
    Console.WriteLine($"Name: {row["name"]}, Age: {row["age"]}, City: {row["city"]}");
}
```

**Strongly-Typed Results:**
```csharp
using Loq;

public record Person(string Name, int Age, string City);

var people = LogEngine.Query<Person>(
    "SELECT name, age, city FROM data.csv WHERE age > 30"
);

foreach (var person in people)
{
    Console.WriteLine($"{person.Name} ({person.Age}) from {person.City}");
}
```

**Full Result with Metadata:**
```csharp
using Loq;

var result = LogEngine.Execute("SELECT * FROM data.csv");

Console.WriteLine($"Query returned {result.RowCount} rows");
Console.WriteLine($"Columns: {string.Join(", ", result.Columns.Select(c => c.Name))}");

// Access raw rows
foreach (var row in result.Rows)
{
    Console.WriteLine($"{row["name"]}: {row["age"]}");
}

// Map to types later
var people = result.As<Person>().ToList();
```

**Efficient Counting:**
```csharp
using Loq;

// Don't load all rows, just count
long activeUsers = LogEngine.Count(
    "SELECT * FROM users.csv WHERE status = 'active'"
);

long totalUsers = LogEngine.Count("SELECT * FROM users.csv");

double percentage = (double)activeUsers / totalUsers * 100;
Console.WriteLine($"{activeUsers}/{totalUsers} users active ({percentage:F1}%)");
```

**Schema Inspection:**
```csharp
using Loq;

// Get schema without executing full query
var schema = LogEngine.GetSchema("SELECT * FROM data.csv");

Console.WriteLine($"Schema has {schema.Columns.Count} columns:");
foreach (var col in schema.Columns)
{
    Console.WriteLine($"  {col.Name}: {col.Type} ({col.ClrType.Name})");
}

// Validate before expensive queries
if (schema.Columns.Any(c => c.Name == "timestamp"))
{
    var sorted = LogEngine.Execute("SELECT * FROM data.csv ORDER BY timestamp");
}
else
{
    Console.WriteLine("No timestamp column found");
}
```

**DataTable Integration:**
```csharp
using Loq;
using System.Data;

// Convert to DataTable for data binding
DataTable table = LogEngine.ToDataTable("SELECT * FROM data.csv");

// Bind to UI controls
dataGridView.DataSource = table;

// Use with ADO.NET
foreach (DataRow row in table.Rows)
{
    Console.WriteLine($"{row["name"]}: {row["age"]}");
}
```

### QueryResult Class

Encapsulates query results with metadata.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `Columns` | `List<ColumnInfo>` | Column definitions (name, type, CLR type) |
| `Rows` | `List<Dictionary<string, object>>` | Row data as dictionaries |
| `RowCount` | `long` | Total number of rows |

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `As<T>()` | `IEnumerable<T>` | Map rows to typed objects |
| `ToDataTable()` | `DataTable` | Convert to ADO.NET DataTable |
| `Scalar<T>()` | `T` | Get first value of first row (throw if empty) |
| `ScalarOrDefault<T>(T defaultValue)` | `T` | Get first value of first row or default |

**Complete Example:**
```csharp
using Loq;

var result = LogEngine.Execute("SELECT name, age, city FROM data.csv WHERE age > 30");

// Metadata
Console.WriteLine($"Rows: {result.RowCount}");
Console.WriteLine($"Columns: {result.Columns.Count}");

foreach (var col in result.Columns)
{
    Console.WriteLine($"  {col.Name}: {col.Type} ({col.ClrType.Name})");
}

// Raw dictionary access
foreach (var row in result.Rows)
{
    Console.WriteLine($"{row["name"]}: {row["age"]} years old from {row["city"]}");
}

// Map to types
public record Person(string Name, int Age, string City);
var people = result.As<Person>().ToList();

// Convert to DataTable
DataTable table = result.ToDataTable();
```

**Scalar Values:**
```csharp
using Loq;

// Get single value
var result = LogEngine.Execute("SELECT COUNT(*) FROM data.csv");
long count = result.Scalar<long>();
Console.WriteLine($"Total rows: {count}");

// With default if empty
var result2 = LogEngine.Execute("SELECT MAX(age) FROM data.csv WHERE name = 'Nobody'");
long maxAge = result2.ScalarOrDefault(0L);
Console.WriteLine($"Max age: {maxAge}");
```

### ColumnInfo Class

Metadata about a single column.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `Name` | `string` | Column name (as appears in SELECT clause) |
| `Type` | `string` | Type name: "INTEGER", "REAL", "STRING", "TIMESTAMP", "NULL" |
| `ClrType` | `Type` | Corresponding .NET CLR type (typeof(long), typeof(double), etc.) |

**Example:**
```csharp
using Loq;

var schema = LogEngine.GetSchema("SELECT * FROM data.csv");

foreach (var col in schema.Columns)
{
    Console.WriteLine($"Column: {col.Name}");
    Console.WriteLine($"  Type: {col.Type}");
    Console.WriteLine($"  CLR Type: {col.ClrType.Name}");
    Console.WriteLine($"  Nullable: {Nullable.GetUnderlyingType(col.ClrType) != null}");
    Console.WriteLine();
}
```

### Complete Modern API Example

```csharp
using System;
using System.Linq;
using Loq;

class WebLogAnalyzer
{
    record LogEntry(
        DateTime Date,
        string CsMethod,
        string CsUriStem,
        int ScStatus,
        long ScBytes,
        string? CsUsername
    );
    
    static void Main()
    {
        Console.WriteLine($"Loq version: {LogEngine.Version}");
        
        // Strongly-typed query execution
        var errors = LogEngine.Query<LogEntry>(@"
            SELECT 
                date,
                [cs-method] AS CsMethod,
                [cs-uri-stem] AS CsUriStem,
                [sc-status] AS ScStatus,
                [sc-bytes] AS ScBytes,
                [cs-username] AS CsUsername
            FROM access.log
            WHERE [sc-status] >= 500
            ORDER BY date DESC
        ");
        
        Console.WriteLine("Server Errors:");
        foreach (var entry in errors)
        {
            var user = entry.CsUsername ?? "(anonymous)";
            Console.WriteLine(
                $"{entry.Date:yyyy-MM-dd HH:mm:ss} | " +
                $"{entry.CsMethod} {entry.CsUriStem} | " +
                $"Status: {entry.ScStatus} | " +
                $"Bytes: {entry.ScBytes:N0} | " +
                $"User: {user}"
            );
        }
        
        // Efficient counting
        long errorCount = LogEngine.Count(
            "SELECT * FROM access.log WHERE [sc-status] >= 500"
        );
        long totalRequests = LogEngine.Count("SELECT * FROM access.log");
        
        Console.WriteLine();
        Console.WriteLine($"Error rate: {errorCount}/{totalRequests} " +
                         $"({errorCount * 100.0 / totalRequests:F2}%)");
        
        // Aggregation query
        var statusCounts = LogEngine.Query(@"
            SELECT 
                [sc-status] AS Status,
                COUNT(*) AS Count
            FROM access.log
            GROUP BY [sc-status]
            ORDER BY Count DESC
        ");
        
        Console.WriteLine();
        Console.WriteLine("Top Status Codes:");
        foreach (var row in statusCounts.Take(5))
        {
            Console.WriteLine($"  {row["Status"]}: {row["Count"]}");
        }
    }
}
```

## Cross-Platform Deployment

Loq requires platform-specific native libraries.

### Project Structure

Use .NET's RID-specific runtime assets convention:

```
YourApp/
├── YourApp.csproj
├── Program.cs
└── runtimes/
    ├── win-x64/native/loq.dll
    ├── linux-x64/native/libloq.so
    ├── osx-x64/native/libloq.dylib
    └── osx-arm64/native/libloq.dylib
```

### .csproj Configuration

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <RuntimeIdentifiers>win-x64;linux-x64;osx-x64;osx-arm64</RuntimeIdentifiers>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Loq.Classic" Version="2.2.0" />
    <PackageReference Include="Loq" Version="2.2.0" />
  </ItemGroup>

  <!-- Include native libraries for all platforms -->
  <ItemGroup>
    <Content Include="runtimes\win-x64\native\loq.dll">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>runtimes\win-x64\native\loq.dll</Link>
    </Content>
    <Content Include="runtimes\linux-x64\native\libloq.so">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>runtimes\linux-x64\native\libloq.so</Link>
    </Content>
    <Content Include="runtimes\osx-x64\native\libloq.dylib">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>runtimes\osx-x64\native\libloq.dylib</Link>
    </Content>
    <Content Include="runtimes\osx-arm64\native\libloq.dylib">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>runtimes\osx-arm64\native\libloq.dylib</Link>
    </Content>
  </ItemGroup>

</Project>
```

### Publishing Commands

**Self-Contained (includes .NET runtime):**
```bash
# Windows
dotnet publish -c Release -r win-x64 --self-contained

# Linux
dotnet publish -c Release -r linux-x64 --self-contained

# macOS Intel
dotnet publish -c Release -r osx-x64 --self-contained

# macOS Apple Silicon
dotnet publish -c Release -r osx-arm64 --self-contained
```

**Framework-Dependent (requires .NET runtime installed):**
```bash
dotnet publish -c Release
```

**Single-File Executable (Windows/Linux only):**
```bash
# Windows
dotnet publish -c Release -r win-x64 --self-contained -p:PublishSingleFile=true

# Linux
dotnet publish -c Release -r linux-x64 --self-contained -p:PublishSingleFile=true
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/dotnet/runtime:8.0

WORKDIR /app
COPY publish/ .

ENTRYPOINT ["dotnet", "YourApp.dll"]
```

**Build and run:**
```bash
dotnet publish -c Release -r linux-x64 -o ./publish
docker build -t yourapp .
docker run -v $(pwd)/data:/data yourapp
```

### Platform Detection

.NET automatically resolves the correct library:

```csharp
// P/Invoke declaration (no extension needed)
[DllImport("loq", CallingConvention = CallingConvention.Cdecl)]
public static extern IntPtr loq_query_execute(string sql);
```

Runtime resolution:
- Windows: `loq.dll`
- Linux: `libloq.so`
- macOS: `libloq.dylib`

## Migration from MS Log Parser

### VBScript to C#

**Before (VBScript):**
```vbscript
Set lp = CreateObject("MSUtil.LogQuery")
Set rs = lp.Execute("SELECT * FROM data.csv WHERE age > 30")

Do While Not rs.atEnd
    Set rec = rs.getRecord()
    WScript.Echo rec.getValue("name") & ": " & rec.getValue("age")
    rs.moveNext
Loop

rs.close
```

**After (C# Classic API):**
```csharp
using Loq.Classic;

using var lp = new LogQuery();
using var rs = lp.Execute("SELECT * FROM data.csv WHERE age > 30");

while (!rs.AtEnd)
{
    var rec = rs.GetRecord();
    Console.WriteLine($"{rec.GetValue("name")}: {rec.GetInt("age")}");
    rs.MoveNext();
}
// Dispose handles Close()
```

**After (C# Modern API):**
```csharp
using Loq;

var rows = LogEngine.Query("SELECT * FROM data.csv WHERE age > 30");

foreach (var row in rows)
{
    Console.WriteLine($"{row["name"]}: {row["age"]}");
}
```

### VB.NET to C# (Classic API)

**Before (VB.NET with MS Log Parser):**
```vb
Imports MSUtil

Module LogAnalyzer
    Sub Main()
        Dim lp As New LogQuery()
        Dim rs As ILogRecordset
        
        rs = lp.Execute("SELECT * FROM C:\logs\access.log WHERE sc-status >= 500")
        
        Do While Not rs.atEnd
            Dim rec As ILogRecord = rs.getRecord()
            
            Dim timestamp As Object = rec.getValue("date")
            Dim status As Integer = CInt(rec.getValue("sc-status"))
            Dim uri As String = rec.getValue("cs-uri-stem").ToString()
            
            If Not rec.getValue("cs-username") Is Nothing Then
                Console.WriteLine($"User: {rec.getValue("cs-username")}")
            End If
            
            Console.WriteLine($"{timestamp} - {status} - {uri}")
            
            rs.moveNext()
        Loop
        
        Console.WriteLine($"Total errors: {rs.getRowCount()}")
        rs.close()
    End Sub
End Module
```

**After (C# with Loq.Classic):**
```csharp
using Loq.Classic;

class LogAnalyzer
{
    static void Main()
    {
        using var lp = new LogQuery();
        using var rs = lp.Execute(
            "SELECT * FROM /var/log/access.log WHERE [sc-status] >= 500"
        );
        
        while (!rs.AtEnd)
        {
            var rec = rs.GetRecord();
            
            var timestamp = rec.GetValue("date");
            var status = rec.GetInt("sc-status");
            var uri = rec.GetString("cs-uri-stem");
            
            if (!rec.IsNull("cs-username"))
            {
                Console.WriteLine($"User: {rec.GetString("cs-username")}");
            }
            
            Console.WriteLine($"{timestamp} - {status} - {uri}");
            
            rs.MoveNext();
        }
        
        Console.WriteLine($"Total errors: {rs.RowCount}");
    }
}
```

### VB.NET to C# (Modern API)

**After (C# with Loq Modern API):**
```csharp
using Loq;

class LogAnalyzer
{
    record LogEntry(
        DateTime Date,
        int ScStatus,
        string CsUriStem,
        string? CsUsername
    );
    
    static void Main()
    {
        var errors = LogEngine.Query<LogEntry>(
            "SELECT date, [sc-status] AS ScStatus, " +
            "[cs-uri-stem] AS CsUriStem, [cs-username] AS CsUsername " +
            "FROM /var/log/access.log " +
            "WHERE [sc-status] >= 500"
        );
        
        foreach (var entry in errors)
        {
            if (entry.CsUsername != null)
            {
                Console.WriteLine($"User: {entry.CsUsername}");
            }
            
            Console.WriteLine($"{entry.Date} - {entry.ScStatus} - {entry.CsUriStem}");
        }
        
        var count = LogEngine.Count(
            "SELECT * FROM /var/log/access.log WHERE [sc-status] >= 500"
        );
        Console.WriteLine($"Total errors: {count}");
    }
}
```

### Migration Benefits

**Cross-Platform:**
- Run on Windows, Linux, macOS, and containers
- No platform-specific code or COM dependencies

**Performance:**
- 2-5x faster than MS Log Parser
- Optimized Rust core with zero-copy parsing

**Modern C# Features:**
- LINQ integration
- Strong typing with records
- Nullable reference types
- Pattern matching

**Memory Safety:**
- Automatic resource management with `using`
- No manual COM reference counting
- Rust memory safety guarantees

**Active Development:**
- Regular updates and new features
- Modern SQL support (window functions, CTEs, JOINs)
- Community-driven improvements

## Type Mapping

### Modern API Automatic Type Mapping

The modern API automatically maps SQL types to C# types:

| SQL Type | C# Type | Nullable C# Type |
|----------|---------|------------------|
| INTEGER | `long` | `long?` |
| REAL | `double` | `double?` |
| STRING | `string` | `string?` |
| TIMESTAMP | `DateTime` | `DateTime?` |
| NULL | `object` | `object?` |

**Mapping Examples:**
```csharp
using Loq;

// Simple types
var names = LogEngine.Query<string>("SELECT name FROM users.csv");

// Value tuples
var pairs = LogEngine.Query<(string Name, int Age)>(
    "SELECT name, age FROM users.csv"
);

// Records (recommended)
record User(string Name, int Age, string? Email);
var users = LogEngine.Query<User>("SELECT name, age, email FROM users.csv");

// Classes
class UserClass
{
    public string Name { get; set; }
    public int Age { get; set; }
    public string? City { get; set; }
}
var userList = LogEngine.Query<UserClass>("SELECT name, age, city FROM users.csv");
```

**Column Name Mapping:**
- Case-insensitive matching
- Hyphens converted to PascalCase: `sc-status` → `ScStatus`
- Use `AS` aliases for exact control: `SELECT [sc-status] AS StatusCode`

## Error Handling

```csharp
using System;
using Loq;
using Loq.Classic;

// Modern API
try
{
    var result = LogEngine.Execute("SELECT * FROM missing.csv");
}
catch (FileNotFoundException ex)
{
    Console.WriteLine($"File not found: {ex.Message}");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Query error: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"Unexpected error: {ex.Message}");
}

// Classic API
try
{
    using var lp = new LogQuery();
    using var rs = lp.Execute("INVALID SQL SYNTAX");
}
catch (Exception ex)
{
    Console.WriteLine($"Parse error: {ex.Message}");
}
```

## Performance Tips

**1. Use `Count()` for counting:**
```csharp
// Fast - only counts
long count = LogEngine.Count("SELECT * FROM large.csv WHERE condition");

// Slow - loads all rows
var rows = LogEngine.Query("SELECT * FROM large.csv WHERE condition");
long count = rows.Count();
```

**2. Limit result sets:**
```csharp
// Efficient
var top100 = LogEngine.Query("SELECT TOP 100 * FROM large.csv");

// Inefficient
var all = LogEngine.Query("SELECT * FROM large.csv").Take(100);
```

**3. Project only needed columns:**
```csharp
// Fast - only parses one column
var names = LogEngine.Query<string>("SELECT name FROM users.csv");

// Slow - parses all columns
var all = LogEngine.Query("SELECT * FROM users.csv");
var names = all.Select(r => r["name"]);
```

**4. Use `ExecuteBatch` for write-only operations:**
```csharp
using var lp = new LogQuery();

// Fast - no result iteration
long rows = lp.ExecuteBatch("SELECT * INTO output.csv FROM input.csv");

// Slow - loads all rows
using var rs = lp.Execute("SELECT * INTO output.csv FROM input.csv");
```

**5. Schema inspection before expensive queries:**
```csharp
var schema = LogEngine.GetSchema("SELECT * FROM data.csv");

if (schema.Columns.Any(c => c.Name == "timestamp"))
{
    // Safe to use timestamp column
    var sorted = LogEngine.Execute("SELECT * FROM data.csv ORDER BY timestamp");
}
else
{
    Console.WriteLine("Warning: No timestamp column found");
}
```

## Advanced Examples

### Web Log Analysis

```csharp
using System;
using System.Linq;
using Loq;

record LogEntry(
    DateTime Date,
    string Method,
    string Uri,
    int Status,
    long Bytes
);

// Top 10 largest requests
var largest = LogEngine.Query<LogEntry>(
    @"SELECT TOP 10 
        date, 
        [cs-method] AS Method, 
        [cs-uri-stem] AS Uri,
        [sc-status] AS Status, 
        [sc-bytes] AS Bytes
      FROM access.log 
      WHERE [sc-status] = 200 
      ORDER BY [sc-bytes] DESC"
);

foreach (var entry in largest)
{
    Console.WriteLine(
        $"{entry.Date:yyyy-MM-dd} {entry.Method} {entry.Uri} - {entry.Bytes:N0} bytes"
    );
}

// Error rate by hour
var errorRate = LogEngine.Query(
    @"SELECT 
        EXTRACT(hour FROM date) AS Hour,
        COUNT(*) AS Total,
        SUM(CASE WHEN [sc-status] >= 400 THEN 1 ELSE 0 END) AS Errors
      FROM access.log 
      GROUP BY EXTRACT(hour FROM date)
      ORDER BY Hour"
);

foreach (var row in errorRate)
{
    double rate = (long)row["Errors"] * 100.0 / (long)row["Total"];
    Console.WriteLine($"Hour {row["Hour"]}: {rate:F2}% error rate");
}
```

### CSV Data Processing

```csharp
using System.Data;
using Loq;

// Load and transform
var transformed = LogEngine.Query(
    @"SELECT 
        UPPER(name) AS Name,
        age,
        CASE 
            WHEN age < 18 THEN 'Minor'
            WHEN age < 65 THEN 'Adult'
            ELSE 'Senior'
        END AS Category
      FROM users.csv
      WHERE status = 'active'
      ORDER BY age DESC"
);

foreach (var row in transformed)
{
    Console.WriteLine($"{row["Name"]} ({row["age"]}) - {row["Category"]}");
}

// Export to DataTable for UI binding
DataTable table = LogEngine.ToDataTable(
    "SELECT * FROM users.csv WHERE status = 'active'"
);

dataGridView.DataSource = table;

// Quick statistics
long totalUsers = LogEngine.Count("SELECT * FROM users.csv");
long activeUsers = LogEngine.Count("SELECT * FROM users.csv WHERE status = 'active'");

Console.WriteLine(
    $"{activeUsers}/{totalUsers} users active " +
    $"({activeUsers * 100.0 / totalUsers:F1}%)"
);
```

### Database Export

```csharp
using Loq.Classic;

using var lp = new LogQuery();

// CSV to SQLite
long rows = lp.ExecuteBatch("SELECT * INTO output.db FROM users.csv");
Console.WriteLine($"Exported {rows} rows to SQLite");

// Complex transformation
lp.ExecuteBatch(
    @"SELECT 
        city,
        COUNT(*) AS UserCount,
        AVG(age) AS AvgAge,
        MAX(created_date) AS LastCreated
      INTO city_stats.json
      FROM users.csv
      GROUP BY city
      HAVING UserCount > 10
      ORDER BY UserCount DESC"
);
```

### Real-Time Monitoring

```csharp
using System;
using System.Linq;
using System.Threading;
using Loq;

while (true)
{
    var errors = LogEngine.Query(
        @"SELECT TOP 10 * 
          FROM app.log 
          WHERE level = 'ERROR' 
          ORDER BY timestamp DESC"
    );
    
    foreach (var error in errors)
    {
        Console.WriteLine($"[ERROR] {error["timestamp"]}: {error["message"]}");
    }
    
    Thread.Sleep(5000); // Check every 5 seconds
}
```

## Summary

**Use Loq.Classic when:**
- Migrating from MS Log Parser COM
- Maintaining legacy VBScript/VB.NET applications
- Need exact API compatibility

**Use Loq (Modern) when:**
- Building new applications
- Want strong typing and LINQ
- Need better performance
- Prefer modern C# idioms

**Key Differences:**
| Feature | Loq.Classic | Loq (Modern) |
|---------|-------------|--------------|
| API Style | COM-like, cursor-based | LINQ-friendly, IEnumerable |
| Type Safety | Runtime, manual casting | Compile-time with generics |
| Performance | Good | Better (optimized) |
| Error Handling | Exception-based | Exception-based |
| DataTable Support | Manual conversion | Built-in `ToDataTable()` |
| Schema Inspection | Manual iteration | `GetSchema()` method |
| Counting | Load all rows | Optimized `Count()` method |

Both APIs share the same native library and support all Loq features (SQL, formats, cross-platform).
