# CSV / TSV Output

Export query results as comma-separated values (CSV) or tab-separated values (TSV).

## Usage

```bash
# CSV (default)
loq "SELECT * FROM data.csv"
loq -o:CSV "SELECT * FROM data.csv"

# TSV
loq -o:TSV "SELECT * FROM data.csv"
```

## Output to File

```bash
# To file
loq -o:CSV --ofile:output.csv "SELECT * FROM data.csv"
loq -o:TSV --ofile:output.tsv "SELECT * FROM data.csv"

# To stdout (default)
loq -o:CSV "SELECT * FROM data.csv"
```

## Output Format

### CSV

```csv
name,age,city
Alice,32,New York
Bob,28,San Francisco
```

### TSV

```tsv
name	age	city
Alice	32	New York
Bob	28	San Francisco
```

## Options

### Headers

Control header row output:

```bash
# With headers (default)
loq -o:CSV "SELECT name, age FROM users.csv"

# Without headers
loq -o:CSV -headers:OFF "SELECT name, age FROM users.csv"
```

### Custom Separator

Use any character as separator:

```bash
# Pipe-delimited
loq -o:CSV -oSeparator:"|" "SELECT * FROM data.csv"

# Semicolon-delimited (European CSV)
loq -o:CSV -oSeparator:";" "SELECT * FROM data.csv"
```

### Output Codepage

Specify output encoding:

```bash
# UTF-8 (default)
loq -o:CSV -oCodepage:UTF8 "SELECT * FROM data.csv"

# UTF-16
loq -o:CSV -oCodepage:UTF16 "SELECT * FROM data.csv"

# Windows-1252
loq -o:CSV -oCodepage:1252 "SELECT * FROM data.csv"
```

## Quoting Behavior

Values are quoted when they contain:
- The delimiter character (comma for CSV)
- Double quotes
- Newlines

```csv
name,description
Widget,"A small, useful item"
Gadget,"Contains ""special"" characters"
```

## NULL Handling

NULL values are output as empty fields:

```csv
name,email
Alice,alice@example.com
Bob,
Carol,carol@example.com
```

## Examples

### Basic Export

```bash
loq -o:CSV --ofile:users.csv "SELECT * FROM users.csv WHERE active = true"
```

### Filtered Export

```bash
loq -o:CSV --ofile:errors.csv \
          "SELECT timestamp, level, message FROM logs.csv WHERE level = 'error'"
```

### Aggregated Export

```bash
loq -o:CSV --ofile:summary.csv \
          "SELECT category, COUNT(*), SUM(amount)
           FROM sales.csv
           GROUP BY category"
```

### Selected Columns with Aliases

```bash
loq -o:CSV --ofile:report.csv \
          "SELECT
               name AS 'Customer Name',
               total AS 'Total Amount',
               date AS 'Order Date'
           FROM orders.csv"
```

### Pipeline to Other Tools

```bash
# Pipe to grep
loq -o:CSV "SELECT * FROM logs.csv" | grep error

# Pipe to awk
loq -o:CSV "SELECT name, amount FROM sales.csv" | awk -F',' '{sum += $2} END {print sum}'

# Pipe to sort
loq -o:CSV -headers:OFF "SELECT * FROM data.csv" | sort -t',' -k2 -n
```

## Combining with Unix Tools

### Count Lines

```bash
loq -o:CSV -headers:OFF "SELECT * FROM data.csv WHERE status = 'active'" | wc -l
```

### Extract Column

```bash
loq -o:CSV -headers:OFF "SELECT name FROM users.csv" | sort | uniq
```

### Head/Tail

```bash
# First 10 rows (including header)
loq -o:CSV "SELECT * FROM data.csv LIMIT 10"

# Using head
loq -o:CSV "SELECT * FROM data.csv" | head -20
```

## Best Practices

### Use Appropriate Delimiter

- **Comma** (`,`): Standard, works with most tools
- **Tab**: Better for data with commas in values
- **Pipe** (`|`): Good for data with commas and tabs

### Consider Headers

- **With headers**: For human reading, spreadsheet import
- **Without headers**: For piping to other tools, appending to files

### Handle Special Characters

Data with commas or quotes is automatically escaped:

```sql
SELECT 'Value, with comma' AS col1
-- Output: "Value, with comma"
```

### Use Aliases for Clean Headers

```sql
SELECT
    customer_id AS 'Customer ID',
    total_amount AS 'Total Amount'
FROM orders.csv
```

## Spreadsheet Import

CSV files can be opened directly in:
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- Numbers

### Excel Tips

1. Open Excel
2. File > Import > CSV
3. Select comma delimiter
4. Choose column types

### Google Sheets Tips

1. Open Google Sheets
2. File > Import
3. Upload CSV
4. Select separator type

## Troubleshooting

### Wrong Delimiter Detected

If spreadsheet doesn't parse correctly:

```bash
# Use tab for cleaner import
loq -o:TSV --ofile:data.tsv "SELECT * FROM data.csv"
```

### Encoding Issues

For non-ASCII characters:

```bash
loq -o:CSV -oCodepage:UTF8 --ofile:data.csv "SELECT * FROM data.csv"
```

### Large Files

For very large exports:

```bash
# Stream directly to file
loq -o:CSV --ofile:huge.csv "SELECT * FROM huge.csv"
```

## See Also

- [Output Formats Overview](/output-formats/)
- [JSON Output](/output-formats/json)
- [CSV Input](/input-formats/csv)
