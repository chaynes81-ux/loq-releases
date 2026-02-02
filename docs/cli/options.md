# CLI Options Reference

Complete reference for all command-line options.

## General Options

### --help

Display help information.

```bash
loq --help
```

### --version

Display version information.

```bash
loq --version
```

## Input Options

### -i:FORMAT

Specify input format.

```bash
loq -i:CSV "SELECT * FROM data.csv"
loq -i:JSON "SELECT * FROM data.json"
loq -i:W3C "SELECT * FROM access.log"
```

**Available formats:** CSV, TSV, JSON, NDJSON, XML, W3C, IISW3C, IIS, IISNATIVE, NCSA, APACHE, NGINX, SYSLOG, EVTX, EVT, FS, FILESYSTEM, REG, REGISTRY, PCAP, NETMON, TEXTLINE, TEXT, TEXTWORD, WORD, BIN, HTTPERR, URLSCAN, ETW, ADS, S3, PARQUET

### -iSeparator:SEP

Custom input field separator (for CSV-like formats).

```bash
loq -i:CSV -iSeparator:"|" "SELECT * FROM data.txt"
loq -i:CSV -iSeparator:";" "SELECT * FROM european.csv"
```

### -iHeaderRow:N

Specify which row contains headers (1-based).

```bash
# Header is on row 3 (skip first 2 rows)
loq -i:CSV -iHeaderRow:3 "SELECT * FROM data.csv"
```

### -iCodepage:CP

Input character encoding.

```bash
loq -i:CSV -iCodepage:UTF8 "SELECT * FROM data.csv"
loq -i:CSV -iCodepage:LATIN1 "SELECT * FROM data.csv"
loq -i:CSV -iCodepage:1252 "SELECT * FROM data.csv"
```

### -recurse:N

Recursive directory traversal depth.

```bash
# 1 level deep
loq -recurse:1 "SELECT * FROM 'logs/*.log'"

# 3 levels deep
loq -recurse:3 "SELECT * FROM 'logs/*.log'"

# Unlimited depth
loq -recurse:-1 "SELECT * FROM 'logs/*.log'"
```

### -iw:ON|OFF

Input wildcard mode.

```bash
loq -iw:ON "SELECT * FROM 'logs/*.csv'"
```

### -iRowElement:NAME

Row element name for XML input.

```bash
loq -i:XML -iRowElement:item "SELECT * FROM data.xml"
```

## Output Options

### -o:FORMAT

Specify output format.

```bash
loq -o:CSV "SELECT * FROM data.csv"
loq -o:JSON "SELECT * FROM data.csv"
loq -o:DATAGRID "SELECT * FROM data.csv"
```

**Available formats:** CSV, TSV, JSON, NDJSON, XML, DATAGRID, TABLE, GRID, SQLITE, SQL, POSTGRESQL, MYSQL, CHART, CLOUDWATCH, TPL, TEMPLATE, W3C, NAT, SYSLOG, PARQUET

### --ofile:PATH

Output file path.

```bash
loq -o:CSV --ofile:output.csv "SELECT * FROM data.csv"
loq -o:SQLITE --ofile:database.db "SELECT * FROM data.csv"
loq -o:CHART --ofile:chart.png "SELECT category, COUNT(*) FROM data.csv GROUP BY category"
```

### --otable:NAME

Database table name (for database outputs).

```bash
loq -o:SQLITE --ofile:db.db --otable:users "SELECT * FROM users.csv"
loq -o:SQLITE --ofile:db.db --otable:orders "SELECT * FROM orders.csv"
```

### -oSeparator:SEP

Custom output field separator.

```bash
loq -o:CSV -oSeparator:"|" "SELECT * FROM data.csv"
loq -o:CSV -oSeparator:";" "SELECT * FROM data.csv"
```

### -oCodepage:CP

Output character encoding.

```bash
loq -o:CSV -oCodepage:UTF8 "SELECT * FROM data.csv"
loq -o:CSV -oCodepage:UTF16 "SELECT * FROM data.csv"
```

### -headers:ON|OFF

Include header row in output.

```bash
# With headers (default)
loq -o:CSV "SELECT * FROM data.csv"

# Without headers
loq -o:CSV -headers:OFF "SELECT * FROM data.csv"
```

### -oStyle:STYLE

XML output style.

```bash
# Element style (default)
loq -o:XML "SELECT * FROM data.csv"

# Attribute style
loq -o:XML -oStyle:attribute "SELECT * FROM data.csv"
```

### -oRootElement:NAME

XML root element name.

