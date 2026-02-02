# Error Reference

This page documents common errors you may encounter when using loq, organized by category with explanations and solutions.

## Parse Errors

Parse errors occur when loq cannot understand your SQL query.

### SQL Syntax Error

```
Error: SQL syntax error: Expected end of statement, found: xyz
```

**Cause:** The SQL query contains invalid syntax that the parser cannot understand.

**Solutions:**

```bash
# Missing quotes around string values
# Wrong:
loq "SELECT * FROM data.csv WHERE name = Alice"

# Correct:
loq "SELECT * FROM data.csv WHERE name = 'Alice'"
```

```bash
# Missing commas between columns
# Wrong:
loq "SELECT name age city FROM data.csv"

# Correct:
loq "SELECT name, age, city FROM data.csv"
```

---

### Unexpected Token

```
Error: SQL syntax error: Unexpected token 'FROM' at position 12
```

**Cause:** The parser encountered a keyword or token in an unexpected location.

**Solutions:**

```bash
# Reserved word used as column name - use quotes
# Wrong:
loq "SELECT select, from FROM data.csv"

# Correct:
loq "SELECT \"select\", \"from\" FROM data.csv"
```

```bash
# Missing expression after operator
# Wrong:
loq "SELECT * FROM data.csv WHERE age >"

# Correct:
loq "SELECT * FROM data.csv WHERE age > 30"
```

---

### Missing FROM Clause

```
Error: Missing required clause: FROM
```

**Cause:** A SELECT statement must specify a data source with FROM.

**Solution:**

```bash
# Wrong:
loq "SELECT name, age"

# Correct:
loq "SELECT name, age FROM users.csv"
```

---

### Invalid Column Name

```
Error: Invalid column: column name cannot be empty
```

**Cause:** An empty or invalid column name was specified.

**Solutions:**

```bash
# Extra comma creates empty column reference
# Wrong:
loq "SELECT name, , age FROM data.csv"

# Correct:
loq "SELECT name, age FROM data.csv"
```

```bash
# Trailing comma after last column
# Wrong:
loq "SELECT name, age, FROM data.csv"

# Correct:
loq "SELECT name, age FROM data.csv"
```

---

### Unterminated String Literal

```
Error: SQL syntax error: Unterminated string literal
```

**Cause:** A string value is missing its closing quote.

**Solutions:**

```bash
# Missing closing quote
# Wrong:
loq "SELECT * FROM data.csv WHERE name = 'Alice"

# Correct:
loq "SELECT * FROM data.csv WHERE name = 'Alice'"
```

```bash
# Use doubled quotes to escape quotes inside strings
# Wrong:
loq "SELECT * FROM data.csv WHERE desc = 'It's great'"

# Correct:
loq "SELECT * FROM data.csv WHERE desc = 'It''s great'"
```

---

## File Errors

File errors occur when loq cannot access or read input files.

### File Not Found

```
Error: I/O error: No such file or directory (os error 2)
```

**Cause:** The specified file does not exist or the path is incorrect.

**Solutions:**

```bash
# Check the file exists
ls -la data.csv

# Use absolute path if relative path isn't working
loq "SELECT * FROM /full/path/to/data.csv"

# Check for typos in filename
loq "SELECT * FROM users.csv"  # not user.csv
```

---

### Permission Denied

```
Error: I/O error: Permission denied (os error 13)
```

**Cause:** The current user does not have read permission for the file.

**Solutions:**

```bash
# Check file permissions
ls -la data.csv

# Grant read permission
chmod +r data.csv

# Run with appropriate privileges for system files
sudo loq -i:EVTX "SELECT * FROM /var/log/system.evtx"
```

---

### Invalid File Format

```
Error: Invalid data: Unable to detect file format
```

**Cause:** The file contents do not match the expected format.

**Solutions:**

