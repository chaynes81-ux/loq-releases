# loq Claude Code Plugin - Quick Start

## Install (2 commands)

```bash
/plugin marketplace add github.com/chaynes81-ux/loq-releases
/plugin install loq@chaynes81-ux
```

Done! Now you have access to `/loq` command and `@loq-specialist` agent.

## Using the `/loq` Command

### Basic Usage

```
/loq [your question about loq queries]
```

### Examples

```
/loq how do I count requests by status code in IIS logs?
```
```
/loq parse this CSV and find all rows where age > 30
```
```
/loq convert JSON to SQLite with aggregation
```
```
/loq what functions can I use for date manipulation?
```
```
/loq migrate this Log Parser query: SELECT * FROM ex*.log WHERE sc-status >= 400
```

### What It Does

- Builds SQL queries for your log analysis needs
- Helps you select the right input/output formats
- Looks up SQL functions and syntax
- Migrates MS Log Parser 2.2 queries
- Debugs query errors

## Using the `@loq-specialist` Agent

### When to Use

For complex tasks like:
- Migrating VBScript or VB.NET code
- Integrating loq into .NET, Python, Go, Ruby applications
- Building advanced queries (JOINs, CTEs, window functions)
- Debugging performance issues
- Working with specialized formats (EVTX, PCAP, S3)

### Examples

```
@loq-specialist migrate this VBScript to C#:
Set objLogParser = CreateObject("MSUtil.LogQuery")
...
```
```
@loq-specialist help me integrate loq into my Python data pipeline
```
```
@loq-specialist build a query that joins IIS logs with a user database
```
```
@loq-specialist debug why my EVTX query returns no results
```

## Common Query Patterns

### Web Server Logs

**Top 10 URLs by traffic:**
```bash
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) as hits
            FROM u_ex*.log
            GROUP BY cs-uri-stem
            ORDER BY hits DESC
            LIMIT 10"
```

**Find 404 errors:**
```bash
loq -i:W3C "SELECT date, time, cs-uri-stem
            FROM access.log
            WHERE sc-status = 404"
```

### Application Logs

**Find errors in last hour:**
```bash
loq "SELECT * FROM app.log
     WHERE level = 'ERROR'
       AND timestamp > DATE_ADD(NOW(), -1, 'HOUR')"
```

**Search for pattern:**
```bash
loq "SELECT * FROM app.log
     WHERE message LIKE '%connection refused%'"
```

### Data Transformation

**CSV to JSON:**
```bash
loq -o:JSON "SELECT * FROM data.csv WHERE age > 30" > output.json
```

**Aggregate to SQLite:**
```bash
loq -o:SQLITE --ofile:stats.db \
    "SELECT category, SUM(amount) FROM sales.csv GROUP BY category"
```

### Windows Event Logs

**Failed login attempts:**
```bash
loq -i:EVTX "SELECT TimeCreated, Message
             FROM Security.evtx
             WHERE EventID = 4625
             LIMIT 100"
```

## Input Formats Quick Reference

| Format | Flag | Use For |
|--------|------|---------|
| CSV | `-i:CSV` | Comma-separated files (default) |
| JSON | `-i:JSON` | JSON arrays or NDJSON |
| W3C | `-i:W3C` | IIS/W3C extended logs |
| IIS | `-i:IIS` | IIS native log format |
| EVTX | `-i:EVTX` | Windows Event Logs |
| Syslog | `-i:SYSLOG` | Unix system logs |
| NCSA | `-i:NCSA` | Apache/Nginx logs |
| S3 | `-i:S3` | Amazon S3 objects |
| PCAP | `-i:PCAP` | Network captures |
| XML | `-i:XML` | XML documents |

**30+ formats supported** - ask `/loq` for the full list!

## Output Formats Quick Reference

| Format | Flag | Use For |
|--------|------|---------|
| CSV | `-o:CSV` | Comma-separated (default) |
| JSON | `-o:JSON` | JSON output |
| DATAGRID | `-o:DATAGRID` | ASCII tables (pretty print) |
| SQLITE | `-o:SQLITE` | SQLite database (needs --ofile) |
| CHART | `-o:CHART` | PNG/SVG charts (needs --ofile) |
| XML | `-o:XML` | XML documents |

**15+ formats supported** - ask `/loq` for the full list!

## Useful CLI Options

```bash
-i:FORMAT          # Input format
-o:FORMAT          # Output format
--ofile:PATH       # Output to file
-headerRow:ON|OFF  # CSV header handling
-e:-1              # Allow unlimited errors
-q:ON              # Quiet mode
--stats:ON         # Show statistics
```

## SQL Functions Highlights

### String Functions
`UPPER`, `LOWER`, `SUBSTR`, `CONCAT`, `TRIM`, `REPLACE`, `STRLEN`, `PRINTF`

### Math Functions
`ROUND`, `FLOOR`, `CEIL`, `ABS`, `MOD`, `SQRT`, `POWER`

### Date/Time Functions
`TO_TIMESTAMP`, `NOW`, `DATE_ADD`, `DATE_DIFF`, `QUANTIZE`, `EXTRACT`

### Conditional Functions
`COALESCE`, `NULLIF`, `IF`, `CASE WHEN`

### Aggregate Functions
`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`, `GROUP_CONCAT`

**60+ functions total** - ask `/loq what functions` for details!

## MS Log Parser Migration

Most queries work as-is! Key differences:

| Log Parser 2.2 | loq |
|----------------|-----|
| `LogParser.exe` | `loq` |
| `-i:IISW3C` | `-i:W3C` |
| `TO_UPPERCASE()` | `UPPER()` (or `TO_UPPERCASE()`) |
| `STRCAT()` | `CONCAT()` (or `STRCAT()`) |

Ask `/loq migrate` for help with specific queries.

## Getting Help

### Within Claude Code

```
/loq [your question]              # Quick help
@loq-specialist [complex task]    # Expert help
```

### Documentation

All comprehensive docs are in the `llm-docs/` directory:
- `REFERENCE.md` - Complete overview
- `sql.md` - SQL syntax
- `functions.md` - All functions
- `input-formats.md` - Input formats
- `output-formats.md` - Output formats

### Support

- **GitHub Issues**: https://github.com/chaynes81-ux/loq-releases/issues
- **Email**: chaynes81@gmail.com
- **Full Guide**: See `PLUGIN_README.md`

## Uninstall

```bash
/plugin uninstall loq@chaynes81-ux
```

## Update

```bash
/plugin uninstall loq@chaynes81-ux
/plugin install loq@chaynes81-ux
```

---

**That's it!** Start with simple queries using `/loq`, then level up to complex tasks with `@loq-specialist`.

Happy log parsing! 🚀
