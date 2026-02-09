# Output Formats Reference

Quick reference for all output formats supported by the log parser. Use `-o:FORMAT` to specify the output format.

## Format Overview

| Format | CLI Flag | Requires File | Description |
|--------|----------|---------------|-------------|
| CSV | `-o:CSV` | No | Comma-separated values (default) |
| TSV | `-o:TSV` | No | Tab-separated values |
| JSON / NDJSON | `-o:JSON` | No | JSON objects (newline-delimited) |
| XML | `-o:XML` | No | XML document with nested elements or attributes |
| W3C / IISW3C | `-o:W3C` | No | W3C Extended Log Format |
| IIS / IISNATIVE | `-o:IIS` | No | IIS native log format (15-field fixed schema) |
| DATAGRID / TABLE / GRID | `-o:DATAGRID` | No | Formatted ASCII tables |
| SQLite / SQL | `-o:SQLITE` | Yes (`--ofile`) | SQLite database file |
| PostgreSQL | `-o:POSTGRESQL` | Config | PostgreSQL database (library only) |
| MySQL | `-o:MYSQL` | Config | MySQL database (library only) |
| SYSLOG | `-o:SYSLOG` | Config | Syslog via UDP/TCP (library only) |
| ODBC | `-o:ODBC` | Config | ODBC/MS Access (Windows only, library only) |
| CHART | `-o:CHART` | Yes (`--ofile`) | PNG/SVG charts (Bar, Line, Pie) |
| NAT / NATIVE | `-o:NAT` | Yes (`--ofile`) | Native binary format for re-ingestion |
| PARQUET | `-o:PARQUET` | Yes (`--ofile`) | Apache Parquet columnar format |
| CLOUDWATCH / CW | `-o:CLOUDWATCH` | Config | AWS CloudWatch Logs |
| TEMPLATE / TPL | `-o:TEMPLATE` | Template | Custom template-based output |
| NULL | `-o:NULL` | No | Discard output (benchmarking) |

## CSV / TSV

**Flags:** `-o:CSV` (default), `-o:TSV`

Comma-separated or tab-separated values output.

**Options:**
- `-headers:OFF` - Disable header row
- `-oSeparator:"|"` - Custom delimiter
- `-oCodepage:UTF8` - Output encoding (UTF8, UTF16, 1252, etc.)

**Example:**
```bash
logparser "SELECT name, age FROM users.csv"
logparser -o:TSV "SELECT * FROM data.csv"
logparser -o:CSV -oSeparator:"|" "SELECT * FROM data.csv"
```

**Output:**
```csv
name,age,city
Alice,32,New York
Bob,28,San Francisco
```

**NULL Handling:** Empty fields

---

## JSON / NDJSON

**Flags:** `-o:JSON`, `-o:NDJSON`

Newline-delimited JSON (NDJSON) format. Each row is a JSON object on its own line.

**Example:**
```bash
logparser -o:JSON "SELECT name, age FROM users.csv"
```

**Output:**
```json
{"name":"Alice","age":32,"city":"New York"}
{"name":"Bob","age":28,"city":"San Francisco"}
```

**Type Mapping:**
- Integer → Number
- Float → Number
- Boolean → Boolean
- String → String
- NULL → null
- DateTime → String (ISO 8601)

**Streaming-friendly:** Process line-by-line without loading entire array into memory.

---

## XML

**Flag:** `-o:XML`

XML document with configurable element structure.

**Options:**
- `-oStyle:element` - Values as nested elements (default)
- `-oStyle:attribute` - Values as attributes
- `-oRootElement:name` - Custom root element name (default: "results")
- `-oRowElement:name` - Custom row element name (default: "row")

**Example (element style):**
```bash
logparser -o:XML "SELECT name, age FROM users.csv"
```

**Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<results>
  <row>
    <name>Alice</name>
    <age>32</age>
  </row>
  <row>
    <name>Bob</name>
    <age>28</age>
  </row>
</results>
```

**Example (attribute style):**
```bash
logparser -o:XML -oStyle:attribute "SELECT name, age FROM users.csv"
```

**Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<results>
  <row name="Alice" age="32"/>
  <row name="Bob" age="28"/>
</results>
```

**Special Characters:** Automatically escaped (`<`, `>`, `&`, `"`, `'`)

---

## W3C / IISW3C

**Flags:** `-o:W3C`, `-o:IISW3C`

W3C Extended Log Format with directive headers.

**Example:**
```bash
logparser -o:W3C "SELECT date, time, cs_uri_stem, sc_status FROM access.log"
```