```bash
# Specify the correct input format explicitly
loq -i:TSV "SELECT * FROM data.txt"  # if tab-delimited

# Check if file is actually the expected format
head -5 data.csv

# For binary files, use the correct format
loq -i:EVTX "SELECT * FROM events.evtx"
```

---

### Encoding Issues

```
Error: Invalid data: invalid UTF-8 sequence
```

**Cause:** The file contains non-UTF-8 characters.

**Solutions:**

```bash
# Specify the correct encoding
loq -i:CSV -iCodepage:LATIN1 "SELECT * FROM data.csv"

# Common encodings:
loq -i:CSV -iCodepage:1252 "SELECT * FROM windows_data.csv"   # Windows-1252
loq -i:CSV -iCodepage:ISO-8859-1 "SELECT * FROM european.csv" # Latin-1
```

---

### Path with Spaces

```
Error: I/O error: No such file or directory (os error 2)
```

**Cause:** File paths containing spaces need special handling.

**Solutions:**

```bash
# Quote the path inside the SQL query
loq "SELECT * FROM 'My Documents/data.csv'"

# Or escape spaces in the shell
loq "SELECT * FROM My\ Documents/data.csv"

# Using double quotes for the path
loq "SELECT * FROM \"My Documents/data.csv\""
```

---

## Type Errors

Type errors occur when operations are performed on incompatible data types.

### Type Mismatch in Comparison

```
Error: Type mismatch: expected Integer, found String
```

**Cause:** Comparing values of incompatible types without conversion.

**Solutions:**

```bash
# Comparing number to string - remove quotes
# Wrong:
loq "SELECT * FROM data.csv WHERE age = '30'"

# Correct:
loq "SELECT * FROM data.csv WHERE age = 30"
```

```bash
# Cast values to the correct type
loq "SELECT * FROM data.csv WHERE CAST(id AS INTEGER) = 100"
```

---

### Cannot Convert to Number

```
Error: Type error: cannot convert 'abc' to number
```

**Cause:** Attempting to use a non-numeric value in a numeric operation.

**Solutions:**

```bash
# Filter out non-numeric values first
loq "SELECT * FROM data.csv WHERE amount != '' AND amount NOT LIKE '%[^0-9]%'"

# Use COALESCE to handle NULLs
loq "SELECT COALESCE(CAST(amount AS INTEGER), 0) FROM data.csv"
```

---

### Invalid Date Format

```
Error: Type error: cannot parse date from 'invalid-date'
```

**Cause:** The date string does not match the expected format.

**Solutions:**

```bash
# Specify the correct date format
loq "SELECT TO_TIMESTAMP(date_col, '%Y-%m-%d') FROM data.csv"

# Common format patterns:
# %Y-%m-%d         -> 2024-01-15
# %Y-%m-%d %H:%M:%S -> 2024-01-15 14:30:00
# %d/%m/%Y         -> 15/01/2024
# %m/%d/%Y         -> 01/15/2024
```

---

### NULL Handling Issues

```
Error: Type error: cannot perform operation on NULL value
```

**Cause:** NULL values cannot be used directly in some operations.

**Solutions:**

```bash
# Use COALESCE to provide default values
loq "SELECT COALESCE(email, 'unknown') FROM users.csv"

# Filter out NULLs
loq "SELECT * FROM data.csv WHERE value IS NOT NULL"

# Use NULLIF to convert values to NULL
loq "SELECT NULLIF(status, '') FROM data.csv"
```

---

## Execution Errors

Execution errors occur during query processing.

### Column Not Found

```
Error: Column not found: 'username'
```

**Cause:** The specified column does not exist in the data source.

**Solutions:**

```bash
# Check available columns by selecting all
loq "SELECT * FROM data.csv LIMIT 1"

# Column names are case-sensitive in some contexts
loq "SELECT UserName FROM data.csv"  # Try exact case

# Use quotes for columns with special characters
loq "SELECT \"user-name\" FROM data.csv"
```

---

