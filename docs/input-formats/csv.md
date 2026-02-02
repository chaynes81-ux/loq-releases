# CSV / TSV

Parse comma-separated values (CSV) and tab-separated values (TSV) files with automatic type inference.

## Usage

```bash
# CSV (default format)
loq "SELECT * FROM data.csv"
loq -i:CSV "SELECT * FROM data.csv"

# TSV
loq -i:TSV "SELECT * FROM data.tsv"
```

## File Format

### CSV Example

```csv
name,age,city,salary
Alice,32,New York,75000
Bob,28,San Francisco,85000
Carol,35,Chicago,70000
```

### TSV Example

```tsv
name	age	city	salary
Alice	32	New York	75000
Bob	28	San Francisco	85000
Carol	35	Chicago	70000
```

## Features

### Automatic Type Inference

loq automatically detects column types:

| Value | Detected Type |
|-------|---------------|
| `42`, `-100` | Integer |
| `3.14`, `-0.5` | Float |
| `true`, `false` | Boolean |
| Everything else | String |

### Header Row

The first row is treated as column headers by default:

```csv
name,age,city
Alice,32,New York
```

Columns are accessible by name:

```sql
SELECT name, age FROM data.csv WHERE city = 'New York'
```

### Quoted Fields

Fields containing commas, quotes, or newlines should be quoted:

```csv
name,description,price
Widget,"A small, useful item",9.99
Gadget,"Contains ""special"" characters",19.99
```

### Empty Values

Empty fields are parsed as NULL:

```csv
name,email,phone
Alice,alice@example.com,555-1234
Bob,,555-5678
Carol,carol@example.com,
```

```sql
SELECT * FROM data.csv WHERE email IS NULL
-- Returns: Bob
```

## Options

### Custom Delimiter

```bash
# Pipe-delimited
loq -i:CSV -iSeparator:"|" "SELECT * FROM data.txt"

# Semicolon-delimited (common in European CSV)
loq -i:CSV -iSeparator:";" "SELECT * FROM data.csv"
```

### Skip Header Rows

```bash
# Skip first 2 rows before header
loq -i:CSV -iHeaderRow:3 "SELECT * FROM data.csv"
```

### Input Codepage

```bash
# UTF-8 (default)
loq -i:CSV -iCodepage:UTF8 "SELECT * FROM data.csv"

# Latin-1
loq -i:CSV -iCodepage:LATIN1 "SELECT * FROM data.csv"

# Windows-1252
loq -i:CSV -iCodepage:1252 "SELECT * FROM data.csv"
```

## Schema Detection

loq samples the first 100 rows to infer column types. The most specific type that fits all values is chosen:

1. **Integer** - All values are whole numbers
2. **Float** - All values are numbers (including decimals)
3. **Boolean** - All values are true/false
4. **String** - Default fallback

### Type Coercion

Mixed types promote to the more general type:

```csv
value
42
3.14
100
```

Results in `Float` type (integers can be represented as floats).

### Forcing Types

Use SQL functions to convert types:

```sql
SELECT
    CAST(id AS INTEGER) AS id,
    TO_TIMESTAMP(date_str, '%Y-%m-%d') AS date
FROM data.csv
```

## Examples

### Basic Query

```bash
loq "SELECT * FROM users.csv LIMIT 10"
```

### Filtering

```bash
loq "SELECT name, salary FROM employees.csv WHERE salary > 50000"
```

### Aggregation

```bash
loq "SELECT department, COUNT(*), AVG(salary)
           FROM employees.csv
           GROUP BY department"
```

### Sorting

```bash
loq "SELECT * FROM products.csv ORDER BY price DESC LIMIT 20"
```

### Multiple Files

```bash
# Using wildcards
loq "SELECT * FROM 'logs/*.csv'"

# With recursive option
loq -recurse:2 "SELECT * FROM 'logs/*.csv'"
```

### Joining CSV Files

```bash
loq "SELECT u.name, o.total
           FROM users.csv u
           JOIN orders.csv o ON u.id = o.user_id"
```

## Output

### CSV Output (Default)

```bash
loq "SELECT name, age FROM users.csv"
```

Output:
```csv
name,age
Alice,32
Bob,28
```

### Other Formats

```bash
# JSON output
loq -o:JSON "SELECT * FROM users.csv"

# Table format
loq -o:DATAGRID "SELECT * FROM users.csv"
```

## Performance

CSV parsing is optimized for performance:

- **64KB I/O buffers** reduce system calls
- **Pre-allocated vectors** minimize memory allocations
- **Fast-path type parsing** for common cases
- **Parallel processing** for large files (10K+ rows)

### Tips for Large Files

```bash
# Use LIMIT during exploration
loq "SELECT * FROM huge.csv LIMIT 100"

# Filter early to reduce data
loq "SELECT * FROM huge.csv WHERE status = 'error'"

# Select only needed columns
loq "SELECT id, message FROM huge.csv"
```

## Troubleshooting

### Wrong Column Types

If columns are detected as wrong type:

```sql
-- Force integer parsing
SELECT CAST(id AS INTEGER) FROM data.csv

-- Force date parsing
SELECT TO_TIMESTAMP(date_col, '%Y-%m-%d') FROM data.csv
```

### Encoding Issues

For non-UTF-8 files:

```bash
loq -i:CSV -iCodepage:LATIN1 "SELECT * FROM data.csv"
```

### Missing Headers

If the file has no header row, columns are named `column1`, `column2`, etc.

### Quoted Delimiter Issues

Ensure fields with delimiters are properly quoted:

```csv
# Correct
"Smith, John",42

# Incorrect (will split incorrectly)
Smith, John,42
```

## See Also

- [Input Formats Overview](/input-formats/)
- [JSON Format](/input-formats/json)
- [CSV Output](/output-formats/csv)
