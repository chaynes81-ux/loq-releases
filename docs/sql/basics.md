# SELECT, WHERE, LIMIT

This page covers the fundamental SQL clauses for selecting and filtering data.

## SELECT

The SELECT clause specifies which columns to retrieve.

### Select All Columns

```sql
SELECT * FROM users.csv
```

### Select Specific Columns

```sql
SELECT name, email, age FROM users.csv
```

### Column Aliases

Use `AS` to rename columns in the output:

```sql
SELECT name AS user_name, age AS user_age FROM users.csv
```

The `AS` keyword is optional:

```sql
SELECT name user_name, age user_age FROM users.csv
```

### Expressions

Perform calculations in SELECT:

```sql
SELECT
    name,
    price,
    quantity,
    price * quantity AS total
FROM orders.csv
```

### Functions

Apply functions to columns:

```sql
SELECT
    UPPER(name) AS name,
    ROUND(price, 2) AS price,
    LENGTH(description) AS desc_length
FROM products.csv
```

### DISTINCT

Remove duplicate rows:

```sql
-- Unique cities
SELECT DISTINCT city FROM users.csv

-- Unique combinations
SELECT DISTINCT city, country FROM users.csv
```

## FROM

The FROM clause specifies the data source.

### File Paths

```sql
-- Relative path
SELECT * FROM users.csv

-- With quotes (recommended for paths with spaces)
SELECT * FROM 'my data/users.csv'

-- Absolute path
SELECT * FROM '/var/log/app.csv'
```

### Table Aliases

Aliases simplify queries, especially with JOINs:

```sql
SELECT u.name, u.email
FROM users.csv u
WHERE u.age > 30
```

### Multiple Files (with JOIN)

```sql
SELECT u.name, o.total
FROM users.csv u
JOIN orders.csv o ON u.id = o.user_id
```

## WHERE

The WHERE clause filters rows.

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal | `WHERE status = 'active'` |
| `!=` | Not equal | `WHERE status != 'deleted'` |
| `<>` | Not equal (alternate) | `WHERE status <> 'deleted'` |
| `<` | Less than | `WHERE age < 30` |
| `>` | Greater than | `WHERE age > 18` |
| `<=` | Less than or equal | `WHERE price <= 100` |
| `>=` | Greater than or equal | `WHERE score >= 90` |

### Examples

```sql
-- Numeric comparison
SELECT * FROM users.csv WHERE age > 30

-- String comparison
SELECT * FROM users.csv WHERE city = 'New York'

-- Date comparison
SELECT * FROM logs.csv WHERE date > '2024-01-01'
```

### Logical Operators

#### AND

Both conditions must be true:

```sql
SELECT * FROM users.csv
WHERE age > 18 AND city = 'New York'
```

#### OR

Either condition can be true:

```sql
SELECT * FROM users.csv
WHERE city = 'New York' OR city = 'Los Angeles'
```

#### NOT

Negates a condition:

```sql
SELECT * FROM users.csv
WHERE NOT status = 'deleted'
```

### Complex Conditions

Use parentheses for complex logic:

```sql
SELECT * FROM users.csv
WHERE (city = 'New York' OR city = 'Los Angeles')
  AND age >= 21
  AND status = 'active'
```

### BETWEEN

Range check (inclusive):

```sql
-- Age between 18 and 65
SELECT * FROM users.csv WHERE age BETWEEN 18 AND 65

-- Equivalent to:
SELECT * FROM users.csv WHERE age >= 18 AND age <= 65

-- Date range
SELECT * FROM logs.csv
WHERE date BETWEEN '2024-01-01' AND '2024-12-31'
```

### IN

Check if value is in a list:

```sql
SELECT * FROM users.csv
WHERE city IN ('New York', 'Los Angeles', 'Chicago')

-- Equivalent to:
SELECT * FROM users.csv
WHERE city = 'New York'
   OR city = 'Los Angeles'
   OR city = 'Chicago'
```

`NOT IN` excludes values:

```sql
SELECT * FROM users.csv
WHERE status NOT IN ('deleted', 'banned')
```

### LIKE

Pattern matching for strings:

| Pattern | Matches |
|---------|---------|
| `%` | Zero or more characters |
| `_` | Exactly one character |

```sql
-- Names starting with 'J'
SELECT * FROM users.csv WHERE name LIKE 'J%'

-- Names ending with 'son'
SELECT * FROM users.csv WHERE name LIKE '%son'

-- Names containing 'ann'
SELECT * FROM users.csv WHERE name LIKE '%ann%'

-- Three-letter names starting with 'J'
SELECT * FROM users.csv WHERE name LIKE 'J__'
```

`NOT LIKE` excludes matches:

