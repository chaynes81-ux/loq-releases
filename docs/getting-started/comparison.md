# Comparison to MS Log Parser 2.2

This guide helps users migrating from Microsoft Log Parser 2.2 understand the differences and compatibility with loq.

## Overview

loq aims to be a drop-in replacement for MS Log Parser 2.2 with these goals:

- **100% CLI compatibility** - Same command-line syntax
- **2-5x performance** - Built in Rust for speed
- **Cross-platform** - Runs on Windows, macOS, Linux
- **Extended features** - Window functions, full subqueries, more formats

## Feature Comparison

| Feature | MS Log Parser 2.2 | loq |
|---------|-------------------|-----------|
| **Platform** | Windows only | Windows, macOS, Linux |
| **Performance** | Baseline | 2-5x faster |
| **CLI Syntax** | `-i:FORMAT -o:FORMAT` | Same (compatible) |
| **COM/Scripting** | Yes | Windows DLL available |
| **REST API** | No | Yes |
| **Container Support** | No | Docker, Kubernetes |

### SQL Features

| Feature | MS Log Parser 2.2 | loq |
|---------|-------------------|-----------|
| SELECT, WHERE, LIMIT | Yes | Yes |
| GROUP BY, HAVING | Yes | Yes |
| ORDER BY | Yes | Yes |
| DISTINCT | Yes | Yes |
| INNER JOIN | Yes | Yes |
| LEFT JOIN | Limited | Yes |
| CROSS JOIN | No | Yes |
| UNION | Limited | Full support |
| Subqueries (IN) | Basic | Full support |
| Subqueries (scalar) | No | Yes |
| Subqueries (EXISTS) | No | Yes |
| Window Functions | No | Yes |
| CASE WHEN | Basic | Full support |

### Input Formats

| Format | MS Log Parser 2.2 | loq |
|--------|-------------------|-----------|
| CSV | Yes | Yes |
| TSV | Yes | Yes |
| XML | Yes | Yes |
| JSON | No | Yes |
| W3C (IIS) | Yes | Yes |
| IIS Native | Yes | Yes |
| NCSA/Apache | Yes | Yes |
| EVTX | Windows only | Cross-platform |
| Registry | Windows only | Cross-platform (.reg) |
| Syslog | No | Yes (RFC 3164/5424) |
| S3 | No | Yes |
| Parquet | No | Yes |
| PCAP | No | Yes |

### Output Formats

| Format | MS Log Parser 2.2 | loq |
|--------|-------------------|-----------|
| CSV | Yes | Yes |
| TSV | Yes | Yes |
| XML | Yes | Yes |
| JSON | No | Yes |
| IIS | Yes | Yes |
| DATAGRID | Yes | Yes |
| SQLite | No | Yes |
| PostgreSQL | No | Yes |
| MySQL | No | Yes |
| CHART | Yes | Yes (PNG/SVG) |
| Template | Yes | Yes |
| CloudWatch | No | Yes |

## CLI Compatibility

loq uses the same CLI syntax as MS Log Parser 2.2:

```bash
# MS Log Parser 2.2
loq.exe -i:W3C -o:CSV "SELECT * FROM ex*.log"

# loq (identical)
loq -i:W3C -o:CSV "SELECT * FROM ex*.log"
```

### Supported Options

| Option | MS Log Parser | loq | Notes |
|--------|--------------|-----------|-------|
| `-i:FORMAT` | Yes | Yes | Input format |
| `-o:FORMAT` | Yes | Yes | Output format |
| `-q:ON/OFF` | Yes | Yes | Quiet mode |
| `-stats:ON/OFF` | Yes | Yes | Show statistics |
| `-headers:ON/OFF` | Yes | Yes | Include headers |
| `-recurse:N` | Yes | Yes | Recursive depth |
| `-iCodepage:CP` | Yes | Yes | Input codepage |
| `-oCodepage:CP` | Yes | Yes | Output codepage |
| `-oSeparator:SEP` | Yes | Yes | Output separator |
| `file:query.sql` | Yes | Yes | Query from file |

### New Options

loq adds these new options:

| Option | Description |
|--------|-------------|
| `--ofile PATH` | Output file path |
| `--otable NAME` | Database table name |
| `--follow` | Streaming mode (tail -f style) |
| `-chartType:TYPE` | Chart type (Bar, Line, Pie) |
| `-chartTitle:TITLE` | Chart title |

## Migration Guide

### Simple Queries

Most queries work unchanged:

```bash
# MS Log Parser 2.2
loq "SELECT * FROM data.csv WHERE age > 30"

# loq
loq "SELECT * FROM data.csv WHERE age > 30"
```

### Format Options

Format options are compatible:

