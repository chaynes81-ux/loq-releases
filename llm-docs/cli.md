# CLI Options Reference for LLMs

This document provides a practical reference for generating correct `loq` CLI commands. It focuses on syntax, common patterns, and avoiding errors.

## Basic Syntax

```bash
loq [OPTIONS] "SQL_QUERY"
loq [OPTIONS] file:query.sql
```

**Key points:**
- SQL query is always the last positional argument
- Options use `-option:value` syntax (Log Parser 2.2 compatible)
- Long options can use `--option:value` or `--option value`
- Query can be inline or loaded from file with `file:path.sql`

## Quick Examples

```bash
# Basic query (CSV input, CSV output to stdout)
loq "SELECT * FROM data.csv"

# Specify input format
loq -i:JSON "SELECT * FROM data.json"

# Specify output format
loq -o:DATAGRID "SELECT * FROM data.csv"

# Output to file
loq -o:JSON --ofile:output.json "SELECT * FROM data.csv"

# Filter and sort
loq "SELECT * FROM logs.csv WHERE status = 500 ORDER BY timestamp DESC"

# Aggregate with GROUP BY
loq "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"

# TOP N queries (Log Parser 2.2 compatible)
loq "SELECT TOP 10 * FROM data.csv ORDER BY value DESC"

# TOP N PERCENT queries
loq "SELECT TOP 25 PERCENT * FROM data.csv ORDER BY score DESC"

# INTO clause for output routing
loq "SELECT * INTO output.json FROM data.csv"

# Multiple files with wildcards
loq "SELECT * FROM 'logs/*.csv'"

# Quiet mode with statistics
loq -q:ON --stats:ON "SELECT COUNT(*) FROM data.csv"
```

## Input Options

### -i:FORMAT
Specify input format (default: CSV).

```bash
loq -i:CSV "SELECT * FROM data.csv"
loq -i:JSON "SELECT * FROM data.json"
loq -i:W3C "SELECT * FROM access.log"
loq -i:EVTX "SELECT * FROM System.evtx"
loq -i:FS "SELECT Name, Size FROM '/var/log'"
loq -i:S3 "SELECT * FROM 's3://bucket/key.csv'"
```

**Available formats:**
- CSV, TSV - Delimited text
- FIXEDWIDTH - Fixed-width text (requires `--iFieldDef`)
- JSON, NDJSON - JSON array or newline-delimited
- XML - XML documents
- W3C, IISW3C - IIS W3C extended logs
- IIS, IISNATIVE - IIS native log format
- BIN, IISBIN - IIS binary logs (.ibl)
- HTTPERR - HTTP.sys error logs
- URLSCAN - URLScan security logs
- NCSA, APACHE, NGINX - NCSA/Apache/Nginx logs
- TEXTLINE, TEXT - Line-by-line text
- TEXTWORD, WORD - Word-by-word parsing
- SYSLOG - Syslog RFC 3164/5424
- FS, FILESYSTEM - File/directory metadata
- EVTX, EVT - Windows Event Logs (cross-platform)
- REG, REGISTRY - Windows Registry .reg files (cross-platform)
- PCAP, NETMON, CAP - Network capture files (cross-platform)
- ETW - Event Tracing for Windows (Windows only)
- ADS - Active Directory (Windows only)
- S3 - Amazon S3 object storage
- PARQUET - Apache Parquet columnar format
- NAT, NATIVE - Native binary format

### -headerRow:ON|OFF
Control whether first row contains headers (default: ON).

```bash
# First row has headers (default)
loq "SELECT name, age FROM data.csv"

# First row is data, generates Field1, Field2, etc.
loq -headerRow:OFF "SELECT Field1, Field2 FROM data.csv"
```

### --iFieldDef "field:range,..."
Field definitions for FIXEDWIDTH format.

```bash
# Define fixed-width fields with byte ranges (0-indexed)
loq -i:FIXEDWIDTH --iFieldDef "name:0-9,age:10-13,city:14-" \
    "SELECT * FROM data.txt"
```

**Format:** `field_name:start-end` where:
- `start` is inclusive (0-indexed)
- `end` is exclusive (or omit for rest of line)
- Multiple fields separated by commas

### -iCodepage:ENCODING
Input character encoding (default: UTF-8).

