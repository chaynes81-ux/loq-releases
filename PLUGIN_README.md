# loq Claude Code Plugin

SQL-based log analysis and query building for loq - a cross-platform replacement for Microsoft Log Parser 2.2.

## Overview

This Claude Code plugin provides comprehensive support for building, debugging, and optimizing SQL queries with loq. It includes a quick-access command and a specialized agent for complex tasks.

### What is loq?

loq is a modern, cross-platform replacement for Microsoft Log Parser 2.2, built in Rust. It provides:
- 100% CLI compatibility with MS Log Parser 2.2
- 2-5x faster performance
- 30+ input formats (CSV, JSON, W3C, IIS, Syslog, EVTX, PCAP, S3)
- 15+ output formats (CSV, JSON, SQLite, PostgreSQL, Charts)
- Full SQL support (JOINs, CTEs, window functions, UNION)
- Cross-platform (Windows, macOS, Linux)

## Plugin Components

### 1. `/loq` Command

Quick access to loq query building and debugging.

**Usage:**
```
/loq how do I count requests by status code in IIS logs?
/loq parse this syslog file and find all errors
/loq convert my CSV to JSON with filtering
/loq what functions can I use for date manipulation?
/loq migrate this Log Parser query to loq syntax
```

**Capabilities:**
- Build SQL queries for log analysis
- Select appropriate input/output formats
- Look up SQL functions and syntax
- Migrate MS Log Parser 2.2 queries
- Debug query errors and issues

### 2. `loq-specialist` Agent

Expert agent for complex migrations, integrations, and advanced queries.

**When to Use:**
- Migrating VBScript or VB.NET code using MS Log Parser COM
- Integrating loq into .NET, Python, Go, or Ruby applications
- Building complex queries with JOINs, CTEs, or window functions
- Debugging performance issues
- Working with specialized formats (EVTX, PCAP, S3)

**Capabilities:**
- MS Log Parser 2.2 migration (CLI and COM API)
- .NET integration (Loq.Classic and modern Loq API)
- FFI integration for Python, Go, Ruby
- Complex SQL query development
- Multi-format expertise
- Performance optimization

## Installation

### Option 1: GitHub Self-Hosted (Recommended)

Install directly from the GitHub repository:

```bash
# Add the marketplace
/plugin marketplace add github.com/chaynes81-ux/loq-releases

# Install the plugin
/plugin install loq@chaynes81-ux
```

### Option 2: Official Marketplace (Coming Soon)

Once approved for the official Claude Code marketplace:

```bash
/plugin install loq
```

### Option 3: Local Development

For testing or contributing:

```bash
# Clone the repository
git clone https://github.com/chaynes81-ux/loq-releases.git

# Add local marketplace
/plugin marketplace add /path/to/loq-releases

# Install plugin
/plugin install loq@local
```

## Quick Start

### Building a Simple Query

```
/loq I need to find all 404 errors in my IIS logs from yesterday
```

Claude will help you build:
```bash
loq -i:W3C "SELECT date, time, cs-uri-stem, cs-method
            FROM u_ex*.log
            WHERE sc-status = 404
              AND date >= DATE_ADD(NOW(), -1, 'DAY')
            ORDER BY time DESC"
```

### Migrating from MS Log Parser

Ask the loq-specialist agent:
```
@loq-specialist migrate this VBScript to C#:

Set objLogParser = CreateObject("MSUtil.LogQuery")
Set rs = objLogParser.Execute("SELECT * FROM ex*.log WHERE sc-status >= 400")
...
```

### Complex Query Development

```
@loq-specialist help me build a query that:
- Joins IIS logs with a user database
- Calculates moving averages of response times
- Groups by user department
- Shows top 10 slowest endpoints per department
```

## Features

### SQL Support

- **Basic**: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT
- **Advanced**: JOINs (INNER, LEFT, CROSS), UNION/UNION ALL
- **Modern**: CTEs (WITH), window functions, subqueries
- **MS Log Parser Compatible**: TOP n, TOP n PERCENT, INTO clause

### Input Formats