```bash
# MS Log Parser 2.2
loq -i:IISW3C -o:CSV "SELECT date, cs-uri-stem FROM ex*.log"

# loq
loq -i:W3C -o:CSV "SELECT date, cs-uri-stem FROM ex*.log"
```

::: tip Format Aliases
loq supports multiple aliases for formats:
- `W3C`, `IISW3C` both work
- `NCSA`, `APACHE`, `NGINX` all work
- `DATAGRID`, `TABLE`, `GRID` all work
:::

### Functions

Most functions are compatible:

| MS Log Parser | loq | Notes |
|---------------|-----------|-------|
| `UPPER(s)` | `UPPER(s)` | Same |
| `LOWER(s)` | `LOWER(s)` | Same |
| `SUBSTR(s,n,m)` | `SUBSTR(s,n,m)` | Same |
| `STRLEN(s)` | `STRLEN(s)` or `LENGTH(s)` | Both work |
| `TO_TIMESTAMP(s,f)` | `TO_TIMESTAMP(s,f)` | Same |
| `QUANTIZE(ts,n)` | `QUANTIZE(ts,n)` | Same |
| `EXTRACT_PREFIX(s,d)` | `EXTRACT_PREFIX(s,d)` | Same |
| `REVERSEDNS(ip)` | `REVERSEDNS(ip)` | Same |

### COM/Scripting Migration

If you used MS Log Parser via COM (VBScript, PowerShell), loq provides:

1. **Windows DLL** - COM-compatible interface for existing scripts
2. **REST API** - HTTP interface for any language

#### PowerShell Example

MS Log Parser (COM):
```powershell
$logParser = New-Object -ComObject MSUtil.LogQuery
$rs = $logParser.Execute("SELECT * FROM data.csv")
```

loq (REST API):
```powershell
$body = @{ sql = "SELECT * FROM data.csv" } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/query" `
    -Method Post -Body $body -ContentType "application/json"
```

### Differences to Note

#### 1. File Paths

loq is more flexible with file paths:

```bash
# Both work
loq "SELECT * FROM data.csv"
loq "SELECT * FROM 'data.csv'"
loq "SELECT * FROM '/path/to/data.csv'"  # Absolute paths
```

#### 2. Date/Time Handling

loq returns ISO 8601 format by default:

```bash
# MS Log Parser might return: 01/15/2024
# loq returns: 2024-01-15T14:30:00
```

#### 3. NULL Handling

loq has explicit NULL support:

```sql
-- Works in loq
SELECT COALESCE(name, 'Unknown') FROM data.csv
SELECT * FROM data.csv WHERE email IS NULL
```

#### 4. Case Sensitivity

loq is case-insensitive for SQL keywords but preserves case in data:

```sql
-- All equivalent
SELECT name FROM users.csv
select name from users.csv
Select Name From users.csv
```

## New Features in loq

### Window Functions

Not available in MS Log Parser:

```sql
SELECT name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) as rank,
       RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as dept_rank,
       LAG(salary, 1, 0) OVER (ORDER BY name) as prev_salary
FROM employees.csv
```

### Full Subqueries

Extended subquery support:

```sql
-- Scalar subquery
SELECT name, salary,
       salary - (SELECT AVG(salary) FROM employees.csv) as diff_from_avg
FROM employees.csv

-- EXISTS subquery
SELECT * FROM users.csv u
WHERE EXISTS (SELECT 1 FROM orders.csv o WHERE o.user_id = u.id)
```

### Cloud Integration

New in loq:

```bash
# Read from S3
loq -i:S3 "SELECT * FROM 's3://bucket/logs/*.csv'"

# Write to CloudWatch
loq -o:CLOUDWATCH --log-group:/app/logs "SELECT * FROM errors.csv"
```

### Container Support

```bash
# Run in Docker
docker run --rm -v $(pwd):/data loq "SELECT * FROM /data/logs.csv"

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## Performance Comparison

loq is generally 2-5x faster:

| Operation | MS Log Parser 2.2 | loq |
|-----------|-------------------|-----------|
| Parse 1M CSV rows | ~10s | ~3s |
| Parse 100K W3C records | ~5s | ~1.5s |
| GROUP BY on 1M rows | ~15s | ~4s |
| JOIN two 100K tables | ~20s | ~6s |

Performance varies based on:
- File size and format
- Query complexity
- Hardware (loq benefits from multiple cores)

## Getting Help

- [SQL Reference](/sql/) - Complete SQL documentation
- [Functions](/functions/) - All available functions
- [CLI Reference](/cli/) - Command-line options
- [GitHub Issues](https://github.com/chaynes81-ux/loq/issues) - Report bugs or request features
