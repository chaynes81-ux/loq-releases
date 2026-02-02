# Introduction

loq is a cross-platform, SQL-based log analysis tool built in Rust. It provides a modern, high-performance replacement for Microsoft Log Parser 2.2 while maintaining CLI compatibility.

## What is loq?

loq allows you to query structured and semi-structured data using SQL syntax. Instead of writing complex scripts or using specialized tools for each log format, you can use familiar SQL to:

- **Extract** specific fields from log files
- **Filter** records based on conditions
- **Aggregate** data with GROUP BY and aggregate functions
- **Join** data across multiple files
- **Transform** data using built-in functions
- **Export** results to various formats

## Key Features

### Full SQL Support

loq implements a comprehensive SQL engine supporting:

- `SELECT` with column selection, aliases, and expressions
- `WHERE` with complex conditions (AND, OR, BETWEEN, IN, LIKE)
- `GROUP BY` with multiple columns
- `HAVING` for aggregate filtering
- `ORDER BY` with ASC/DESC
- `LIMIT` for result limiting
- `DISTINCT` for unique values
- `JOINs` (INNER, LEFT, CROSS)
- `UNION` and `UNION ALL`
- Subqueries (scalar, IN, EXISTS)
- Window functions (ROW_NUMBER, RANK, LAG, LEAD, etc.)
- `CASE WHEN` expressions

### 20+ Input Formats

Parse virtually any log format:

| Category | Formats |
|----------|---------|
| Structured Data | CSV, TSV, JSON, NDJSON, XML, Parquet |
| Web Server Logs | W3C, IIS, NCSA, Apache, Nginx |
| System Logs | Syslog (RFC 3164/5424), EVTX, ETW |
| Network | PCAP, HTTP Error logs |
| Cloud | S3, CloudWatch |
| Other | Filesystem, Registry, Text (line/word) |

### Flexible Output

Export your query results to:

- **Files**: CSV, TSV, JSON, XML, Parquet
- **Databases**: SQLite, PostgreSQL, MySQL
- **Visualization**: Charts (PNG/SVG)
- **Cloud**: CloudWatch Logs
- **Custom**: Template-based output

### High Performance

Built in Rust for speed:

- **2-5x faster** than Microsoft Log Parser 2.2
- 64KB I/O buffers for efficient file reading
- Parallel processing for large datasets
- Optimized type inference and parsing

### Cross-Platform

Runs everywhere:

- Windows (x86_64, ARM64)
- macOS (Intel, Apple Silicon)
- Linux (x86_64, ARM64)
- Docker containers
- Kubernetes clusters

## Example Use Cases

### Web Server Log Analysis

```bash
# Find top 10 most requested URLs
loq -i:W3C "
  SELECT cs-uri-stem, COUNT(*) as requests
  FROM access.log
  GROUP BY cs-uri-stem
  ORDER BY requests DESC
  LIMIT 10
"
```

### Security Monitoring

```bash
# Find failed login attempts
loq -i:EVTX "
  SELECT TimeCreated, Computer, EventData.TargetUserName
  FROM Security.evtx
  WHERE EventID = 4625
  ORDER BY TimeCreated DESC
"
```

### Data Transformation

```bash
# Clean and export CSV data
loq -o:JSON --ofile:output.json "
  SELECT
    UPPER(TRIM(name)) as name,
    COALESCE(email, 'unknown') as email,
    ROUND(score, 2) as score
  FROM raw_data.csv
  WHERE score > 0
"
```

### Cross-File Analysis

```bash
# Join user data with orders
loq "
  SELECT u.name, COUNT(o.id) as orders, SUM(o.total) as revenue
  FROM users.csv u
  LEFT JOIN orders.csv o ON u.id = o.user_id
  GROUP BY u.name
  HAVING revenue > 1000
"
```

## Getting Started

Ready to try loq? Head to the [Installation](/getting-started/installation) guide to get started, or jump straight to the [Quick Start](/getting-started/quick-start) tutorial.

## Coming from MS Log Parser?

If you're migrating from Microsoft Log Parser 2.2, check out our [Comparison](/getting-started/comparison) guide to understand the differences and how to migrate your existing scripts.
