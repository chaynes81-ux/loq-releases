# SQLite Output

Export query results to a SQLite database file.

## Usage

```bash
loq -o:SQLITE --ofile:output.db "SELECT * FROM data.csv"
```

## Requirements

- `--ofile` is required (specifies database file path)
- Optional: `--otable` to specify table name (defaults to `results`)

## Basic Usage

```bash
# Create database with results table
loq -o:SQLITE --ofile:analysis.db "SELECT * FROM logs.csv"

# Specify table name
loq -o:SQLITE --ofile:analysis.db --otable:error_logs \
          "SELECT * FROM logs.csv WHERE level = 'error'"
```

## Options

### Output File

```bash
--ofile:path/to/database.db
```

Creates the file if it doesn't exist, or appends to existing database.

### Table Name

```bash
--otable:table_name
```

Default is `results`. Table is created if it doesn't exist.

## Type Mapping

| loq Type | SQLite Type |
|----------------|-------------|
| Integer | INTEGER |
| Float | REAL |
| Boolean | INTEGER (0/1) |
| String | TEXT |
| NULL | NULL |
| DateTime | TEXT (ISO 8601) |

## Examples

### Basic Export

```bash
loq -o:SQLITE --ofile:users.db "SELECT * FROM users.csv"
```

### Multiple Tables

```bash
# Create users table
loq -o:SQLITE --ofile:app.db --otable:users \
          "SELECT * FROM users.csv"

# Add orders table to same database
loq -o:SQLITE --ofile:app.db --otable:orders \
          "SELECT * FROM orders.csv"
```

### Filtered Export

```bash
loq -o:SQLITE --ofile:errors.db --otable:critical \
          "SELECT timestamp, message FROM logs.csv WHERE level = 'critical'"
```

### Aggregated Data

```bash
loq -o:SQLITE --ofile:report.db --otable:daily_stats \
          "SELECT date, COUNT(*) AS requests, AVG(response_time) AS avg_time
           FROM access.log
           GROUP BY date"
```

## Querying the Database

After export, query with SQLite tools:

### SQLite CLI

```bash
sqlite3 analysis.db "SELECT * FROM results LIMIT 10"
```

### Interactive Mode

```bash
sqlite3 analysis.db
sqlite> .tables
sqlite> .schema results
sqlite> SELECT * FROM results WHERE status = 'error';
sqlite> .exit
```

### Python

```python
import sqlite3

conn = sqlite3.connect('analysis.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM results WHERE status = 'error'")
for row in cursor.fetchall():
    print(row)
conn.close()
```

### With pandas

```python
import pandas as pd
import sqlite3

conn = sqlite3.connect('analysis.db')
df = pd.read_sql_query("SELECT * FROM results", conn)
print(df.describe())
conn.close()
```

## Advanced Usage

### Create and Query in One Session

```bash
# Export to SQLite
loq -o:SQLITE --ofile:temp.db "SELECT * FROM logs.csv"

# Run complex SQL on the result
sqlite3 temp.db "
    SELECT date, level, COUNT(*)
    FROM results
    GROUP BY date, level
    ORDER BY date, level
"
```

### Joining Multiple Sources

```bash
# Export both tables
loq -o:SQLITE --ofile:combined.db --otable:users "SELECT * FROM users.csv"
loq -o:SQLITE --ofile:combined.db --otable:orders "SELECT * FROM orders.csv"

# Query with JOIN in SQLite
sqlite3 combined.db "
    SELECT u.name, COUNT(o.id) as order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id
"
```

### Creating Indexes

After export, create indexes for faster queries:

```bash
sqlite3 analysis.db "CREATE INDEX idx_status ON results(status)"
sqlite3 analysis.db "CREATE INDEX idx_date ON results(date)"
```

## Performance Considerations

### Batch Size

Large exports are automatically batched for efficiency.

### Existing Data

If the table exists:
- New rows are appended
- Schema must match

To replace data:

```bash
# Drop and recreate
sqlite3 output.db "DROP TABLE IF EXISTS results"
loq -o:SQLITE --ofile:output.db "SELECT * FROM data.csv"
```

### Transactions

Writes use transactions for consistency and performance.

## Common Patterns

### Log Analysis Pipeline

```bash
# 1. Export logs to SQLite
loq -o:SQLITE --ofile:logs.db --otable:access \
          "SELECT * FROM access.log"

# 2. Run multiple analyses
sqlite3 logs.db "SELECT status, COUNT(*) FROM access GROUP BY status"
sqlite3 logs.db "SELECT path, AVG(response_time) FROM access GROUP BY path ORDER BY 2 DESC LIMIT 10"
sqlite3 logs.db "SELECT DATE(timestamp), COUNT(*) FROM access GROUP BY 1"
```

### Data Warehouse

```bash
# Export dimension tables
loq -o:SQLITE --ofile:warehouse.db --otable:dim_customers \
          "SELECT DISTINCT customer_id, name, region FROM orders.csv"

# Export fact table
loq -o:SQLITE --ofile:warehouse.db --otable:fact_sales \
          "SELECT * FROM sales.csv"
```

### Incremental Updates

```bash
# Add new data (appends to existing table)
loq -o:SQLITE --ofile:logs.db --otable:access \
          "SELECT * FROM today_access.log"
```

## Troubleshooting

### Table Already Exists

Data is appended to existing tables. To replace:

```bash
sqlite3 output.db "DELETE FROM results"
loq -o:SQLITE --ofile:output.db "SELECT * FROM data.csv"
```

### Schema Mismatch

If columns don't match existing table:

```bash
# Drop and recreate
sqlite3 output.db "DROP TABLE results"
loq -o:SQLITE --ofile:output.db "SELECT * FROM data.csv"
```

### Large Files

For very large exports:

```bash
# Consider WAL mode for better concurrency
sqlite3 output.db "PRAGMA journal_mode=WAL"
loq -o:SQLITE --ofile:output.db "SELECT * FROM huge.csv"
```

### File Permissions

Ensure write permission to database file and directory.

## SQLite Features

After export, leverage SQLite features:

### Full-Text Search

```sql
-- Create FTS table
CREATE VIRTUAL TABLE results_fts USING fts5(message, content='results');
INSERT INTO results_fts SELECT message FROM results;

-- Search
SELECT * FROM results_fts WHERE results_fts MATCH 'error';
```

### JSON Functions

```sql
SELECT json_extract(data, '$.name') FROM results;
```

### Window Functions

```sql
SELECT *,
       ROW_NUMBER() OVER (PARTITION BY status ORDER BY timestamp) as rn
FROM results;
```

## See Also

- [Output Formats Overview](/output-formats/)
- [PostgreSQL / MySQL](/output-formats/database)
- [CSV Output](/output-formats/csv)