30+ formats including:
- **Text**: CSV, TSV, FIXEDWIDTH, TEXTLINE, TEXTWORD
- **Logs**: W3C, IIS, NCSA, Syslog, HTTPERR, URLSCAN
- **Structured**: JSON, NDJSON, XML, Parquet
- **System**: EVTX (Windows Event Logs), Registry, Filesystem
- **Network**: PCAP
- **Cloud**: S3 (with compression support)

### Output Formats

15+ formats including:
- **Text**: CSV, TSV, JSON, XML, DATAGRID (tables)
- **Database**: SQLite, PostgreSQL, MySQL
- **Visualization**: CHART (PNG/SVG)
- **Binary**: NATIVE, Parquet
- **Cloud**: CloudWatch

### SQL Functions

60+ built-in functions:
- **String**: UPPER, LOWER, SUBSTR, REPLACE, TRIM, CONCAT, PRINTF
- **Math**: ROUND, FLOOR, CEIL, ABS, MOD, SQRT, POWER
- **Date/Time**: TO_TIMESTAMP, TO_DATE, EXTRACT, NOW, DATE_ADD, QUANTIZE
- **Conditional**: COALESCE, NULLIF, IF, CASE WHEN
- **Network**: REVERSEDNS, IPMASK
- **Aggregate**: COUNT, SUM, AVG, MAX, MIN, GROUP_CONCAT

### Language Bindings

- **.NET**: Loq.Classic (COM-compatible), Loq (modern/LINQ)
- **C/FFI**: For Python, Go, Ruby, Node.js
- **Windows COM**: Drop-in replacement for MS Log Parser DLL

## Documentation

The plugin provides access to comprehensive documentation:

- **REFERENCE.md**: Complete feature overview
- **sql.md**: SQL syntax reference
- **functions.md**: All SQL functions
- **input-formats.md**: Input format details
- **output-formats.md**: Output format details
- **cli.md**: CLI options and patterns
- **dotnet.md**: .NET integration
- **ffi.md**: FFI for Python, Go, Ruby

All documentation is available in the `llm-docs/` directory.

## Examples

### Web Server Log Analysis

**Top 10 slowest endpoints:**
```bash
loq -i:W3C "SELECT TOP 10 cs-uri-stem, AVG(time-taken) as avg_time, COUNT(*) as hits
            FROM u_ex*.log
            GROUP BY cs-uri-stem
            ORDER BY avg_time DESC"
```

### Application Log Filtering

**Find errors with context:**
```bash
loq "SELECT * FROM app.log
     WHERE level = 'ERROR'
       AND timestamp > DATE_ADD(NOW(), -1, 'HOUR')
     ORDER BY timestamp DESC"
```

### Data Transformation

**CSV to SQLite with aggregation:**
```bash
loq -o:SQLITE --ofile:summary.db \
    "SELECT category, SUM(amount) as total, COUNT(*) as count
     FROM transactions.csv
     GROUP BY category"
```

### Windows Event Log Analysis

**Find failed login attempts:**
```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Message
             FROM Security.evtx
             WHERE EventID = 4625
             ORDER BY TimeCreated DESC
             LIMIT 100"
```

### Complex JOIN Query

**Combine access logs with user database:**
```bash
loq "SELECT a.timestamp, a.url, a.status, u.name, u.department
     FROM access.log a
     JOIN users.csv u ON a.user_id = u.id
     WHERE a.status >= 500
     ORDER BY a.timestamp DESC"
```

## Project Links

- **loq Project**: https://github.com/chaynes81-ux/loq
- **Plugin Repository**: https://github.com/chaynes81-ux/loq-releases
- **Documentation**: See `llm-docs/` directory
- **Issues**: https://github.com/chaynes81-ux/loq-releases/issues

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For plugin improvements, modify:
- `commands/loq.md` - Command definition
- `agents/loq-specialist.md` - Agent definition
- `.claude-plugin/plugin.json` - Plugin manifest

## License

MIT License - See LICENSE file for details.

## Support

- **GitHub Issues**: https://github.com/chaynes81-ux/loq-releases/issues
- **Email**: chaynes81@gmail.com
- **Documentation**: https://github.com/chaynes81-ux/loq-releases/blob/main/llm-docs/REFERENCE.md

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