```bash
loq -iCodepage:UTF-8 "SELECT * FROM data.csv"
loq -iCodepage:UTF-16 "SELECT * FROM windows_export.csv"
loq -iCodepage:UTF-16LE "SELECT * FROM unicode.csv"
loq -iCodepage:Windows-1252 "SELECT * FROM legacy.csv"
loq -iCodepage:Latin1 "SELECT * FROM european.csv"
loq -iCodepage:1252 "SELECT * FROM data.csv"  # Numeric code page
```

**Supported encodings:**
- UTF-8, UTF8, 65001 (default)
- UTF-16LE, UTF-16, UTF16LE, 1200
- UTF-16BE, UTF16BE, 1201
- Windows-1252, CP1252, 1252
- ISO-8859-1, Latin1, 28591

### -recurse:N
Recursive directory traversal depth.

```bash
loq -recurse:1 "SELECT * FROM 'logs/*.log'"     # 1 level deep
loq -recurse:3 "SELECT * FROM 'logs/*.log'"     # 3 levels deep
loq -recurse:-1 "SELECT * FROM 'logs/*.log'"    # Unlimited depth
```

### -iw:ON|OFF
Input wildcard mode (default: OFF).

```bash
loq -iw:ON "SELECT * FROM 'logs/*.csv'"
loq -iw:ON -recurse:-1 "SELECT * FROM 'logs/**/*.log'"
```

### -e:N
Maximum parse errors before abort (default: 10).

```bash
loq -e:10 "SELECT * FROM data.csv"    # Stop after 10 errors (default)
loq -e:100 "SELECT * FROM data.csv"   # Allow up to 100 errors
loq -e:-1 "SELECT * FROM data.csv"    # Unlimited errors (never abort)
```

**Use cases:**
- `-e:10` (default) - Fail fast on bad data
- `-e:100` - Continue through moderately messy data
- `-e:-1` - Process all rows regardless of errors (best-effort)

### --iCheckpoint:PATH
Resume from checkpoint file (for resumable processing).

```bash
loq --iCheckpoint:progress.chk "SELECT * FROM large_file.csv"
```

## Output Options

### -o:FORMAT
Specify output format (default: CSV).

```bash
loq -o:CSV "SELECT * FROM data.csv"        # CSV to stdout
loq -o:JSON "SELECT * FROM data.csv"       # JSON to stdout
loq -o:DATAGRID "SELECT * FROM data.csv"   # ASCII table to stdout
loq -o:SQLITE --ofile:db.db "SELECT * FROM data.csv"  # SQLite database
loq -o:CHART --ofile:chart.png "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"
```

**Available formats:**
- CSV, TSV - Delimited text
- JSON, NDJSON - JSON objects (NDJSON by default)
- XML - XML with configurable style
- W3C, IISW3C - W3C extended log format
- IIS, IISNATIVE - IIS native log format
- DATAGRID, TABLE, GRID - ASCII table
- SQLITE, SQL - SQLite database (requires `--ofile`)
- CHART - PNG/SVG charts (requires `--ofile`)
- NAT, NATIVE - Native binary format
- PARQUET - Apache Parquet columnar format
- CLOUDWATCH, CW - AWS CloudWatch Logs
- TEMPLATE, TPL - Custom template (requires `--tpl`)
- NULL - Discard output (useful for benchmarking)

### --ofile:PATH
Output file path (required for SQLITE, CHART; optional for others).

```bash
loq -o:CSV --ofile:output.csv "SELECT * FROM data.csv"
loq -o:JSON --ofile:output.json "SELECT * FROM data.csv"
loq -o:SQLITE --ofile:database.db "SELECT * FROM data.csv"
loq -o:CHART --ofile:chart.png "SELECT category, COUNT(*) FROM data.csv GROUP BY category"
```

### --otable:NAME
Database table name (for SQLITE output, default: results).

```bash
loq -o:SQLITE --ofile:db.db --otable:users "SELECT * FROM users.csv"
loq -o:SQLITE --ofile:db.db --otable:orders "SELECT * FROM orders.csv"
```

### -oCodepage:ENCODING
Output character encoding (default: UTF-8).

```bash
loq -oCodepage:UTF-8 --ofile:output.csv "SELECT * FROM data.csv"
loq -oCodepage:UTF-16LE --ofile:excel.csv "SELECT * FROM data.csv"
loq -oCodepage:Windows-1252 --ofile:legacy.csv "SELECT * FROM data.csv"
```

