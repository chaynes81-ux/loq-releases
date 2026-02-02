---
layout: home
title: loq - Log Query

hero:
  name: loq
  text: Log Query
  tagline: Like jq, but for logs. A modern, cross-platform replacement for Microsoft Log Parser 2.2.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/chaynes81-ux/loq

features:
  - icon:
      src: /icons/sql.svg
      alt: SQL
    title: Full SQL Support
    details: SELECT, WHERE, GROUP BY, HAVING, ORDER BY, JOINs, UNION, Subqueries, Window Functions, and CASE WHEN expressions.

  - icon:
      src: /icons/formats.svg
      alt: Formats
    title: 20+ Input Formats
    details: CSV, JSON, XML, W3C, IIS, NCSA, Syslog, EVTX, Parquet, S3, and more. Parse any log format with SQL.

  - icon:
      src: /icons/output.svg
      alt: Output
    title: Flexible Output
    details: Export to CSV, JSON, XML, SQLite, PostgreSQL, MySQL, Charts (PNG/SVG), CloudWatch, and more.

  - icon:
      src: /icons/fast.svg
      alt: Fast
    title: 2-5x Faster
    details: Built in Rust for performance. Optimized parsing with parallel processing on large datasets.

  - icon:
      src: /icons/cross-platform.svg
      alt: Cross-platform
    title: Cross-Platform
    details: Runs on Windows, macOS, and Linux. Docker and Kubernetes ready.

  - icon:
      src: /icons/compatible.svg
      alt: Compatible
    title: Drop-in Compatible
    details: CLI syntax compatible with Microsoft Log Parser 2.2. Migrate existing scripts easily.
---

## Quick Example

```bash
# Query a CSV file
loq "SELECT name, age FROM users.csv WHERE age > 30 ORDER BY age DESC"

# Analyze web server logs
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) FROM access.log GROUP BY cs-uri-stem"

# Generate a chart
loq -o:CHART -chartType:Bar --ofile:status.png \
  "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"

# Query S3 data
loq -i:S3 "SELECT * FROM 's3://bucket/logs/*.csv' WHERE level = 'ERROR'"
```

## Why loq?

| Feature | MS Log Parser 2.2 | loq |
|---------|-------------------|-----|
| Platform | Windows only | Windows, macOS, Linux |
| Performance | Baseline | 2-5x faster |
| Window Functions | No | Yes |
| Subqueries | Limited | Full support |
| JOINs | Basic | INNER, LEFT, CROSS |
| Cloud Integration | No | S3, CloudWatch, Parquet |
| Container Support | No | Docker, Kubernetes |
| Active Development | Abandoned | Active |

## Installation

::: code-group
```bash [macOS/Linux]
# Using Homebrew (coming soon)
brew install loq

# From source
cargo install loq
```

```bash [Windows]
# Using Scoop (coming soon)
scoop install loq

# From source
cargo install loq
```

```bash [Docker]
docker pull loq/loq:latest
docker run --rm -v $(pwd):/data loq "SELECT * FROM /data/file.csv"
```
:::

## Supported SQL

```sql
-- Aggregations
SELECT department, COUNT(*), AVG(salary)
FROM employees.csv
GROUP BY department
HAVING COUNT(*) > 5;

-- Window functions
SELECT name, salary,
       RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as rank
FROM employees.csv;

-- JOINs
SELECT u.name, o.total
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id;

-- Subqueries
SELECT * FROM products.csv
WHERE price > (SELECT AVG(price) FROM products.csv);
```

## Input Formats

loq supports 20+ input formats out of the box:

| Format | Description | Example |
|--------|-------------|---------|
| CSV | Comma-separated values | `loq "SELECT * FROM data.csv"` |
| JSON | JSON and NDJSON | `loq -i:JSON "SELECT * FROM data.json"` |
| W3C | IIS W3C extended logs | `loq -i:W3C "SELECT * FROM access.log"` |
| EVTX | Windows Event Logs | `loq -i:EVTX "SELECT * FROM System.evtx"` |
| S3 | Amazon S3 objects | `loq -i:S3 "SELECT * FROM 's3://bucket/key'"` |
| FS | Filesystem metadata | `loq -i:FS "SELECT * FROM '/var/log'"` |

[View all input formats](/input-formats/)

## Get Involved

- [GitHub Repository](https://github.com/chaynes81-ux/loq)
- [Report Issues](https://github.com/chaynes81-ux/loq/issues)
- [Contributing Guide](https://github.com/chaynes81-ux/loq/blob/main/CONTRIBUTING.md)
