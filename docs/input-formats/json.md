# JSON / NDJSON

Parse JSON arrays and newline-delimited JSON (NDJSON) files with automatic nested object flattening.

## Usage

```bash
# JSON array
loq -i:JSON "SELECT * FROM data.json"

# NDJSON (newline-delimited)
loq -i:NDJSON "SELECT * FROM data.ndjson"
```

## Supported Formats

### JSON Array

A file containing a JSON array of objects:

```json
[
  {"name": "Alice", "age": 32, "city": "New York"},
  {"name": "Bob", "age": 28, "city": "San Francisco"},
  {"name": "Carol", "age": 35, "city": "Chicago"}
]
```

### NDJSON (Newline-Delimited JSON)

Each line is a separate JSON object:

```json
{"name": "Alice", "age": 32, "city": "New York"}
{"name": "Bob", "age": 28, "city": "San Francisco"}
{"name": "Carol", "age": 35, "city": "Chicago"}
```

NDJSON is common in:
- Log aggregation systems
- Streaming APIs
- Database exports

## Nested Object Flattening

Nested objects are automatically flattened with dot notation:

### Input

```json
[
  {
    "user": {
      "name": "Alice",
      "address": {
        "city": "New York",
        "zip": "10001"
      }
    },
    "active": true
  }
]
```

### Resulting Columns

| Column | Value |
|--------|-------|
| `user.name` | Alice |
| `user.address.city` | New York |
| `user.address.zip` | 10001 |
| `active` | true |

### Query

```sql
SELECT "user.name", "user.address.city" FROM data.json WHERE active = true
```

::: tip
Column names with dots must be quoted with double quotes.
:::

## Type Mapping

| JSON Type | loq Type |
|-----------|----------------|
| string | String |
| number (integer) | Integer |
| number (decimal) | Float |
| boolean | Boolean |
| null | Null |
| array | String (JSON representation) |
| object | Flattened |

### Arrays

Arrays are converted to their JSON string representation:

```json
{"name": "Alice", "tags": ["admin", "user"]}
```

| Column | Value |
|--------|-------|
| name | Alice |
| tags | ["admin", "user"] |

## Examples

### Basic Query

```bash
loq -i:JSON "SELECT * FROM users.json"
```

### Filter and Select

```bash
loq -i:JSON "SELECT name, email FROM users.json WHERE active = true"
```

### Nested Fields

```bash
loq -i:JSON "SELECT \"user.name\", \"user.email\" FROM data.json"
```

### Aggregation

```bash
loq -i:JSON "SELECT status, COUNT(*) FROM events.json GROUP BY status"
```

### NDJSON Processing

```bash
# Process streaming logs
loq -i:NDJSON "SELECT level, message FROM app.log WHERE level = 'error'"

# Aggregate by timestamp
loq -i:NDJSON "SELECT SUBSTR(timestamp, 1, 10) AS date, COUNT(*)
                     FROM events.ndjson
                     GROUP BY date"
```

### API Response Analysis

```bash
# Assuming you've saved an API response
curl -s https://api.example.com/users > users.json

loq -i:JSON "SELECT id, name, status FROM users.json ORDER BY id"
```

## Schema Detection

loq analyzes the JSON structure to determine the schema:

1. Scans all objects (or sample for large files)
2. Collects all unique keys
3. Infers types from values
4. Flattens nested objects

### Heterogeneous Objects

Objects don't need identical structure:

```json
[
  {"name": "Alice", "age": 32},
  {"name": "Bob", "email": "bob@example.com"},
  {"name": "Carol", "age": 35, "city": "Chicago"}
]
```

Resulting schema: `name`, `age`, `email`, `city` (missing values are NULL)

## Common Patterns

### Log Analysis

```bash
# Error logs
loq -i:NDJSON "SELECT timestamp, message
                     FROM app.log
                     WHERE level = 'error'
                     ORDER BY timestamp DESC
                     LIMIT 100"

# Request statistics
loq -i:NDJSON "SELECT method, path, COUNT(*), AVG(duration)
                     FROM access.log
                     GROUP BY method, path
                     ORDER BY COUNT(*) DESC"
```

### API Data Processing

```bash
# Filter and transform
loq -i:JSON "SELECT id, UPPER(name) AS name, status
                   FROM users.json
                   WHERE status != 'deleted'"

# Join related data
loq -i:JSON "SELECT u.name, o.total
                   FROM users.json u
                   JOIN orders.json o ON u.id = o.user_id"
```

### Configuration Analysis

```bash
# Analyze config files
loq -i:JSON "SELECT \"server.port\", \"server.host\"
                   FROM config.json"
```

## Performance Tips

### Large Files

For large JSON files:

```bash
# Use LIMIT during exploration
loq -i:JSON "SELECT * FROM large.json LIMIT 100"

# Filter early
loq -i:JSON "SELECT * FROM large.json WHERE timestamp > '2024-01-01'"
```

### NDJSON vs JSON Array

NDJSON is more memory-efficient for large files because:
- Objects are parsed one at a time
- No need to load entire array into memory

Prefer NDJSON for:
- Log files
- Large datasets
- Streaming data

## Troubleshooting

### Invalid JSON

```bash
# Check for syntax errors
loq -i:JSON "SELECT * FROM data.json"
# Error: Invalid JSON at line 42
```

Fix: Validate JSON with `jq` or online tools.

### Nested Keys Not Found

Remember to quote column names with dots:

```sql
-- Wrong
SELECT user.name FROM data.json

-- Correct
SELECT "user.name" FROM data.json
```

### Encoding Issues

JSON should be UTF-8. For other encodings:

```bash
# Convert first
iconv -f LATIN1 -t UTF-8 data.json > data_utf8.json
loq -i:JSON "SELECT * FROM data_utf8.json"
```

### Deeply Nested Objects

Very deep nesting creates long column names:

```
root.level1.level2.level3.level4.value
```

Use aliases:

```sql
SELECT "root.level1.level2.level3.level4.value" AS deep_value
FROM data.json
```

## See Also

- [Input Formats Overview](/input-formats/)
- [CSV Format](/input-formats/csv)
- [JSON Output](/output-formats/json)