### Ambiguous Column Reference

```
Error: Execution error: ambiguous column reference: 'id'
```

**Cause:** When joining tables, both have a column with the same name.

**Solutions:**

```bash
# Qualify column names with table alias
loq "SELECT u.id, o.id AS order_id
     FROM users.csv u
     JOIN orders.csv o ON u.id = o.user_id"

# Or use explicit table names
loq "SELECT users.id, orders.id
     FROM users.csv AS users
     JOIN orders.csv AS orders ON users.id = orders.user_id"
```

---

### Division by Zero

```
Error: Division by zero
```

**Cause:** Attempting to divide by zero.

**Solutions:**

```bash
# Use NULLIF to avoid division by zero
loq "SELECT total / NULLIF(count, 0) AS average FROM data.csv"

# Filter out zero values
loq "SELECT total / count AS average FROM data.csv WHERE count > 0"

# Use CASE to handle zero
loq "SELECT CASE WHEN count = 0 THEN 0 ELSE total / count END AS average
     FROM data.csv"
```

---

### Invalid Regex Pattern

```
Error: Invalid data: regex parse error
```

**Cause:** The LIKE pattern or regex contains invalid syntax.

**Solutions:**

```bash
# Escape special regex characters
# Wrong (unescaped parentheses):
loq "SELECT * FROM data.csv WHERE name LIKE '%(test)%'"

# Correct:
loq "SELECT * FROM data.csv WHERE name LIKE '%test%'"
```

```bash
# For TEXTLINE with regex, ensure valid pattern
loq -i:TEXTLINE -iRegex:"^(?P<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)" \
    "SELECT ip FROM access.log"
```

---

### Aggregate in Wrong Context

```
Error: Invalid aggregate: aggregate function 'COUNT' not allowed in WHERE clause
```

**Cause:** Aggregate functions cannot be used in WHERE; use HAVING instead.

**Solutions:**

```bash
# Wrong - aggregate in WHERE:
loq "SELECT department FROM employees.csv
     WHERE COUNT(*) > 5
     GROUP BY department"

# Correct - use HAVING for aggregate conditions:
loq "SELECT department FROM employees.csv
     GROUP BY department
     HAVING COUNT(*) > 5"
```

```bash
# Wrong - non-aggregated column without GROUP BY:
loq "SELECT name, COUNT(*) FROM employees.csv"

# Correct - include in GROUP BY or use aggregate:
loq "SELECT name, COUNT(*) FROM employees.csv GROUP BY name"
```

---

## Format-Specific Errors

### CSV Parsing Errors

#### Mismatched Column Count

```
Error: Schema mismatch: expected 5 columns, got 3
```

**Cause:** A row has a different number of fields than the header.

**Solutions:**

```bash
# Check the problematic rows
loq "SELECT * FROM data.csv" 2>&1 | head -20

# Ensure proper quoting for fields containing delimiters
# Wrong in CSV:
# name,description,price
# Widget,A small, useful item,9.99

# Correct:
# name,description,price
# Widget,"A small, useful item",9.99
```

#### Bad Quoting

```
Error: CSV error: found record with X fields, but the previous record has Y fields
```

**Cause:** Inconsistent quoting in the CSV file.

**Solutions:**

```bash
# Check for unbalanced quotes
grep -n '"' data.csv | head -20

# Escape quotes by doubling them
# Wrong:
# "He said "hello""

# Correct:
# "He said ""hello"""
```

---

### JSON Parsing Errors

#### Invalid JSON Syntax

```
Error: Invalid data: expected value at line 1 column 1
```

**Cause:** The file is not valid JSON.

**Solutions:**

```bash
# Validate JSON format
cat data.json | python -m json.tool

# For NDJSON (newline-delimited), ensure each line is valid JSON
loq -i:JSON "SELECT * FROM data.ndjson"
```

#### Missing Fields

```
Error: Column not found: 'user.email'
```

