# Output Formats

loq supports 14+ output formats for exporting query results.

## Format Overview

| Format | Flag | Description | Requires File |
|--------|------|-------------|---------------|
| [CSV](/output-formats/csv) | `-o:CSV` | Comma-separated values (default) | No |
| [TSV](/output-formats/csv) | `-o:TSV` | Tab-separated values | No |
| [JSON](/output-formats/json) | `-o:JSON` | JSON objects (NDJSON) | No |
| [XML](/output-formats/xml) | `-o:XML` | XML document | No |
| DATAGRID | `-o:DATAGRID` | Formatted ASCII table | No |
| [SQLite](/output-formats/sqlite) | `-o:SQLITE` | SQLite database | Yes |
| [PostgreSQL](/output-formats/database) | `-o:POSTGRESQL` | PostgreSQL database | Config |
| [MySQL](/output-formats/database) | `-o:MYSQL` | MySQL database | Config |
| [Chart](/output-formats/chart) | `-o:CHART` | PNG/SVG charts | Yes |
| [CloudWatch](/output-formats/cloudwatch) | `-o:CLOUDWATCH` | AWS CloudWatch Logs | Config |
| [IIS](/output-formats/iis) | `-o:IIS` | IIS native log format | No |
| [Template](/output-formats/template) | `-o:TPL` | Custom templates | Template |
| W3C | `-o:W3C` | W3C extended log format | No |
| NAT | `-o:NAT` | Native binary format | Yes |
| SYSLOG | `-o:SYSLOG` | Syslog UDP/TCP | Config |

## Specifying Output Format

Use the `-o:FORMAT` flag:

```bash
# JSON output
loq -o:JSON "SELECT * FROM data.csv"

# XML output
loq -o:XML "SELECT * FROM data.csv"

# CSV is default
loq "SELECT * FROM data.csv"
```

## Output to File

Use `--ofile` to write to a file:

```bash
loq -o:CSV --ofile:output.csv "SELECT * FROM data.csv"
loq -o:JSON --ofile:output.json "SELECT * FROM data.csv"
```

Without `--ofile`, output goes to stdout.

## Format Aliases

| Canonical | Aliases |
|-----------|---------|
| `DATAGRID` | `TABLE`, `GRID` |
| `IIS` | `IISNATIVE` |
| `JSON` | `NDJSON` |
| `SQLITE` | `SQL` |
| `TEMPLATE` | `TPL` |

## Quick Examples

### CSV (Default)

```bash
loq "SELECT name, age FROM users.csv"
```

Output:
```csv
name,age
Alice,32
Bob,28
```

### JSON

```bash
loq -o:JSON "SELECT name, age FROM users.csv"
```

Output:
```json
{"name":"Alice","age":32}
{"name":"Bob","age":28}
```

### DATAGRID (Table)

```bash
loq -o:DATAGRID "SELECT name, age FROM users.csv"
```

Output:
```
+-------+-----+
| name  | age |
+-------+-----+
| Alice | 32  |
| Bob   | 28  |
+-------+-----+
```

### XML

```bash
loq -o:XML "SELECT name, age FROM users.csv"
```

Output:
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

### SQLite

```bash
loq -o:SQLITE --ofile:output.db "SELECT * FROM users.csv"
```

### IIS

```bash
loq -o:IIS "SELECT c-ip, cs-method, cs-uri-stem, sc-status FROM access.log"
```

Output:
```
192.168.1.1, GET, /index.html, 200,
192.168.1.2, POST, /api/data, 201,
```

### Chart

```bash
loq -o:CHART -chartType:Bar --ofile:chart.png \
          "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"
```

## Common Options

### Headers

```bash
# Without headers
loq -o:CSV -headers:OFF "SELECT * FROM data.csv"
```

### Output Separator

```bash
# Pipe-delimited output
loq -o:CSV -oSeparator:"|" "SELECT * FROM data.csv"
```

### Quiet Mode

```bash
# Suppress statistics
loq -q:ON "SELECT * FROM data.csv"
```

### Statistics

```bash
# Show execution statistics
loq -stats:ON "SELECT * FROM data.csv"
```

## Use Cases

### Data Export

```bash
# CSV for spreadsheets
loq -o:CSV --ofile:report.csv "SELECT * FROM logs.csv WHERE status = 'error'"

# JSON for APIs
loq -o:JSON --ofile:data.json "SELECT * FROM users.csv"

# Parquet for analytics
loq -o:PARQUET --ofile:data.parquet "SELECT * FROM logs.csv"
```

### Database Loading

```bash
# SQLite for analysis
loq -o:SQLITE --ofile:analysis.db "SELECT * FROM logs.csv"

# PostgreSQL for production
loq -o:POSTGRESQL --connection:"host=localhost dbname=mydb" \
          --otable:logs "SELECT * FROM logs.csv"
```

### Visualization

```bash
# Bar chart
loq -o:CHART -chartType:Bar --ofile:chart.png \
          "SELECT category, COUNT(*) FROM data.csv GROUP BY category"

# Line chart
loq -o:CHART -chartType:Line --ofile:trend.png \
          "SELECT date, value FROM metrics.csv ORDER BY date"
```

### Monitoring

```bash
# Send to CloudWatch
loq -o:CLOUDWATCH --log-group:/app/logs \
          "SELECT * FROM errors.csv WHERE level = 'error'"

# Send to syslog
loq -o:SYSLOG --host:logserver --port:514 \
          "SELECT message FROM app.log WHERE severity <= 3"
```

### Custom Output

```bash
# Template-based output
loq -o:TPL --tpl:template.html "SELECT * FROM data.csv"
```

## Pipeline Integration

### Unix Pipes

```bash
# Pipe to other tools
loq "SELECT * FROM data.csv" | grep error

# Pipe to jq for JSON processing
loq -o:JSON "SELECT * FROM data.csv" | jq '.name'
```

### Chained Queries

```bash
# First query to file, second query from file
loq -o:CSV --ofile:temp.csv "SELECT * FROM data.csv WHERE status = 'active'"
loq "SELECT * FROM temp.csv ORDER BY date"
```

## See Also

- [CSV / TSV](/output-formats/csv)
- [IIS](/output-formats/iis)
- [JSON](/output-formats/json)
- [XML](/output-formats/xml)
- [SQLite](/output-formats/sqlite)
- [PostgreSQL / MySQL](/output-formats/database)
- [Chart](/output-formats/chart)
- [CloudWatch](/output-formats/cloudwatch)
- [Template](/output-formats/template)