### -oSeparator:SEP
Custom output field separator (for CSV/TSV).

```bash
loq -o:CSV -oSeparator:"|" "SELECT * FROM data.csv"
loq -o:CSV -oSeparator:";" "SELECT * FROM data.csv"
loq -o:TSV -oSeparator:"," "SELECT * FROM data.csv"  # Make TSV output CSV
```

### -headers:ON|OFF
Include header row in output (default: ON).

```bash
loq -o:CSV "SELECT * FROM data.csv"                # With headers
loq -o:CSV -headers:OFF "SELECT * FROM data.csv"   # Without headers
```

### --oCheckpoint:PATH
Save checkpoint on completion or interruption.

```bash
loq --oCheckpoint:progress.chk "SELECT * FROM large_file.csv"
```

## Query Options

### file:PATH
Load SQL query from file instead of command line.

```bash
# Create query file
echo "SELECT * FROM data.csv WHERE status = 'active'" > query.sql

# Execute
loq file:query.sql

# With options
loq -i:CSV -o:JSON file:complex_query.sql
```

### -q:ON|OFF
Quiet mode - suppress informational messages (default: OFF).

```bash
loq -q:ON "SELECT * FROM data.csv"
loq -q:ON -o:CSV "SELECT * FROM data.csv" > output.csv  # No stderr noise
```

### --stats:ON|OFF
Show execution statistics (default: OFF).

```bash
loq --stats:ON "SELECT * FROM data.csv"
```

**Output includes:**
- Rows scanned
- Rows returned
- Execution time
- Memory usage

### -f / --follow
Follow mode - continuously monitor files for changes (like `tail -f`).

```bash
loq --follow "SELECT * FROM '/var/log/app.log' WHERE level = 'ERROR'"
loq -f "SELECT * FROM access.log WHERE status >= 500"
```

Press Ctrl+C to stop.

## Chart Options

### -chartType:TYPE
Chart type for CHART output (default: Bar).

```bash
loq -o:CHART -chartType:Bar --ofile:chart.png \
    "SELECT status, COUNT(*) FROM data.csv GROUP BY status"

loq -o:CHART -chartType:Line --ofile:trend.png \
    "SELECT date, value FROM metrics.csv ORDER BY date"

loq -o:CHART -chartType:Pie --ofile:distribution.png \
    "SELECT category, SUM(amount) FROM sales.csv GROUP BY category"
```

**Types:** Bar, Line, Pie

### -chartTitle:TITLE
Chart title.

```bash
loq -o:CHART -chartType:Bar -chartTitle:"HTTP Status Codes" --ofile:chart.png \
    "SELECT status, COUNT(*) FROM access.log GROUP BY status"
```

## Template Options

### --tpl:PATH
Template file path for TEMPLATE output format.

```bash
loq -o:TEMPLATE --tpl:report.txt "SELECT * FROM data.csv"
```

## Advanced Options

### -multiSite:ON|OFF
Multi-threaded processing mode (default: OFF).

```bash
loq -multiSite:ON "SELECT * FROM 'logs/*.csv'"
```

## Common Patterns

### Basic Queries

```bash
# Select all rows
loq "SELECT * FROM data.csv"

# Select specific columns
loq "SELECT name, age, city FROM users.csv"

# Filter rows
loq "SELECT * FROM logs.csv WHERE status = 500"
loq "SELECT * FROM users.csv WHERE age > 30 AND status = 'active'"

# Sort results
loq "SELECT * FROM data.csv ORDER BY timestamp DESC"
loq "SELECT * FROM users.csv ORDER BY last_name, first_name"

# Limit results
loq "SELECT * FROM data.csv LIMIT 100"
loq "SELECT TOP 10 * FROM data.csv ORDER BY score DESC"
loq "SELECT TOP 25 PERCENT * FROM data.csv ORDER BY value DESC"
```

### Aggregations

```bash
# Count rows
loq "SELECT COUNT(*) FROM data.csv"
loq "SELECT COUNT(*) FROM logs.csv WHERE status = 500"

# Group by with aggregates
loq "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"
loq "SELECT category, SUM(amount), AVG(amount) FROM sales.csv GROUP BY category"

# Having clause
loq "SELECT status, COUNT(*) as cnt FROM logs.csv GROUP BY status HAVING cnt > 100"

# Multiple group by columns
loq "SELECT date, status, COUNT(*) FROM logs.csv GROUP BY date, status"
```

