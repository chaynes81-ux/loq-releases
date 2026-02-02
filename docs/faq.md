# Frequently Asked Questions

Find answers to common questions about loq. If your question isn't answered here, please [open an issue](https://github.com/chaynes81-ux/loq/issues) on GitHub.

[[toc]]

## General

### What is loq?

loq (Log Query) is a cross-platform, SQL-based log analysis tool built in Rust. It allows you to query structured and semi-structured data files using familiar SQL syntax. Think of it as "SQL for your log files."

```bash
# Query a CSV file
loq "SELECT name, age FROM users.csv WHERE age > 30"

# Analyze web server logs
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) FROM access.log GROUP BY cs-uri-stem"
```

loq is designed as a modern replacement for Microsoft Log Parser 2.2, with improved performance, cross-platform support, and additional features.

### How is loq different from grep/awk/sed?

| Feature | grep/awk/sed | loq |
|---------|--------------|-----|
| **Learning curve** | Each tool has different syntax | Standard SQL |
| **Structured data** | Manual parsing required | Native format support |
| **Aggregations** | Complex scripting needed | `GROUP BY`, `SUM`, `COUNT` |
| **Joins** | Very difficult | `JOIN` syntax |
| **Type awareness** | Text only | Numbers, dates, strings |

**grep/awk/sed** are excellent for simple text manipulation but become unwieldy for complex data analysis. **loq** shines when you need to:

- Aggregate data (counts, sums, averages)
- Join multiple files
- Filter with complex conditions
- Work with typed data (dates, numbers)
- Export to databases or structured formats

```bash
# With awk (complex)
awk -F',' 'NR>1 {sum[$2]+=$3; count[$2]++} END {for(k in sum) print k, sum[k]/count[k]}' data.csv

# With loq (readable)
loq "SELECT category, AVG(amount) FROM data.csv GROUP BY category"
```

### How is loq different from Microsoft Log Parser?

loq is designed as a drop-in replacement for Microsoft Log Parser 2.2 with these key differences:

| Feature | MS Log Parser | loq |
|---------|---------------|-----|
| **Platform** | Windows only | Windows, macOS, Linux |
| **Performance** | Baseline | 2-5x faster |
| **Status** | Deprecated (2005) | Actively maintained |
| **Source** | Closed source | Open source (MIT) |
| **Output formats** | Limited | 10+ formats |
| **Cloud support** | None | S3, CloudWatch |

**Compatibility**: loq uses the same `-i:FORMAT` and `-o:FORMAT` syntax as MS Log Parser, so many existing scripts work with minimal changes.

**Migration**: See the [Comparison Guide](/getting-started/comparison) for detailed migration instructions.

### What platforms does loq support?

loq runs on all major platforms:

- **Windows**: x86_64, ARM64 (Windows 10+)
- **macOS**: Intel (x86_64), Apple Silicon (ARM64)
- **Linux**: x86_64, ARM64 (glibc 2.17+)
- **Docker**: Official images available
- **Kubernetes**: Helm charts available

Some input formats are platform-specific:
- **Windows-only**: ETW (Event Tracing for Windows), ADS (Active Directory)
- **Cross-platform**: All other formats including EVTX, Registry files

### Is loq open source?

Yes, loq is open source software released under the MIT License. You can:

- Use it freely in personal and commercial projects
- Modify the source code
- Distribute it
- Contribute to development

