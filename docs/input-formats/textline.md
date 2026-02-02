# TEXTLINE / TEXT

Line-by-line text file parsing with optional regex pattern matching.

## Overview

The TEXTLINE format reads text files line by line, treating each line as a row. You can optionally apply regex patterns with named capture groups to extract structured fields from unstructured text.

## Usage

```bash
# Basic line-by-line reading
loq -i:TEXTLINE "SELECT * FROM messages.txt"
loq -i:TEXT "SELECT * FROM app.log"

# With regex pattern for structured extraction (library usage)
# Note: Regex patterns are configured programmatically in library mode
```

## Default Schema

When used without a regex pattern, TEXTLINE provides a single column:

| Field | Type | Description |
|-------|------|-------------|
| Text | STRING | The entire line content |

## Regex Pattern Mode

When configured with a regex pattern (in library mode), the schema is determined by named capture groups in the pattern. Each named group `(?P<name>...)` becomes a column.

### Example Pattern

```rust
// In library code
let mut input = TextLineInput::open("access.log")
    .unwrap()
    .with_pattern(r"(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<date>[^\]]+)\] \"(?P<request>[^\"]+)\"")
    .unwrap();
// Schema: [ip, date, request]
```

## Features

### Basic Mode
- Each line becomes one row with a single "Text" column
- Empty lines are included
- Handles both Unix (`\n`) and Windows (`\r\n`) line endings
- Simple and fast for line-based processing

### Regex Mode
- Extract structured fields using named capture groups
- Lines that don't match the pattern are skipped
- Missing capture groups return NULL values
- All extracted fields are returned as strings

## Options

| Option | Description |
|--------|-------------|
| `-i:TEXTLINE` | Select TEXTLINE format |
| `-i:TEXT` | Alias for TEXTLINE |

## Examples

### Basic Line Reading

```bash
# Read all lines from a file
loq -i:TEXTLINE "SELECT Text FROM notes.txt"

# Count lines in a file
loq -i:TEXTLINE "SELECT COUNT(*) AS line_count FROM document.txt"

# View first 20 lines
loq -i:TEXTLINE "SELECT Text FROM file.txt LIMIT 20"
```

### Filtering Lines

```bash
# Find lines containing ERROR
loq -i:TEXT "SELECT Text FROM app.log WHERE Text LIKE '%ERROR%'"

# Find lines starting with specific prefix
loq -i:TEXT "SELECT Text FROM log.txt WHERE Text LIKE 'WARNING:%'"

# Count error occurrences
loq -i:TEXT "SELECT COUNT(*) FROM app.log WHERE Text LIKE '%ERROR%'"
```

### String Operations

```bash
# Extract parts of lines using SQL functions
loq -i:TEXT "SELECT UPPER(Text) FROM notes.txt"

# Get line length
loq -i:TEXT "SELECT Text, STRLEN(Text) AS length FROM file.txt"

# Extract substrings
loq -i:TEXT "SELECT SUBSTR(Text, 1, 50) AS preview FROM log.txt"
```

### Aggregation

```bash
# Group by line patterns
loq -i:TEXT "SELECT 
    CASE 
        WHEN Text LIKE 'ERROR%' THEN 'Error'
        WHEN Text LIKE 'WARN%' THEN 'Warning'
        ELSE 'Info'
    END AS level,
    COUNT(*) AS count
FROM app.log
GROUP BY level"
```

### Multiple Files

```bash
# Process multiple log files
loq -i:TEXT "SELECT Text FROM 'logs/*.log' WHERE Text LIKE '%ERROR%'"

# Recursive directory search
loq -i:TEXT -recurse:2 "SELECT Text FROM 'logs/*.txt'"
```

### Output Formats

```bash
# Export to JSON
loq -i:TEXT -o:JSON "SELECT Text FROM file.txt WHERE Text LIKE '%important%'"

# Format as table
loq -i:TEXT -o:DATAGRID "SELECT Text FROM notes.txt LIMIT 10"

# Save to SQLite
loq -i:TEXT -o:SQLITE --ofile:output.db "SELECT Text FROM file.txt"
```

## Use Cases

### Log Analysis

```bash
# Find all error messages
loq -i:TEXT "SELECT Text FROM app.log WHERE Text LIKE '%ERROR%'"

# Count warnings by hour (assuming timestamp prefix)
loq -i:TEXT "SELECT 
    SUBSTR(Text, 1, 13) AS hour,
    COUNT(*) AS warnings
FROM app.log
WHERE Text LIKE '%WARN%'
GROUP BY hour
ORDER BY hour"
```

### Text Processing

