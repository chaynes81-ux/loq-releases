# loq Query Assistant

A Claude Code skill for building and debugging loq queries - a cross-platform replacement for Microsoft Log Parser 2.2.

## Skill Behavior

When this skill is invoked, you should:

1. **Understand the user's goal** - What data do they want to extract or analyze?
2. **Load relevant documentation** - Fetch the appropriate LLM doc files from the `llm-docs/` directory
3. **Build the query** - Construct a correct loq SQL query
4. **Explain the query** - Help the user understand what each part does
5. **Offer to test it** - Run the query if test data is available

## Documentation Files

The LLM-friendly documentation is located in `llm-docs/` at the project root:

| File | Use When |
|------|----------|
| `REFERENCE.md` | Start here - overview of all features |
| `sql.md` | SQL syntax questions (SELECT, JOIN, UNION, CTEs, Window Functions) |
| `functions.md` | Function lookup (String, Math, DateTime, Aggregate) |
| `input-formats.md` | Reading files (CSV, JSON, W3C, EVTX, Syslog, etc.) |
| `output-formats.md` | Writing results (CSV, JSON, SQLite, Chart, etc.) |
| `cli.md` | Command-line options and patterns |
| `dotnet.md` | .NET/C# integration |
| `ffi.md` | Python/Go/Ruby integration |

## Query Building Process

### Step 1: Identify the Input Format

Ask or infer what type of log file the user has:
- Web server logs → W3C, IIS, NCSA
- Application logs → CSV, JSON, Syslog
- Windows events → EVTX
- Custom format → TEXTLINE with regex

### Step 2: Understand the Analysis Goal

Common patterns:
- **Filtering**: `WHERE status >= 400` - find errors
- **Aggregation**: `GROUP BY host` - summarize by dimension
- **Time analysis**: `QUANTIZE(timestamp, 3600)` - bucket by hour
- **Top N**: `ORDER BY count DESC LIMIT 10` - find top items

### Step 3: Build the Query

Use this template:
```sql
SELECT columns_or_aggregates
FROM 'path/to/file.log'
WHERE filter_conditions
GROUP BY grouping_columns
HAVING aggregate_filters
ORDER BY sort_columns
LIMIT row_count
```

### Step 4: Add CLI Options

Common options:
```bash
loq -i:FORMAT        # Input format (CSV, W3C, JSON, etc.)
loq -o:FORMAT        # Output format (CSV, JSON, DATAGRID, etc.)
loq -iCodepage:CP    # Input encoding (UTF-8, Windows-1252, etc.)
loq --ofile:PATH     # Output to file
```

## Common Query Patterns

### Web Server Analysis
```sql
-- Top 10 URLs by request count
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) as hits
            FROM 'access.log'
            GROUP BY cs-uri-stem
            ORDER BY hits DESC
            LIMIT 10"

-- Error rate by hour
loq -i:W3C "SELECT QUANTIZE(date, 3600) as hour,
                   COUNT(*) as total,
                   SUM(CASE WHEN sc-status >= 400 THEN 1 ELSE 0 END) as errors
            FROM 'access.log'
            GROUP BY hour"
```

### Log Filtering
```sql
-- Find errors in the last hour
loq "SELECT * FROM 'app.log'
     WHERE level = 'ERROR'
       AND timestamp > DATE_ADD(NOW(), -1, 'HOUR')"

-- Search for specific pattern
loq "SELECT * FROM 'app.log'
     WHERE message LIKE '%connection refused%'"
```

### Data Transformation
```sql
-- Convert CSV to JSON
loq -o:JSON --ofile:output.json "SELECT * FROM 'data.csv'"

-- Aggregate and export to SQLite
loq -o:SQLITE --ofile:stats.db "SELECT category, SUM(amount)
                                 FROM 'transactions.csv'
                                 GROUP BY category"
```

## MS Log Parser Migration

If the user has existing MS Log Parser queries, help them migrate:

| Log Parser 2.2 | loq Equivalent |
|----------------|----------------|
| `LogParser "SELECT..."` | `loq "SELECT..."` |
| `-i:IISW3C` | `-i:W3C` |
| `-o:NAT` | `-o:NAT` or `-o:NATIVE` |
| `TO_UPPERCASE()` | `UPPER()` or `TO_UPPERCASE()` |
| `STRCAT()` | `CONCAT()` or `STRCAT()` |

## Error Handling

Common issues and fixes:

1. **"Column not found"** - Check column names with `SELECT * FROM file LIMIT 1`
2. **"Parse error"** - Verify input format matches file type
3. **"Encoding error"** - Try `-iCodepage:Windows-1252` for legacy files
4. **"File not found"** - Use absolute paths or check working directory

## Testing Queries

If test data exists in the project:
```bash
# Test with sample data
loq "SELECT * FROM test_data/sample.csv LIMIT 5"

# Show table format for readability
loq -o:DATAGRID "SELECT * FROM test_data/sample.csv"
```

## Invocation Examples

Users can invoke this skill with:
```
/loq how do I count requests by status code in IIS logs?
/loq parse this syslog file and find all errors
/loq convert my CSV to JSON with filtering
/loq what functions can I use for date manipulation?
```

Always read the relevant documentation files before answering to ensure accuracy.