```sql
SELECT * FROM logs.csv
WHERE message NOT LIKE '%debug%'
```

### IS NULL / IS NOT NULL

Check for NULL values:

```sql
-- Find records with missing email
SELECT * FROM users.csv WHERE email IS NULL

-- Find records with email
SELECT * FROM users.csv WHERE email IS NOT NULL
```

::: warning
Don't use `= NULL` or `!= NULL`. Always use `IS NULL` or `IS NOT NULL`.
:::

## LIMIT

Restrict the number of rows returned:

```sql
-- First 10 rows
SELECT * FROM users.csv LIMIT 10

-- With ORDER BY for top N
SELECT * FROM users.csv
ORDER BY score DESC
LIMIT 5
```

## TOP (MS Log Parser Compatible)

TOP is an alternative to LIMIT that provides Microsoft Log Parser 2.2 compatibility:

```sql
-- First 10 rows (same as LIMIT 10)
SELECT TOP 10 * FROM users.csv

-- With ORDER BY for top N
SELECT TOP 5 *
FROM users.csv
ORDER BY score DESC
```

TOP appears right after SELECT, before the column list. Both TOP and LIMIT achieve the same result - use whichever you prefer or need for script compatibility.

## INTO (Output Routing)

The INTO clause specifies where to write output, making queries self-contained:

```sql
-- Write results to a CSV file
SELECT * INTO output.csv FROM users.csv

-- Write to JSON (format inferred from extension)
SELECT name, score INTO results.json FROM users.csv

-- Write to SQLite database (format inferred from .db extension)
SELECT TOP 100 * INTO analysis.db FROM 'logs/access.log'

-- Write to XML
SELECT * INTO report.xml FROM data.csv WHERE status = 'active'
```

### Format Inference

The output format is automatically inferred from the file extension:

| Extension | Format |
|-----------|--------|
| `.csv` | CSV |
| `.tsv`, `.tab` | TSV |
| `.json`, `.ndjson` | JSON (NDJSON) |
| `.xml` | XML |
| `.db`, `.sqlite`, `.sqlite3` | SQLite |
| `.png`, `.svg` | Chart |
| `.parquet` | Parquet |
| `.nat` | Native binary |

You can override format inference with the `-o` option:

```bash
loq -o:XML "SELECT * INTO output.txt FROM data.csv"
```

### INTO with Full Paths

For paths containing forward slashes, quote the destination:

```bash
loq "SELECT * INTO '/tmp/results.csv' FROM 'data/input.csv'"
```

### MS Log Parser Compatibility

INTO provides full compatibility with MS Log Parser 2.2 scripts:

```sql
-- Classic Log Parser syntax works
SELECT TOP 1000 *
INTO filtered.csv
FROM 'C:\Logs\access.log'
WHERE sc-status >= 500

-- Write aggregate results to database
SELECT cs-uri-stem, COUNT(*) AS hits
INTO stats.db
FROM 'access.log'
GROUP BY cs-uri-stem
ORDER BY hits DESC
```

## Combining Clauses

A complete query combining all clauses:

```sql
SELECT
    name,
    city,
    score,
    ROUND(score * 1.1, 1) AS adjusted_score
FROM users.csv
WHERE age >= 18
  AND city IN ('New York', 'Chicago')
  AND email IS NOT NULL
  AND name LIKE 'J%'
ORDER BY score DESC
LIMIT 20
```

## Best Practices

### 1. Quote File Paths

Always quote paths with spaces or special characters:

```sql
-- Good
SELECT * FROM 'my data/users.csv'

-- May fail
SELECT * FROM my data/users.csv
```

### 2. Use Meaningful Aliases

```sql
-- Good
SELECT customer_name AS name, order_total AS total

-- Less clear
SELECT customer_name AS cn, order_total AS ot
```

### 3. Filter Early

Put more selective conditions first:

```sql
-- Better: checks status first (likely indexed/faster)
WHERE status = 'active' AND name LIKE 'J%'

-- Worse: pattern match first (slower)
WHERE name LIKE 'J%' AND status = 'active'
```

### 4. Use BETWEEN for Ranges

```sql
-- Good
WHERE age BETWEEN 18 AND 65

-- Less readable
WHERE age >= 18 AND age <= 65
```

### 5. Use IN for Multiple Values

```sql
-- Good
WHERE city IN ('NYC', 'LA', 'Chicago')

-- Less readable
WHERE city = 'NYC' OR city = 'LA' OR city = 'Chicago'
```

## Related Documentation

- [Aggregation](/sql/aggregation) - GROUP BY, HAVING, ORDER BY
- [Functions](/functions/) - All built-in functions
- [Input Formats](/input-formats/) - Supported file formats