**Output:**
```
#Software: loq
#Version: 1.0
#Date: 2024-01-15 10:30:00
#Fields: date time cs_uri_stem sc_status
2024-01-15 14:30:00 /index.html 200
2024-01-15 14:30:01 /api/data 404
```

**Notes:**
- Spaces in values → `+`
- Missing values → `-`

---

## IIS / IISNATIVE

**Flags:** `-o:IIS`, `-o:IISNATIVE`

IIS native log format with fixed 15-field schema.

**Format:** Comma + space separator, no header, no quoting

**15-Field Schema (in order):**
1. client_ip
2. user_name
3. date
4. time
5. service
6. server_name
7. server_ip
8. time_taken
9. bytes_sent
10. bytes_received
11. status
12. windows_status
13. request (HTTP method)
14. target (URI stem)
15. parameters (query string)

**Example:**
```bash
logparser -o:IIS "SELECT * FROM access.log"
```

**Output:**
```
192.168.1.100, admin, 2024-01-15, 14:30:00, W3SVC1, SERVER, 10.0.0.1, 125, 1024, 512, 200, 0, GET, /api/users, id=123
192.168.1.101, -, 2024-01-15, 14:30:01, W3SVC1, SERVER, 10.0.0.1, 45, 256, 128, 404, 0, GET, /missing, -
```

**NULL Handling:** `-` (hyphen)

---

## DATAGRID / TABLE / GRID

**Flags:** `-o:DATAGRID`, `-o:TABLE`, `-o:GRID`

Formatted ASCII tables for terminal display.

**Example:**
```bash
logparser -o:DATAGRID "SELECT name, age FROM users.csv LIMIT 5"
```

**Output:**
```
+----------+-----+
| name     | age |
+----------+-----+
| Alice    | 30  |
| Bob      | 25  |
| Charlie  | 35  |
+----------+-----+
3 rows
```

**Best for:** Interactive terminal use, quick data inspection

---

## SQLite / SQL

**Flags:** `-o:SQLITE`, `-o:SQL`

Export to SQLite database file.

**Required Options:**
- `--ofile:path.db` - Database file path (required)
- `--otable:name` - Table name (default: "results")

**Example:**
```bash
logparser -o:SQLITE --ofile:analysis.db "SELECT * FROM logs.csv"
logparser -o:SQLITE --ofile:app.db --otable:users "SELECT * FROM users.csv"
```

**Type Mapping:**
- Integer → INTEGER
- Float → REAL
- Boolean → INTEGER (0/1)
- String → TEXT
- DateTime → TEXT (ISO 8601)

**Behavior:**
- Creates database if it doesn't exist
- Creates table if it doesn't exist
- Appends to existing table

**Usage after export:**
```bash
sqlite3 analysis.db "SELECT * FROM results WHERE status = 'error'"
```

---

## PostgreSQL

**Flag:** `-o:POSTGRESQL`

Export to PostgreSQL database (library only).

**Required Options:**
- `--connection:"host=localhost dbname=mydb user=myuser password=mypass"` - Connection string
- `--otable:name` - Table name

**Example:**
```bash
logparser -o:POSTGRESQL \
  --connection:"host=localhost dbname=analytics user=etl password=secret" \
  --otable:access_logs \
  "SELECT * FROM access.log"
```

**Environment Variables:**
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

**Type Mapping:**
- Integer → BIGINT
- Float → DOUBLE PRECISION
- Boolean → BOOLEAN
- String → TEXT
- DateTime → TIMESTAMP

---

## MySQL

**Flag:** `-o:MYSQL`

Export to MySQL database (library only).

**Required Options:**
- `--host:localhost` - Server hostname
- `--port:3306` - Server port (default: 3306)
- `--database:mydb` - Database name
- `--user:myuser` - Username
- `--password:mypass` - Password
- `--otable:name` - Table name

**Example:**
```bash
logparser -o:MYSQL \
  --host:localhost --database:analytics \
  --user:etl --password:secret \
  --otable:logs \
  "SELECT * FROM app.log"
```

**Type Mapping:**
- Integer → BIGINT
- Float → DOUBLE
- Boolean → TINYINT(1)
- String → TEXT
- DateTime → DATETIME

---

## SYSLOG

**Flag:** `-o:SYSLOG`

Send to syslog via UDP/TCP (library only).

**Required Options:**
- `--host:logserver` - Syslog server hostname
- `--port:514` - Syslog server port (default: 514)