### JOINs

```bash
# Inner join
loq "SELECT u.name, o.total FROM users.csv u JOIN orders.csv o ON u.id = o.user_id"

# Left join with COALESCE
loq "SELECT u.name, COALESCE(o.total, 0) as total 
     FROM users.csv u 
     LEFT JOIN orders.csv o ON u.id = o.user_id"

# Multiple joins
loq "SELECT u.name, o.order_id, p.product_name 
     FROM users.csv u 
     JOIN orders.csv o ON u.id = o.user_id 
     JOIN products.csv p ON o.product_id = p.id"
```

### Window Functions

```bash
# Ranking
loq "SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as rank 
     FROM employees.csv"

# Partitioned ranking
loq "SELECT name, dept, salary, 
            ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as dept_rank 
     FROM employees.csv"

# Moving average
loq "SELECT date, value, 
            AVG(value) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg 
     FROM metrics.csv"
```

### UNION Queries

```bash
# Combine results from multiple files
loq "SELECT name, 'current' as status FROM active.csv 
     UNION ALL 
     SELECT name, 'archived' as status FROM archive.csv"

# Union with deduplication
loq "SELECT email FROM users_2023.csv 
     UNION 
     SELECT email FROM users_2024.csv"
```

### Common Table Expressions (CTEs)

```bash
# WITH clause for complex queries
loq "WITH high_value_customers AS (
       SELECT customer_id, SUM(amount) as total 
       FROM orders.csv 
       GROUP BY customer_id 
       HAVING total > 1000
     )
     SELECT c.name, hvc.total 
     FROM customers.csv c 
     JOIN high_value_customers hvc ON c.id = hvc.customer_id"
```

### Multiple Files and Wildcards

```bash
# Query multiple files
loq "SELECT * FROM 'logs/*.csv'"
loq -iw:ON "SELECT * FROM 'logs/*.csv'"

# Recursive directory search
loq -recurse:3 "SELECT * FROM 'logs/*.log'"
loq -recurse:-1 "SELECT * FROM 'logs/**/*.csv'"

# Multiple file patterns
loq "SELECT * FROM 'access*.log' WHERE status >= 400"
```

### Format Conversion

```bash
# CSV to JSON
loq -o:JSON --ofile:output.json "SELECT * FROM data.csv"

# JSON to CSV
loq -i:JSON -o:CSV --ofile:output.csv "SELECT * FROM data.json"

# CSV to SQLite
loq -o:SQLITE --ofile:database.db --otable:data "SELECT * FROM data.csv"

# W3C logs to CSV
loq -i:W3C -o:CSV --ofile:access.csv "SELECT * FROM access.log"

# Multiple inputs to single output
loq -o:SQLITE --ofile:combined.db --otable:logs \
    "SELECT * FROM 'logs/*.csv'"
```

### Encoding Conversion

```bash
# Windows-1252 to UTF-8
loq -iCodepage:Windows-1252 -oCodepage:UTF-8 --ofile:modern.csv \
    "SELECT * FROM legacy.csv"

# UTF-8 to UTF-16LE (for Excel)
loq -oCodepage:UTF-16LE --ofile:excel_compatible.csv \
    "SELECT * FROM data.csv"

# Mixed encoding files
loq -iCodepage:Windows-1252 -o:JSON --ofile:output.json \
    "SELECT * FROM european_data.csv"
```

### Output Routing with INTO

```bash
# INTO clause infers output format from file extension
loq "SELECT * INTO output.json FROM data.csv"
loq "SELECT * INTO output.db FROM data.csv"
loq "SELECT TOP 100 * INTO sample.csv FROM large_file.csv"

# Equivalent to -o:FORMAT --ofile:PATH
loq "SELECT * FROM data.csv" -o:JSON --ofile:output.json
```

### Filesystem Queries

```bash
# Query file metadata
loq -i:FS "SELECT Name, Size, CreationTime FROM '/var/log'"
loq -i:FS "SELECT * FROM '/var/log' WHERE Size > 1000000"
loq -i:FS -recurse:-1 "SELECT Path, Size FROM '/var/log' WHERE Name LIKE '%.log'"

# Find large files
loq -i:FS -recurse:-1 \
    "SELECT Path, Size FROM '/' WHERE Size > 100000000 ORDER BY Size DESC LIMIT 10"
```

