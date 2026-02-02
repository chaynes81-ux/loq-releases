# PostgreSQL / MySQL Output

Export query results directly to PostgreSQL or MySQL databases.

## PostgreSQL

### Usage

```bash
loq -o:POSTGRESQL --connection:"host=localhost dbname=mydb" \
          --otable:results \
          "SELECT * FROM data.csv"
```

### Connection String

PostgreSQL connection string format:

```bash
--connection:"host=localhost port=5432 dbname=mydb user=myuser password=mypass"
```

Parameters:
- `host`: Database server hostname
- `port`: Port (default: 5432)
- `dbname`: Database name
- `user`: Username
- `password`: Password

### Environment Variables

Alternatively, use standard PostgreSQL environment variables:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=mydb
export PGUSER=myuser
export PGPASSWORD=mypass

loq -o:POSTGRESQL --otable:results "SELECT * FROM data.csv"
```

### Examples

```bash
# Basic export
loq -o:POSTGRESQL \
          --connection:"host=localhost dbname=analytics user=etl password=secret" \
          --otable:access_logs \
          "SELECT * FROM access.log"

# Filtered export
loq -o:POSTGRESQL \
          --connection:"host=db.example.com dbname=prod user=app" \
          --otable:errors \
          "SELECT timestamp, level, message FROM logs.csv WHERE level = 'error'"

# Aggregated data
loq -o:POSTGRESQL \
          --connection:"host=localhost dbname=reports" \
          --otable:daily_summary \
          "SELECT date, COUNT(*) as requests, AVG(duration) as avg_time
           FROM access.log
           GROUP BY date"
```

### Type Mapping

| loq Type | PostgreSQL Type |
|----------------|-----------------|
| Integer | BIGINT |
| Float | DOUBLE PRECISION |
| Boolean | BOOLEAN |
| String | TEXT |
| NULL | NULL |
| DateTime | TIMESTAMP |

## MySQL

### Usage

```bash
loq -o:MYSQL \
          --host:localhost --port:3306 \
          --database:mydb --user:myuser --password:mypass \
          --otable:results \
          "SELECT * FROM data.csv"
```

### Connection Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--host` | Server hostname | localhost |
| `--port` | Server port | 3306 |
| `--database` | Database name | required |
| `--user` | Username | required |
| `--password` | Password | empty |

### Examples

```bash
# Basic export
loq -o:MYSQL \
          --host:localhost --database:analytics \
          --user:etl --password:secret \
          --otable:logs \
          "SELECT * FROM app.log"

# Remote server
loq -o:MYSQL \
          --host:db.example.com --port:3306 \
          --database:production --user:app \
          --otable:events \
          "SELECT * FROM events.csv"
```

### Type Mapping

| loq Type | MySQL Type |
|----------------|------------|
| Integer | BIGINT |
| Float | DOUBLE |
| Boolean | TINYINT(1) |
| String | TEXT |
| NULL | NULL |
| DateTime | DATETIME |

## Common Features

### Table Creation

Tables are created automatically with appropriate column types based on the query results.

### Existing Tables

If the table exists:
- New rows are **appended**
- Schema must be compatible

To replace data, drop the table first:

```bash
# PostgreSQL
psql -c "DROP TABLE IF EXISTS results" mydb
loq -o:POSTGRESQL --connection:"..." --otable:results "SELECT * FROM data.csv"

# MySQL
mysql -e "DROP TABLE IF EXISTS results" mydb
loq -o:MYSQL --database:mydb --otable:results "SELECT * FROM data.csv"
```

### Transactions

Inserts are wrapped in transactions for:
- Consistency (all-or-nothing)
- Performance (fewer commits)

### Batch Inserts

Large exports use batch inserts for efficiency.

## ETL Patterns

### Extract, Transform, Load

```bash
# Extract and transform with loq, load to PostgreSQL
loq -o:POSTGRESQL \
          --connection:"host=warehouse dbname=dwh user=etl" \
          --otable:fact_sales \
          "SELECT
               date,
               customer_id,
               UPPER(category) AS category,
               ROUND(amount, 2) AS amount
           FROM raw_sales.csv
           WHERE amount > 0"
```

### Incremental Load

```bash
# Load only new records
loq -o:POSTGRESQL \
          --connection:"host=localhost dbname=logs" \
          --otable:access_logs \
          "SELECT * FROM today.log"
```

### Dimension Tables

```bash
# Load dimension table
loq -o:POSTGRESQL \
          --connection:"host=localhost dbname=dwh" \
          --otable:dim_customers \
          "SELECT DISTINCT
               customer_id,
               customer_name,
               region
           FROM orders.csv"
```

## Security

### Password Handling

Avoid passwords in command line (visible in process list):

```bash
# PostgreSQL: use .pgpass file
echo "localhost:5432:mydb:myuser:mypass" >> ~/.pgpass
chmod 600 ~/.pgpass

# MySQL: use .my.cnf
echo "[client]
password=mypass" >> ~/.my.cnf
chmod 600 ~/.my.cnf
```

### SSL/TLS

PostgreSQL:
```bash
--connection:"host=db.example.com dbname=mydb sslmode=require"
```

MySQL:
```bash
--ssl-mode:required
```

## Troubleshooting

### Connection Failed

1. Verify server is running
2. Check hostname and port
3. Verify credentials
4. Check firewall rules
5. Verify SSL requirements

```bash
# Test PostgreSQL connection
psql -h localhost -U myuser -d mydb -c "SELECT 1"

# Test MySQL connection
mysql -h localhost -u myuser -p mydb -e "SELECT 1"
```

### Permission Denied

Ensure user has:
- `CREATE TABLE` permission (for new tables)
- `INSERT` permission (for data)

```sql
-- PostgreSQL
GRANT CREATE, INSERT ON SCHEMA public TO myuser;

-- MySQL
GRANT CREATE, INSERT ON mydb.* TO 'myuser'@'localhost';
```

### Type Mismatch

If existing table has incompatible types:

1. Drop and recreate the table
2. Or modify the existing schema

### Large Exports

For very large exports:

```bash
# Use smaller batches (implementation-dependent)
# Or export to CSV first, then bulk load

loq -o:CSV --ofile:temp.csv "SELECT * FROM huge.csv"
psql -c "\COPY results FROM 'temp.csv' CSV HEADER" mydb
```

## Alternatives

### SQLite for Local Analysis

For local analysis, SQLite is simpler:

```bash
loq -o:SQLITE --ofile:analysis.db "SELECT * FROM data.csv"
```

### CSV for Bulk Load

For maximum performance, export to CSV and use database bulk load:

```bash
# Export to CSV
loq -o:CSV --ofile:data.csv "SELECT * FROM source.csv"

# PostgreSQL COPY
psql -c "\COPY table FROM 'data.csv' CSV HEADER" mydb

# MySQL LOAD DATA
mysql -e "LOAD DATA INFILE 'data.csv' INTO TABLE table FIELDS TERMINATED BY ','" mydb
```

## See Also

- [Output Formats Overview](/output-formats/)
- [SQLite Output](/output-formats/sqlite)
- [CSV Output](/output-formats/csv)