```bash
loq -o:XML -oRootElement:customers "SELECT * FROM customers.csv"
```

### -oRowElement:NAME

XML row element name.

```bash
loq -o:XML -oRowElement:customer "SELECT * FROM customers.csv"
```

## Chart Options

### -chartType:TYPE

Chart type for CHART output.

```bash
loq -o:CHART -chartType:Bar --ofile:chart.png "SELECT status, COUNT(*) FROM data.csv GROUP BY status"
loq -o:CHART -chartType:Line --ofile:chart.png "SELECT date, value FROM metrics.csv ORDER BY date"
loq -o:CHART -chartType:Pie --ofile:chart.png "SELECT category, SUM(amount) FROM sales.csv GROUP BY category"
```

**Types:** Bar, Line, Pie

### -chartTitle:TITLE

Chart title.

```bash
loq -o:CHART -chartType:Bar -chartTitle:"HTTP Status Codes" --ofile:chart.png \
          "SELECT status, COUNT(*) FROM access.log GROUP BY status"
```

## Query Options

### file:PATH

Load SQL query from file.

```bash
# Create query file
echo "SELECT * FROM data.csv WHERE status = 'active'" > query.sql

# Execute
loq file:query.sql
```

### -q:ON|OFF

Quiet mode (suppress informational output).

```bash
loq -q:ON "SELECT * FROM data.csv"
```

### -stats:ON|OFF

Show execution statistics.

```bash
loq -stats:ON "SELECT * FROM data.csv"
```

Output includes:
- Rows scanned
- Rows returned
- Execution time

## Streaming Options

### --follow

Follow mode for real-time log monitoring (like `tail -f`).

```bash
loq --follow "SELECT * FROM '/var/log/app.log' WHERE level = 'error'"
```

Press Ctrl+C to stop.

## Cloud Options

### --log-group:NAME

CloudWatch Logs group name.

```bash
loq -o:CLOUDWATCH --log-group:/myapp/logs "SELECT * FROM errors.csv"
```

### --log-stream:NAME

CloudWatch Logs stream name.

```bash
loq -o:CLOUDWATCH --log-group:/myapp/logs --log-stream:import-001 \
          "SELECT * FROM errors.csv"
```

## Database Options

### --connection:STRING

PostgreSQL connection string.

```bash
loq -o:POSTGRESQL \
          --connection:"host=localhost dbname=mydb user=myuser password=mypass" \
          --otable:results \
          "SELECT * FROM data.csv"
```

### --host:HOST

MySQL host.

```bash
loq -o:MYSQL --host:localhost --database:mydb --user:myuser \
          --otable:results "SELECT * FROM data.csv"
```

### --port:PORT

Database port.

```bash
loq -o:MYSQL --host:localhost --port:3307 --database:mydb \
          "SELECT * FROM data.csv"
```

### --database:NAME

Database name.

```bash
loq -o:MYSQL --host:localhost --database:analytics \
          "SELECT * FROM data.csv"
```

### --user:NAME

Database username.

```bash
loq -o:MYSQL --host:localhost --database:mydb --user:etl \
          "SELECT * FROM data.csv"
```

### --password:PASS

Database password.

```bash
loq -o:MYSQL --host:localhost --database:mydb --user:etl --password:secret \
          "SELECT * FROM data.csv"
```

## Template Options

### --tpl:PATH

Template file path for TPL output.

```bash
loq -o:TPL --tpl:template.txt "SELECT * FROM data.csv"
```

## Multisite Options

### -multiSite:ON|OFF

Multi-threaded processing mode.

```bash
loq -multiSite:ON "SELECT * FROM 'logs/*.csv'"
```

## Log Parser 2.2 Compatibility

These options maintain compatibility with Microsoft Log Parser 2.2:

| Option | Description |
|--------|-------------|
| `-i:FORMAT` | Input format |
| `-o:FORMAT` | Output format |
| `-q:ON/OFF` | Quiet mode |
| `-stats:ON/OFF` | Statistics |
| `-headers:ON/OFF` | Headers |
| `-iCodepage:CP` | Input codepage |
| `-oCodepage:CP` | Output codepage |
| `-recurse:N` | Recursion depth |
| `file:PATH` | Query from file |

## Option Precedence

When options conflict:
1. Command-line options take precedence
2. Later options override earlier ones

```bash
# -headers:ON is overridden by -headers:OFF
loq -headers:ON -headers:OFF "SELECT * FROM data.csv"
# Result: no headers
```

## See Also

- [CLI Usage](/cli/)
- [Input Formats](/input-formats/)
- [Output Formats](/output-formats/)
