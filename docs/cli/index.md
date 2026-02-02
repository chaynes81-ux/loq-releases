# CLI Reference

loq provides a command-line interface compatible with Microsoft Log Parser 2.2.

## Basic Syntax

```bash
loq [options] "SQL_QUERY"
loq [options] file:query.sql
```

## Quick Examples

```bash
# Basic query
loq "SELECT * FROM data.csv"

# With input format
loq -i:JSON "SELECT * FROM data.json"

# With output format
loq -o:JSON "SELECT * FROM data.csv"

# Output to file
loq -o:CSV --ofile:output.csv "SELECT * FROM data.csv"

# Query from file
loq file:query.sql
```

## Help

```bash
loq --help
loq --version
```

## Input Options

| Option | Description | Example |
|--------|-------------|---------|
| `-i:FORMAT` | Input format | `-i:CSV`, `-i:JSON`, `-i:W3C` |
| `-iSeparator:SEP` | Input field separator | `-iSeparator:"|"` |
| `-iHeaderRow:N` | Header row number | `-iHeaderRow:2` |
| `-iCodepage:CP` | Input encoding | `-iCodepage:UTF8` |
| `-recurse:N` | Recursive depth | `-recurse:3`, `-recurse:-1` (unlimited) |
| `-iw:ON/OFF` | Input wildcard mode | `-iw:ON` |

## Output Options

| Option | Description | Example |
|--------|-------------|---------|
| `-o:FORMAT` | Output format | `-o:CSV`, `-o:JSON`, `-o:SQLITE` |
| `--ofile:PATH` | Output file path | `--ofile:output.csv` |
| `--otable:NAME` | Database table name | `--otable:results` |
| `-oSeparator:SEP` | Output field separator | `-oSeparator:"|"` |
| `-oCodepage:CP` | Output encoding | `-oCodepage:UTF8` |
| `-headers:ON/OFF` | Include header row | `-headers:OFF` |

## Query Options

| Option | Description | Example |
|--------|-------------|---------|
| `file:PATH` | Load query from file | `file:query.sql` |
| `-q:ON/OFF` | Quiet mode | `-q:ON` |
| `-stats:ON/OFF` | Show statistics | `-stats:ON` |

## Chart Options

| Option | Description | Example |
|--------|-------------|---------|
| `-chartType:TYPE` | Chart type | `-chartType:Bar`, `-chartType:Line`, `-chartType:Pie` |
| `-chartTitle:TITLE` | Chart title | `-chartTitle:"My Chart"` |

## Streaming Options

| Option | Description | Example |
|--------|-------------|---------|
| `--follow` | Follow mode (tail -f style) | `--follow` |

## Cloud Options

| Option | Description | Example |
|--------|-------------|---------|
| `--log-group:NAME` | CloudWatch log group | `--log-group:/app/logs` |
| `--log-stream:NAME` | CloudWatch log stream | `--log-stream:my-stream` |

## Examples by Category

### Basic Queries

```bash
# Select all
loq "SELECT * FROM data.csv"

# Select columns
loq "SELECT name, age FROM users.csv"

# Filter
loq "SELECT * FROM users.csv WHERE age > 30"

# Sort and limit
loq "SELECT * FROM users.csv ORDER BY age DESC LIMIT 10"
```

### Input Formats

```bash
# CSV (default)
loq "SELECT * FROM data.csv"

# JSON
loq -i:JSON "SELECT * FROM data.json"

# W3C logs
loq -i:W3C "SELECT * FROM access.log"

# Filesystem
loq -i:FS "SELECT * FROM '/var/log'"

# EVTX
loq -i:EVTX "SELECT * FROM System.evtx"

# S3
loq -i:S3 "SELECT * FROM 's3://bucket/key.csv'"
```

### Output Formats

```bash
# JSON output
loq -o:JSON "SELECT * FROM data.csv"

# Table output
loq -o:DATAGRID "SELECT * FROM data.csv"

# SQLite
loq -o:SQLITE --ofile:output.db "SELECT * FROM data.csv"

# Chart
loq -o:CHART -chartType:Bar --ofile:chart.png \
          "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"
```

### File Operations

```bash
# Output to file
loq -o:CSV --ofile:results.csv "SELECT * FROM data.csv"

# Query from file
cat > query.sql << 'EOF'
SELECT name, age
FROM users.csv
WHERE age > 30
ORDER BY age DESC
EOF
loq file:query.sql

# Multiple files with wildcards
loq "SELECT * FROM 'logs/*.csv'"

# Recursive
loq -recurse:3 "SELECT * FROM 'logs/*.log'"
```

### Aggregation

```bash
# Count
loq "SELECT COUNT(*) FROM data.csv"

# Group by
loq "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"

# Multiple aggregates
loq "SELECT category, COUNT(*), SUM(amount), AVG(amount)
           FROM sales.csv
           GROUP BY category"
```

### JOINs

```bash
# Inner join
loq "SELECT u.name, o.total
           FROM users.csv u
           JOIN orders.csv o ON u.id = o.user_id"

# Left join
loq "SELECT u.name, COALESCE(o.total, 0) as total
           FROM users.csv u
           LEFT JOIN orders.csv o ON u.id = o.user_id"
```

### Window Functions

```bash
# Ranking
loq "SELECT name, salary,
                  RANK() OVER (ORDER BY salary DESC) as rank
           FROM employees.csv"

# Partitioned ranking
loq "SELECT name, dept, salary,
                  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as dept_rank
           FROM employees.csv"
```

### Streaming Mode

```bash
# Follow log file
loq --follow "SELECT * FROM '/var/log/app.log' WHERE level = 'error'"
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region |
| `AWS_PROFILE` | AWS profile name |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Parse error (invalid SQL) |
| 3 | Execution error |
| 4 | File not found |

## Combining with Unix Tools

```bash
# Pipe to grep
loq -o:CSV "SELECT * FROM logs.csv" | grep error

# Pipe to jq
loq -o:JSON "SELECT * FROM data.csv" | jq '.name'

# Count results
loq -o:CSV -headers:OFF "SELECT * FROM data.csv" | wc -l

# Sort externally
loq -o:CSV -headers:OFF "SELECT * FROM data.csv" | sort -t',' -k2
```

## Performance Tips

```bash
# Select only needed columns
loq "SELECT id, name FROM huge.csv"  # faster than SELECT *

# Use LIMIT for exploration
loq "SELECT * FROM huge.csv LIMIT 100"

# Filter early
loq "SELECT * FROM huge.csv WHERE status = 'active'"
```

## See Also

- [CLI Options](/cli/options) - Detailed option reference
- [Input Formats](/input-formats/)
- [Output Formats](/output-formats/)