### Windows Event Logs (Cross-Platform)

```bash
# Query EVTX files on any OS
loq -i:EVTX "SELECT TimeCreated, EventID, Message FROM System.evtx"
loq -i:EVTX "SELECT * FROM Application.evtx WHERE EventID = 1000"

# Aggregate event IDs
loq -i:EVTX "SELECT EventID, COUNT(*) FROM Security.evtx GROUP BY EventID"
```

### S3 Queries

```bash
# Query S3 object
loq -i:S3 "SELECT * FROM 's3://bucket/path/data.csv'"

# Query with wildcards
loq -i:S3 "SELECT * FROM 's3://bucket/logs/*.csv'"

# With AWS credentials via environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
loq -i:S3 "SELECT * FROM 's3://my-bucket/data.csv'"
```

### Real-Time Monitoring

```bash
# Follow log file for errors
loq --follow "SELECT * FROM '/var/log/app.log' WHERE level = 'ERROR'"

# Follow with filtering and aggregation
loq -f "SELECT COUNT(*) FROM access.log WHERE status >= 500"

# Multiple files with follow
loq -f "SELECT * FROM 'logs/*.log' WHERE severity = 'CRITICAL'"
```

### Benchmarking and Testing

```bash
# Discard output to measure query performance
loq -o:NULL "SELECT * FROM huge_file.csv WHERE status = 'active'"

# With statistics
loq -o:NULL --stats:ON "SELECT * FROM data.csv WHERE complex_condition"

# Quiet mode for clean output
loq -q:ON --stats:ON -o:NULL "SELECT COUNT(*) FROM large_file.csv"
```

## Exit Codes

```bash
0  # Success
1  # General error
2  # Parse error (invalid SQL)
3  # Execution error (runtime error)
4  # File not found
```

**Usage in scripts:**

```bash
if loq "SELECT * FROM data.csv" > output.csv; then
    echo "Query succeeded"
else
    echo "Query failed with exit code $?"
fi
```

## Error Handling

### Common Errors and Solutions

**Parse Error (Exit Code 2):**
```bash
# Invalid SQL syntax
loq "SELECT * FORM data.csv"  # Typo: FORM instead of FROM
# Error: Parse error: Expected keyword FROM

# Solution: Check SQL syntax
loq "SELECT * FROM data.csv"
```

**Execution Error (Exit Code 3):**
```bash
# Column doesn't exist
loq "SELECT non_existent_column FROM data.csv"
# Error: Column 'non_existent_column' not found

# Solution: Check column names
loq "SELECT * FROM data.csv" | head -n 1  # View headers first
```

**File Not Found (Exit Code 4):**
```bash
# File doesn't exist
loq "SELECT * FROM missing.csv"
# Error: File not found: missing.csv

# Solution: Check file path
loq "SELECT * FROM /absolute/path/to/data.csv"
```

**Parse Errors in Data:**
```bash
# Malformed CSV with inconsistent columns
loq "SELECT * FROM messy_data.csv"
# Error: Parse error on line 42: expected 5 fields, got 3

# Solution: Allow parse errors
loq -e:-1 "SELECT * FROM messy_data.csv"  # Skip bad rows
```

## Environment Variables

```bash
# AWS credentials for S3 input format
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
export AWS_PROFILE=production

# Then query S3
loq -i:S3 "SELECT * FROM 's3://my-bucket/data.csv'"
```

## Performance Tips

### Query Optimization

```bash
# ✓ Select only needed columns (faster)
loq "SELECT id, name FROM huge.csv"

# ✗ Avoid SELECT * on large files
loq "SELECT * FROM huge.csv"

# ✓ Filter early in WHERE clause
loq "SELECT * FROM huge.csv WHERE status = 'active'"

# ✓ Use LIMIT for exploration
loq "SELECT * FROM huge.csv LIMIT 100"

# ✓ Use TOP N PERCENT for sampling
loq "SELECT TOP 1 PERCENT * FROM huge.csv"

# ✓ Use NULL output for benchmarking
loq -o:NULL --stats:ON "SELECT COUNT(*) FROM huge.csv"
```

### Multi-Threading