**Example:**
```bash
logparser -o:SYSLOG --host:logserver --port:514 \
  "SELECT message FROM app.log WHERE severity <= 3"
```

---

## ODBC

**Flag:** `-o:ODBC`

Export to ODBC data source including MS Access (Windows only, library only).

**Required Options:**
- `--connection:"DSN=mydsn"` - ODBC connection string
- `--otable:name` - Table name

---

## CHART

**Flag:** `-o:CHART`

Generate PNG or SVG charts from query results.

**Required Options:**
- `--ofile:chart.png` - Output file (extension determines format: .png or .svg)
- `-chartType:Bar` - Chart type (Bar, Line, Pie)

**Optional:**
- `-chartTitle:"My Chart"` - Chart title

**Data Requirements:**
- At least 2 columns
- First column: Labels/categories
- Second column: Numeric values

**Example:**
```bash
logparser -o:CHART -chartType:Bar \
  -chartTitle:"HTTP Status Codes" \
  --ofile:status.png \
  "SELECT sc-status, COUNT(*) FROM access.log GROUP BY sc-status"
```

**Chart Types:**

**Bar:** Vertical bar chart for comparing categories
```bash
logparser -o:CHART -chartType:Bar --ofile:chart.png \
  "SELECT category, COUNT(*) FROM data.csv GROUP BY category"
```

**Line:** Line chart for trends and time series
```bash
logparser -o:CHART -chartType:Line --ofile:trend.png \
  "SELECT date, COUNT(*) FROM logs.csv GROUP BY date ORDER BY date"
```

**Pie:** Pie chart for proportions (3-8 categories recommended)
```bash
logparser -o:CHART -chartType:Pie --ofile:distribution.png \
  "SELECT category, SUM(amount) FROM sales.csv GROUP BY category LIMIT 5"
```

**Best Practices:**
- Use LIMIT to keep charts readable (typically 5-20 categories)
- Order bar charts by value: `ORDER BY COUNT(*) DESC`
- Order line charts by X-axis: `ORDER BY date ASC`

---

## NAT / NATIVE

**Flags:** `-o:NAT`, `-o:NATIVE`

High-performance native binary format for intermediate processing.

**Required Options:**
- `--ofile:data.nat` - Output file path

**Example:**
```bash
# Stage 1: Filter and save
logparser -o:NAT "SELECT * FROM huge.csv WHERE region = 'US'" --ofile:us_data.nat

# Stage 2: Process filtered data
logparser -i:NAT "SELECT state, SUM(sales) FROM us_data.nat GROUP BY state"
```

**Benefits:**
- Faster than CSV/JSON for large datasets
- Types preserved (no re-inference needed)
- Compact binary encoding
- Schema included in file

**Use for:** Intermediate processing, not long-term storage

---

## PARQUET

**Flag:** `-o:PARQUET`

Apache Parquet columnar format.

**Required Options:**
- `--ofile:data.parquet` - Output file path

**Example:**
```bash
logparser -o:PARQUET --ofile:data.parquet "SELECT * FROM logs.csv"
```

**Benefits:**
- Columnar storage (efficient for analytics)
- Excellent compression
- Schema preservation
- Wide ecosystem support (Spark, Arrow, pandas)

---

## CLOUDWATCH / CW

**Flags:** `-o:CLOUDWATCH`, `-o:CW`

Send to AWS CloudWatch Logs.

**Required Options:**
- `--log-group:/app/logs` - CloudWatch log group name

**Optional:**
- `--log-stream:name` - Log stream name (auto-generated if omitted)

**Authentication:** Uses AWS credential chain (env vars, ~/.aws/credentials, IAM role)

**Example:**
```bash
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

logparser -o:CLOUDWATCH --log-group:/myapp/errors \
  "SELECT timestamp, level, message FROM app.log WHERE level = 'error'"
```

**Log Event Format:** Each row sent as JSON with CloudWatch timestamp

**IAM Permissions Required:**
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`
- `logs:DescribeLogStreams`

---

## TEMPLATE / TPL

**Flags:** `-o:TEMPLATE`, `-o:TPL`

Custom template-based output with variable substitution.

**Required Options:**
- `--tpl:template.tpl` - Template file path

**Template Syntax:** Use `%fieldname%` placeholders

**Example template (report.tpl):**
```html
<tr>
  <td>%name%</td>
  <td>%age%</td>
  <td>%city%</td>
</tr>
```

**Usage:**
```bash
logparser -o:TEMPLATE --tpl:report.tpl "SELECT name, age, city FROM users.csv"
```

**Output:**
```html
<tr>
  <td>Alice</td>
  <td>32</td>
  <td>New York</td>