```bash
# Remove blank lines
loq -i:TEXT "SELECT Text FROM file.txt WHERE TRIM(Text) != ''"

# Find long lines
loq -i:TEXT "SELECT Text FROM file.txt WHERE STRLEN(Text) > 100"

# Deduplicate lines
loq -i:TEXT "SELECT DISTINCT Text FROM file.txt"
```

### Configuration Files

```bash
# Extract comments
loq -i:TEXT "SELECT Text FROM config.txt WHERE Text LIKE '#%'"

# Find specific settings
loq -i:TEXT "SELECT Text FROM config.ini WHERE Text LIKE 'debug=%'"
```

### Data Extraction

```bash
# Find lines with IP addresses
loq -i:TEXT "SELECT Text FROM access.log 
WHERE Text LIKE '%[0-9]%.[0-9]%.[0-9]%.[0-9]%'"

# Extract email addresses (simple pattern)
loq -i:TEXT "SELECT Text FROM contacts.txt WHERE Text LIKE '%@%.%'"
```

## Library Usage with Regex Patterns

For advanced structured extraction, use the library API with regex patterns:

```rust
use logparser_formats::TextLineInput;

// Parse Apache-style access logs
let mut input = TextLineInput::open("access.log")
    .unwrap()
    .with_pattern(
        r#"(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<date>[^\]]+)\] "(?P<request>[^"]+)" (?P<status>\d+) (?P<size>\d+)"#
    )
    .unwrap();

// Schema: [ip, date, request, status, size]
```

### Pattern Features

- **Named Groups**: Use `(?P<name>...)` to create columns
- **Skip Non-Matches**: Lines that don't match are automatically skipped
- **NULL Values**: Missing optional groups return NULL
- **String Type**: All captured values are strings (use SQL CAST to convert)

### Pattern Examples

#### Key-Value Logs
```rust
// Parse: "user:alice age:30 city:NYC"
let pattern = r"user:(?P<user>\w+) age:(?P<age>\d+) city:(?P<city>\w+)";
```

#### Syslog Format
```rust
// Parse: "Jan 15 08:30:15 server app[1234]: message"
let pattern = r"(?P<month>\w+) (?P<day>\d+) (?P<time>[\d:]+) (?P<host>\S+) (?P<app>\w+)\[(?P<pid>\d+)\]: (?P<message>.*)";
```

#### Custom Application Logs
```rust
// Parse: "[ERROR] 2024-01-15 Component: message"
let pattern = r"\[(?P<level>\w+)\] (?P<date>[\d-]+) (?P<component>\w+): (?P<message>.*)";
```

## Performance Notes

- **Line-by-line parsing** is efficient for large files
- **Regex patterns** add overhead - use basic mode when possible
- **Filtering** with WHERE is fast - applied during reading
- **Large files** are streamed, not loaded into memory

### Performance Tips

```bash
# Good: Filter early to reduce data
loq -i:TEXT "SELECT Text FROM huge.log WHERE Text LIKE '%ERROR%'"

# Good: Use LIMIT during exploration
loq -i:TEXT "SELECT Text FROM huge.log LIMIT 100"

# Better: Use more specific format if available
# If the file is actually CSV, use -i:CSV instead
loq -i:CSV "SELECT * FROM data.csv"
```

## Comparison with Other Formats

### When to Use TEXTLINE

- Unstructured log files
- Simple line-based text files
- Quick exploration of unknown formats
- When structure doesn't match standard formats

### When to Use Other Formats

| Format | Use Instead Of TEXTLINE When... |
|--------|--------------------------------|
| CSV | Data is comma/tab-separated |
| JSON | Data is JSON or NDJSON |
| W3C | IIS/Apache logs with standard format |
| NCSA | Standard Apache access logs |
| SYSLOG | RFC 3164/5424 syslog messages |
| XML | Structured XML documents |
| TEXTWORD | Need word-level parsing with positions |

## Notes

- Each line becomes exactly one row in basic mode
- Empty lines are included (filter with `WHERE TRIM(Text) != ''`)
- Line endings (`\n` and `\r\n`) are automatically stripped
- Regex patterns are only available in library mode, not CLI
- For structured logs, consider using NCSA, W3C, or SYSLOG formats

## See Also

- [Input Formats Overview](/input-formats/)
- [TEXTWORD Format](/input-formats/textword) - Word-level parsing
- [NCSA Format](/input-formats/ncsa) - Apache/Nginx logs
- [W3C Format](/input-formats/w3c) - IIS logs
- [SYSLOG Format](/input-formats/syslog) - System logs
- [CSV Output](/output-formats/csv)