The source code is available at [github.com/chaynes81-ux/loq](https://github.com/chaynes81-ux/loq).

---

## Installation & Setup

### How do I install loq?

There are several installation methods:

::: code-group
```bash [macOS (Homebrew)]
brew install loq
```

```bash [macOS/Linux (Binary)]
curl -LO https://github.com/chaynes81-ux/loq/releases/latest/download/loq-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m).tar.gz
tar xzf loq-*.tar.gz
sudo mv loq /usr/local/bin/
```

```bash [Cargo]
cargo install loq
```

```bash [Docker]
docker pull loq/loq:latest
```

```powershell [Windows]
# Download from GitHub releases
Invoke-WebRequest -Uri https://github.com/chaynes81-ux/loq/releases/latest/download/loq-windows-x86_64.zip -OutFile loq.zip
Expand-Archive loq.zip -DestinationPath C:\loq
```
:::

See the [Installation Guide](/getting-started/installation) for detailed instructions.

### How do I update to the latest version?

Update loq based on your installation method:

::: code-group
```bash [Homebrew]
brew upgrade loq
```

```bash [Cargo]
cargo install loq --force
```

```bash [Docker]
docker pull loq/loq:latest
```

```bash [Binary]
# Re-download and replace
curl -LO https://github.com/chaynes81-ux/loq/releases/latest/download/loq-darwin-arm64.tar.gz
tar xzf loq-darwin-arm64.tar.gz
sudo mv loq /usr/local/bin/
```
:::

Check your current version with:

```bash
loq --version
```

### Does loq require any dependencies?

**No runtime dependencies** are required. loq is distributed as a single static binary.

**Build dependencies** (if compiling from source):
- Rust 1.70 or later
- A C compiler (for some optional features)

### Can I use loq in Docker/Kubernetes?

Yes, loq provides official Docker images:

```bash
# Run a query
docker run --rm -v $(pwd):/data loq/loq:latest "SELECT * FROM /data/logs.csv"

# Run the REST API server
docker run -d -p 8080:8080 -v $(pwd):/data loq/loq-server:latest
```

For Kubernetes, see the [Kubernetes Deployment Guide](/deployment/kubernetes) which includes:
- Helm charts
- Example manifests
- ConfigMap-based query management
- Horizontal pod autoscaling

---

## Usage & Features

### What file formats does loq support?

loq supports 20+ input formats and 10+ output formats.

**Input Formats:**

| Category | Formats |
|----------|---------|
| Structured Data | CSV, TSV, JSON, NDJSON, XML, Parquet |
| Web Server Logs | W3C/IIS, NCSA/Apache/Nginx, HTTP Error |
| System Logs | Syslog (RFC 3164/5424), EVTX, ETW |
| Network | PCAP/NETMON |
| Cloud | S3 |
| Other | Filesystem, Registry, Text (line/word) |

**Output Formats:**

| Category | Formats |
|----------|---------|
| Files | CSV, TSV, JSON, NDJSON, XML |
| Databases | SQLite, PostgreSQL, MySQL |
| Visualization | Charts (PNG/SVG) |
| Cloud | CloudWatch Logs, Syslog |
| Custom | Template-based output |

See [Input Formats](/input-formats/) and [Output Formats](/output-formats/) for details.

### What's the maximum file size loq can handle?

loq uses streaming processing, so it can handle files **larger than available RAM**. There's no hard-coded limit.

Practical limits depend on your query:

| Query Type | File Size | Notes |
|------------|-----------|-------|
| Simple SELECT/WHERE | Unlimited | Streams row by row |
| GROUP BY | 100M+ rows | Limited by unique groups |
| ORDER BY | Millions of rows | Requires memory for sorting |
| JOIN | Varies | Right side loaded into memory |

**Tips for large files:**
- Use `LIMIT` during development
- Add `WHERE` clauses to reduce data early
- Use `--stats` to monitor memory usage

### Does loq support compressed files (gzip, etc.)?

Yes, loq automatically detects and decompresses:

- **gzip** (`.gz`)
- **bzip2** (`.bz2`)
- **xz** (`.xz`)
- **zstd** (`.zst`)

```bash
# Automatically decompressed
loq "SELECT * FROM access.log.gz"
loq "SELECT * FROM data.csv.bz2"
```

For S3 sources, compression is also supported:

```bash
loq -i:S3 "SELECT * FROM s3://bucket/logs/*.json.gz"
```

### Can I query multiple files at once?

Yes, use glob patterns or UNION:

**Glob patterns:**

```bash
# All CSV files in a directory
loq "SELECT * FROM logs/*.csv"

# Recursive glob
loq "SELECT * FROM data/**/*.json"
```

**UNION:**

```bash
loq "
  SELECT * FROM january.csv
  UNION ALL
  SELECT * FROM february.csv
  UNION ALL
  SELECT * FROM march.csv
"
```

**JOINs across files:**

```bash
loq "
  SELECT u.name, o.total
  FROM users.csv u
  JOIN orders.csv o ON u.id = o.user_id
"
```

### Can I query files from S3?

Yes, loq has native S3 support:

```bash
# Query a single file
loq -i:S3 "SELECT * FROM s3://my-bucket/logs/access.log"

# Query with glob patterns
loq -i:S3 "SELECT * FROM s3://my-bucket/logs/2024-01-*.json"

# Using environment credentials
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
loq -i:S3 "SELECT * FROM s3://my-bucket/data.csv"
```

See the [S3 Input Format](/input-formats/s3) documentation for authentication options and advanced features.

### How do I output results to a file?

Use the `--ofile` option:

```bash
# Output to CSV file
loq --ofile:results.csv "SELECT * FROM data.csv WHERE status = 'error'"

# Output to JSON file
loq -o:JSON --ofile:results.json "SELECT * FROM data.csv"

# Output to different formats
loq -o:XML --ofile:results.xml "SELECT * FROM data.csv"
```

### Can I export to databases (SQLite, PostgreSQL)?

Yes, loq supports direct database output:

**SQLite:**

```bash
loq -o:SQLITE --ofile:output.db "SELECT * FROM logs.csv"
```

**PostgreSQL:**

```bash
loq -o:POSTGRESQL \
  --server:localhost \
  --database:mydb \
  --username:user \
  --password:pass \
  --createTable:ON \
  "SELECT * FROM logs.csv"
```

**MySQL:**

```bash
loq -o:MYSQL \
  --server:localhost \
  --database:mydb \
  --username:user \
  --password:pass \
  "SELECT * FROM logs.csv"
```

See [Database Output](/output-formats/database) for full documentation.

---

## Performance

### How fast is loq compared to Log Parser 2.2?

loq is typically **2-5x faster** than Microsoft Log Parser 2.2:

| Operation | MS Log Parser | loq | Speedup |
|-----------|---------------|-----|---------|
| Simple SELECT | 1.0x | 2.1x | 2.1x |
| WHERE filtering | 1.0x | 2.8x | 2.8x |
| GROUP BY aggregation | 1.0x | 3.2x | 3.2x |
| Large file (1GB) | 1.0x | 4.5x | 4.5x |

Performance improvements come from:
- Rust's zero-cost abstractions
- 64KB I/O buffers (8x larger than typical)
- Optimized type inference
- SIMD-accelerated parsing (where available)

### How can I speed up queries on large files?

1. **Filter early with WHERE:**
   ```bash
   # Slow - processes all rows before filtering
   loq "SELECT * FROM huge.csv" | grep "error"

   # Fast - filters during reading
   loq "SELECT * FROM huge.csv WHERE status = 'error'"
   ```

2. **Use LIMIT during development:**
   ```bash
   loq "SELECT * FROM huge.csv LIMIT 100"
   ```

3. **Select only needed columns:**
   ```bash
   # Slower
   loq "SELECT * FROM huge.csv"

   # Faster
   loq "SELECT timestamp, message FROM huge.csv"
   ```

4. **Use appropriate input format:**
   ```bash
   # Let loq know the format for optimized parsing
   loq -i:JSON "SELECT * FROM data.json"
   ```

5. **Compress your files:**
   Compressed files can be faster due to reduced I/O.

### Does loq use multiple CPU cores?

Currently, loq is **single-threaded** for query execution. However, parallelism is used in:

- File I/O (async reads)
- Decompression (parallel decompression for some formats)

Multi-threaded query execution is planned for a future release.

**Workaround for parallelism:**

```bash
# Process multiple files in parallel using GNU parallel
find logs/ -name "*.csv" | parallel loq "SELECT COUNT(*) FROM {}"
```

### How much memory does loq use?

Memory usage depends on your query:

| Query Type | Memory Usage |
|------------|--------------|
| Simple SELECT/WHERE | ~10 MB (streaming) |
| GROUP BY (1K groups) | ~50 MB |
| GROUP BY (1M groups) | ~500 MB |
| ORDER BY (1M rows) | ~200 MB |
| JOIN (10K right rows) | ~50 MB |

**Monitor memory usage:**

```bash
loq --stats "SELECT * FROM data.csv"
```

**Reduce memory usage:**

- Add `LIMIT` to reduce result set
- Use `WHERE` to filter early
- For JOINs, put the smaller table on the right side

---

## SQL & Queries

### What SQL features are supported?

loq supports a comprehensive subset of SQL:

**Queries:**
- `SELECT` with columns, aliases, expressions
- `FROM` with files, URLs, S3 paths
- `WHERE` with conditions and operators
- `GROUP BY` with multiple columns
- `HAVING` for aggregate filtering
- `ORDER BY` with ASC/DESC
- `LIMIT` and `OFFSET`
- `DISTINCT`
- `UNION` and `UNION ALL`

**Joins:**
- `INNER JOIN`
- `LEFT JOIN`
- `CROSS JOIN`

**Subqueries:**
- Scalar subqueries
- `IN (SELECT ...)`
- `EXISTS (SELECT ...)`

**Expressions:**
- `CASE WHEN ... THEN ... ELSE ... END`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `=`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `AND`, `OR`, `NOT`
- `BETWEEN`, `IN`, `LIKE`, `IS NULL`

**Window Functions:**
- `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`
- `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`
- `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()` OVER (...)

See the [SQL Reference](/sql/) for complete documentation.

### Does loq support JOINs?

Yes, loq supports INNER JOIN, LEFT JOIN, and CROSS JOIN:

```bash
# INNER JOIN
loq "
  SELECT u.name, o.product, o.total
  FROM users.csv u
  INNER JOIN orders.csv o ON u.id = o.user_id
"

# LEFT JOIN
loq "
  SELECT u.name, COALESCE(COUNT(o.id), 0) as order_count
  FROM users.csv u
  LEFT JOIN orders.csv o ON u.id = o.user_id
  GROUP BY u.name
"

# CROSS JOIN
loq "
  SELECT a.x, b.y
  FROM table_a.csv a
  CROSS JOIN table_b.csv b
"
```

See [JOINs](/sql/joins) for detailed documentation and examples.

### Does loq support window functions?

Yes, loq implements common window functions:

```bash
# Row numbers
loq "
  SELECT
    name,
    score,
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank
  FROM scores.csv
"

# Running totals
loq "
  SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) as running_total
  FROM transactions.csv
"

# Compare to previous row
loq "
  SELECT
    date,
    value,
    LAG(value, 1) OVER (ORDER BY date) as prev_value,
    value - LAG(value, 1) OVER (ORDER BY date) as change
  FROM metrics.csv
"
```

See [Window Functions](/sql/window-functions) for the complete list.

### Can I use subqueries?

Yes, loq supports scalar subqueries, IN subqueries, and EXISTS subqueries:

```bash
# Scalar subquery
loq "
  SELECT name, score,
    score - (SELECT AVG(score) FROM scores.csv) as diff_from_avg
  FROM scores.csv
"

# IN subquery
loq "
  SELECT * FROM orders.csv
  WHERE user_id IN (SELECT id FROM vip_users.csv)
"

# EXISTS subquery
loq "
  SELECT * FROM users.csv u
  WHERE EXISTS (
    SELECT 1 FROM orders.csv o WHERE o.user_id = u.id
  )
"
```

See [Subqueries](/sql/subqueries) for more examples.

### Are queries case-sensitive?

**SQL keywords** are case-insensitive:

```bash
# These are equivalent
loq "SELECT * FROM data.csv WHERE name = 'Alice'"
loq "select * from data.csv where name = 'Alice'"
```

**Column names** are case-insensitive by default:

```bash
# These are equivalent
loq "SELECT Name FROM data.csv"
loq "SELECT name FROM data.csv"
```

**String comparisons** are case-sensitive by default:

```bash
# Case-sensitive (no match for 'alice')
loq "SELECT * FROM data.csv WHERE name = 'Alice'"

# Use UPPER/LOWER for case-insensitive comparison
loq "SELECT * FROM data.csv WHERE UPPER(name) = 'ALICE'"

# Use LIKE for pattern matching (case-sensitive)
loq "SELECT * FROM data.csv WHERE name LIKE 'Ali%'"
```

---

## Troubleshooting

### Why am I getting "file not found"?

Common causes and solutions:

1. **Relative path issues:**
   ```bash
   # Use absolute path
   loq "SELECT * FROM /full/path/to/data.csv"

   # Or ensure you're in the right directory
   cd /path/to/data
   loq "SELECT * FROM data.csv"
   ```

2. **Spaces in file paths:**
   ```bash
   # Quote the path
   loq "SELECT * FROM 'my file.csv'"
   loq "SELECT * FROM \"my file.csv\""
   ```

3. **Glob pattern not matching:**
   ```bash
   # Check what files match
   ls logs/*.csv

   # Ensure pattern is correct
   loq "SELECT * FROM logs/*.csv"
   ```

4. **Permissions:**
   ```bash
   # Check file permissions
   ls -la data.csv

   # Ensure read permission
   chmod +r data.csv
   ```

### Why are my column names not recognized?

1. **Check actual column names:**
   ```bash
   # View the schema
   loq "SELECT * FROM data.csv LIMIT 1"
   ```

2. **Handle special characters:**
   ```bash
   # Use quotes for column names with spaces or special chars
   loq "SELECT \"Column Name\" FROM data.csv"
   loq "SELECT [Column Name] FROM data.csv"
   ```

3. **CSV without headers:**
   ```bash
   # Use -headerRow:OFF and column positions
   loq -i:CSV -headerRow:OFF "SELECT Column1, Column2 FROM data.csv"
   ```

4. **Format-specific column names:**
   ```bash
   # W3C logs use specific field names
   loq -i:W3C "SELECT cs-uri-stem, sc-status FROM access.log"
   ```

### How do I handle special characters in file paths?

1. **Spaces:**
   ```bash
   loq "SELECT * FROM 'path with spaces/file.csv'"
   ```

2. **Quotes in paths:**
   ```bash
   loq "SELECT * FROM \"path'with'quotes/file.csv\""
   ```

3. **Shell escaping:**
   ```bash
   # Let the shell handle it
   loq "SELECT * FROM $HOME/data/file.csv"
   ```

4. **Windows paths:**
   ```powershell
   # Use forward slashes or escape backslashes
   loq "SELECT * FROM C:/Users/data/file.csv"
   loq "SELECT * FROM 'C:\Users\data\file.csv'"
   ```

### Why is type inference wrong?

loq automatically infers column types from data. Sometimes this can be incorrect.

1. **Force string type:**
   ```bash
   # If a column like "zipcode" is being treated as integer
   loq "SELECT CAST(zipcode AS VARCHAR) FROM data.csv"
   ```

2. **Check inferred types:**
   ```bash
   # View the schema
   loq --stats "SELECT * FROM data.csv LIMIT 1"
   ```

3. **Mixed types in column:**
   ```bash
   # If a column has mixed values like "123" and "N/A"
   # loq will use STRING type
   # Use COALESCE or CASE WHEN to handle
   loq "SELECT COALESCE(CAST(value AS INT), 0) FROM data.csv"
   ```

4. **Date/time formats:**
   ```bash
   # Use TO_TIMESTAMP for custom date formats
   loq "SELECT TO_TIMESTAMP(date_col, '%Y-%m-%d') FROM data.csv"
   ```

5. **Disable type inference:**
   ```bash
   # Treat all columns as strings
   loq -i:CSV -dtLines:0 "SELECT * FROM data.csv"
   ```

---

## Still Have Questions?

- Check the [full documentation](/)
- Search [GitHub Issues](https://github.com/chaynes81-ux/loq/issues)
- Ask in [GitHub Discussions](https://github.com/chaynes81-ux/loq/discussions)
- Report bugs or request features by [opening an issue](https://github.com/chaynes81-ux/loq/issues/new)