</tr>
<tr>
  <td>Bob</td>
  <td>28</td>
  <td>San Francisco</td>
</tr>
```

**Use Cases:**
- HTML reports
- Markdown lists
- Custom log formats
- Text templates

---

## NULL

**Flag:** `-o:NULL`

Discard output (useful for benchmarking and validation).

**Example:**
```bash
logparser -o:NULL "SELECT * FROM large_file.csv"
logparser -o:NULL --stats:ON "SELECT COUNT(*) FROM massive.csv"
```

**Use Cases:**
- Benchmark query performance without I/O overhead
- Validate query syntax
- Test input format parsing
- Count rows efficiently (with --stats:ON)

---

## Common Options

These options work across multiple output formats:

### Output File
```bash
--ofile:output.csv     # Write to file instead of stdout
```

### Headers
```bash
-headers:OFF           # Disable header row (CSV, TSV)
```

### Quiet Mode
```bash
-q:ON                  # Suppress statistics
```

### Statistics
```bash
--stats:ON             # Show execution statistics
```

### Output Codepage
```bash
-oCodepage:UTF8        # Output encoding (CSV, TSV)
-oCodepage:UTF16
-oCodepage:1252
```

---

## Output Selection Tips

**For human reading:**
- DATAGRID for terminal
- CSV for spreadsheets
- XML/JSON for structured data

**For machine processing:**
- JSON/NDJSON for APIs and streaming
- CSV for data interchange
- Parquet for analytics at scale

**For databases:**
- SQLite for local analysis
- PostgreSQL/MySQL for production systems

**For monitoring:**
- CloudWatch for AWS environments
- Syslog for centralized logging

**For visualization:**
- CHART for quick graphs
- CSV → BI tools for dashboards

**For performance:**
- NULL for benchmarking
- NATIVE for multi-stage processing

---

## Type Conversion Reference

| Source Type | CSV | JSON | XML | SQLite | PostgreSQL | MySQL |
|-------------|-----|------|-----|--------|------------|-------|
| Integer | "42" | 42 | "42" | INTEGER | BIGINT | BIGINT |
| Float | "3.14" | 3.14 | "3.14" | REAL | DOUBLE PRECISION | DOUBLE |
| Boolean | "true" | true | "true" | INTEGER (0/1) | BOOLEAN | TINYINT(1) |
| String | "text" | "text" | "text" | TEXT | TEXT | TEXT |
| NULL | (empty) | null | (empty element) | NULL | NULL | NULL |
| DateTime | ISO 8601 | ISO 8601 | ISO 8601 | TEXT (ISO 8601) | TIMESTAMP | DATETIME |

---

## INTO Clause

Use `INTO` to specify output destination inline:

```bash
# Infer format from extension
logparser "SELECT * INTO output.json FROM data.csv"
logparser "SELECT * INTO report.xml FROM logs.csv"
logparser "SELECT * INTO analysis.db FROM huge.csv"

# Explicit format
logparser "SELECT * INTO output.txt FORMAT DATAGRID FROM data.csv"
```

---

## Examples by Use Case

### Data Export
```bash
# CSV for spreadsheets
logparser -o:CSV --ofile:report.csv "SELECT * FROM logs.csv WHERE status = 'error'"

# JSON for APIs
logparser -o:JSON --ofile:data.json "SELECT * FROM users.csv"

# Parquet for analytics
logparser -o:PARQUET --ofile:data.parquet "SELECT * FROM logs.csv"
```

### Database Loading
```bash
# SQLite for analysis
logparser -o:SQLITE --ofile:analysis.db "SELECT * FROM logs.csv"

# PostgreSQL for production
logparser -o:POSTGRESQL --connection:"host=localhost dbname=mydb" \
  --otable:logs "SELECT * FROM logs.csv"
```

### Visualization
```bash
# Bar chart
logparser -o:CHART -chartType:Bar --ofile:chart.png \
  "SELECT category, COUNT(*) FROM data.csv GROUP BY category LIMIT 10"

# Line chart
logparser -o:CHART -chartType:Line --ofile:trend.png \
  "SELECT date, value FROM metrics.csv ORDER BY date"
```

### Monitoring
```bash
# Send to CloudWatch
logparser -o:CLOUDWATCH --log-group:/app/logs \
  "SELECT * FROM errors.csv WHERE level = 'error'"
```

### Custom Output
```bash
# Template-based
logparser -o:TPL --tpl:template.html "SELECT * FROM data.csv"
```