**Cause:** Nested JSON field does not exist or has different structure.

**Solutions:**

```bash
# Check available fields
loq -i:JSON "SELECT * FROM data.json LIMIT 1"

# Handle missing nested fields with COALESCE
loq -i:JSON "SELECT COALESCE(user_email, 'none') FROM data.json"
```

---

### W3C Log Format Issues

#### Invalid Header Format

```
Error: Invalid data: W3C log missing #Fields directive
```

**Cause:** The W3C log file is missing the required header line.

**Solutions:**

```bash
# Check the file header
head -10 access.log

# W3C logs should start with directives like:
# #Software: Microsoft Internet Information Services
# #Version: 1.0
# #Fields: date time s-ip cs-method cs-uri-stem ...

# If using a partial log file, specify fields manually
loq -i:W3C -iFields:"date time s-ip cs-method cs-uri-stem" \
    "SELECT * FROM access.log"
```

---

### EVTX Access Issues

#### Cannot Read Event Log

```
Error: I/O error: Permission denied
```

**Cause:** Windows Event Log files often require elevated privileges.

**Solutions:**

```bash
# On Windows, run as Administrator
# Or copy the file to an accessible location
copy C:\Windows\System32\winevt\Logs\Security.evtx C:\temp\

# On Linux/macOS reading exported .evtx files:
loq -i:EVTX "SELECT * FROM exported_events.evtx"
```

#### Corrupted Event Log

```
Error: Invalid data: EVTX file header invalid
```

**Cause:** The .evtx file is corrupted or truncated.

**Solutions:**

```bash
# Verify file integrity
file events.evtx

# Export a fresh copy using Windows Event Viewer
# Or use wevtutil:
wevtutil epl System C:\temp\system.evtx
```

---

## Output Errors

### Cannot Write to File

```
Error: I/O error: Permission denied (os error 13)
```

**Cause:** Cannot write to the specified output file or directory.

**Solutions:**

```bash
# Check directory permissions
ls -la /path/to/output/

# Specify a writable location
loq -o:JSON --ofile:~/output/results.json \
    "SELECT * FROM data.csv"

# Create the output directory first
mkdir -p /path/to/output
```

---

### Database Connection Failed

```
Error: SQLite error: unable to open database file
```

**Cause:** Cannot create or access the SQLite database file.

**Solutions:**

```bash
# Ensure the directory exists and is writable
mkdir -p /path/to/db/

# Check disk space
df -h

# Use a different path
loq -o:SQLITE --ofile:/tmp/results.db \
    "SELECT * FROM data.csv"
```

---

### Invalid Output Format

```
Error: Unknown output format: 'EXCEL'
```

**Cause:** The specified output format is not supported.

**Solutions:**

```bash
# Supported output formats:
# CSV, TSV, JSON, XML, DATAGRID, SQLITE, CHART, NAT, PARQUET, CLOUDWATCH

# List of valid formats
loq --help

# Use CSV and convert externally for unsupported formats
loq -o:CSV --ofile:output.csv "SELECT * FROM data.csv"
```

---

## Getting Help

If you encounter an error not covered here:

1. **Check the full error message** - loq provides detailed error information
2. **Verify your input** - use `LIMIT 1` to test with minimal data
3. **Check file formats** - use `head` or `file` commands to inspect files
4. **Search the documentation** - use the search feature on this site
5. **Report issues** - [GitHub Issues](https://github.com/chaynes81-ux/loq/issues)

### Debug Mode

For additional debugging information:

```bash
# Enable verbose output
loq --stats "SELECT * FROM data.csv"

# Check what columns are available
loq "SELECT * FROM data.csv LIMIT 1"

# Test with simpler queries first
loq "SELECT * FROM data.csv LIMIT 5"
loq "SELECT name FROM data.csv LIMIT 5"
loq "SELECT name FROM data.csv WHERE age > 30 LIMIT 5"
```