```bash
# Enable multi-threaded processing for multiple files
loq -multiSite:ON "SELECT * FROM 'logs/*.csv'"

# Good for: Multiple input files, CPU-intensive operations
# Not useful for: Single file, I/O-bound operations
```

### Memory Considerations

```bash
# ✓ Stream results (default for CSV/JSON output)
loq "SELECT * FROM huge.csv" > output.csv

# ✗ Avoid ORDER BY on huge datasets (loads all into memory)
loq "SELECT * FROM huge.csv ORDER BY timestamp"

# ✓ Use LIMIT with ORDER BY
loq "SELECT TOP 100 * FROM huge.csv ORDER BY timestamp DESC"
```

## Combining with Unix Tools

```bash
# Pipe to grep
loq -o:CSV "SELECT * FROM logs.csv" | grep error

# Pipe to jq for JSON processing
loq -o:JSON "SELECT * FROM data.csv" | jq '.name'

# Count result rows (without header)
loq -o:CSV -headers:OFF "SELECT * FROM data.csv" | wc -l

# Sort externally
loq -o:CSV -headers:OFF "SELECT * FROM data.csv" | sort -t',' -k2

# Tee to file and stdout
loq -o:JSON "SELECT * FROM data.csv" | tee output.json | jq '.status'

# Parallel processing with xargs
find logs/ -name "*.csv" | xargs -P 4 -I {} loq "SELECT COUNT(*) FROM '{}'"
```

## Log Parser 2.2 Compatibility Notes

loq maintains CLI compatibility with Microsoft Log Parser 2.2:

**Compatible syntax:**
- `-i:FORMAT` - Input format
- `-o:FORMAT` - Output format  
- `-q:ON|OFF` - Quiet mode
- `--stats:ON|OFF` - Statistics
- `-headerRow:ON|OFF` - Header row control
- `-iCodepage:CP` - Input encoding
- `-oCodepage:CP` - Output encoding
- `-recurse:N` - Recursive depth
- `-e:N` - Max parse errors
- `file:query.sql` - Query from file
- `TOP N` - Limit results
- `TOP N PERCENT` - Percentage limit
- `INTO destination` - Output routing

**Differences from Log Parser 2.2:**
- Binary name is `loq` (not `LogParser.exe`)
- Additional formats: S3, PARQUET, CLOUDWATCH, EVTX (cross-platform)
- Extended SQL: CTEs (WITH), UNION, window functions
- Better Unicode support with extended codepage aliases
- Cross-platform: runs on Linux/macOS/Windows

## Summary Checklist for LLM Command Generation

When generating `loq` commands:

1. **Query is always last:** `loq [OPTIONS] "SQL_QUERY"`
2. **Use colon syntax:** `-i:CSV` not `-i CSV` (though both work)
3. **Quote SQL queries:** Always use double quotes around SQL
4. **Quote file patterns:** Use single quotes in SQL: `'logs/*.csv'`
5. **Output files:** Use `--ofile:path` for file output
6. **Format inference:** Use `INTO file.json` for automatic format detection
7. **Wildcards:** Enable with `-iw:ON` for glob patterns
8. **Recursion:** Use `-recurse:N` for directory traversal
9. **Encoding:** Specify with `-iCodepage:` and `-oCodepage:`
10. **Parse errors:** Use `-e:-1` for messy data (unlimited errors)
11. **Exit codes:** Check for 0 (success), 1-4 (various errors)
12. **Statistics:** Use `--stats:ON` to show execution metrics

**Common mistakes to avoid:**
- ❌ `loq SELECT * FROM data.csv` (missing quotes)
- ✅ `loq "SELECT * FROM data.csv"`

- ❌ `loq "SELECT * FROM logs/*.csv"` (missing single quotes in pattern)
- ✅ `loq "SELECT * FROM 'logs/*.csv'"`

- ❌ `loq -i CSV "SELECT * FROM data.csv"` (works but not Log Parser syntax)
- ✅ `loq -i:CSV "SELECT * FROM data.csv"`

- ❌ `loq -o:SQLITE "SELECT * FROM data.csv"` (missing --ofile)
- ✅ `loq -o:SQLITE --ofile:db.db "SELECT * FROM data.csv"`

- ❌ `loq --follow SELECT * FROM app.log` (missing quotes)
- ✅ `loq --follow "SELECT * FROM app.log"`
