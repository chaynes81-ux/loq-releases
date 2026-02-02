# Input Formats

loq supports 20+ input formats for parsing structured and semi-structured data.

## Format Overview

| Format | Flag | Description | Platform |
|--------|------|-------------|----------|
| [CSV](/input-formats/csv) | `-i:CSV` | Comma-separated values (default) | All |
| [TSV](/input-formats/csv) | `-i:TSV` | Tab-separated values | All |
| [JSON](/input-formats/json) | `-i:JSON` | JSON arrays and objects | All |
| [NDJSON](/input-formats/json) | `-i:NDJSON` | Newline-delimited JSON | All |
| [XML](/input-formats/xml) | `-i:XML` | XML documents | All |
| [W3C](/input-formats/w3c) | `-i:W3C` | IIS W3C extended log format | All |
| [IIS](/input-formats/w3c) | `-i:IIS` | IIS native log format | All |
| [NCSA](/input-formats/ncsa) | `-i:NCSA` | NCSA Common/Combined logs | All |
| [Syslog](/input-formats/syslog) | `-i:SYSLOG` | Syslog RFC 3164/5424 | All |
| [EVTX](/input-formats/evtx) | `-i:EVTX` | Windows Event Log files | All |
| [FS](/input-formats/filesystem) | `-i:FS` | Filesystem metadata | All |
| [S3](/input-formats/s3) | `-i:S3` | Amazon S3 objects | All |
| [Parquet](/input-formats/parquet) | `-i:PARQUET` | Apache Parquet files | All |
| [TEXTLINE](/input-formats/textline) | `-i:TEXTLINE` | Line-by-line with regex | All |
| [TEXTWORD](/input-formats/textword) | `-i:TEXTWORD` | Word-by-word parsing | All |
| REG | `-i:REG` | Windows Registry .reg files | All |
| PCAP | `-i:PCAP` | Network capture files | All |
| BIN | `-i:BIN` | IIS binary logs (.ibl) | All |
| HTTPERR | `-i:HTTPERR` | HTTP.sys error logs | All |
| URLSCAN | `-i:URLSCAN` | URLScan security logs | All |
| ETW | `-i:ETW` | Event Tracing for Windows | Windows |
| ADS | `-i:ADS` | Active Directory | Windows |

## Specifying Input Format

Use the `-i:FORMAT` flag:

```bash
# Explicit format
loq -i:JSON "SELECT * FROM data.json"
loq -i:W3C "SELECT * FROM access.log"

# CSV is default
loq "SELECT * FROM data.csv"
```

## Format Aliases

Many formats have aliases for compatibility:

| Canonical | Aliases |
|-----------|---------|
| `CSV` | (default) |
| `W3C` | `IISW3C` |
| `IIS` | `IISNATIVE` |
| `NCSA` | `APACHE`, `NGINX` |
| `TEXTLINE` | `TEXT` |
| `TEXTWORD` | `WORD` |
| `FS` | `FILESYSTEM` |
| `EVTX` | `EVT` |
| `REG` | `REGISTRY` |
| `PCAP` | `NETMON`, `CAP` |
| `DATAGRID` | `TABLE`, `GRID` |

## Common Columns

Different formats provide different columns. Here are common patterns:

### Web Server Logs (W3C, IIS, NCSA)

| Column | Description |
|--------|-------------|
| `date` | Request date |
| `time` | Request time |
| `cs-method` | HTTP method (GET, POST, etc.) |
| `cs-uri-stem` | Request path |
| `cs-uri-query` | Query string |
| `sc-status` | HTTP status code |
| `sc-bytes` | Response size |
| `c-ip` | Client IP |
| `cs(User-Agent)` | User agent string |

### System Logs (Syslog, EVTX)

| Column | Description |
|--------|-------------|
| `timestamp` | Event time |
| `hostname` | Source host |
| `facility` | Log facility |
| `severity` | Log level |
| `message` | Log message |

### Filesystem (FS)

| Column | Description |
|--------|-------------|
| `Name` | File name |
| `Path` | Full path |
| `Size` | File size in bytes |
| `Extension` | File extension |
| `LastModified` | Modification time |
| `Created` | Creation time |

## Type Inference

loq automatically detects column types:

| Detected Type | Examples |
|--------------|----------|
| Integer | `42`, `-100`, `0` |
| Float | `3.14`, `-0.5`, `1.0e10` |
| Boolean | `true`, `false`, `TRUE`, `FALSE` |
| DateTime | ISO 8601 format |
| String | Everything else |

Override with explicit functions:

```sql
SELECT
    CAST(id AS INTEGER),
    TO_TIMESTAMP(date_str, '%Y-%m-%d')
FROM data.csv
```

## Format-Specific Options

Some formats support additional options:

### CSV/TSV Options

```bash
# Custom delimiter
loq -i:CSV -iSeparator:"|" "SELECT * FROM data.txt"

# Skip header rows
loq -i:CSV -iHeaderRow:2 "SELECT * FROM data.csv"
```

### XML Options

```bash
# Specify row element
loq -i:XML -iRowElement:item "SELECT * FROM data.xml"
```

### Filesystem Options

```bash
# Recursive traversal
loq -i:FS -recurse:3 "SELECT * FROM '/var/log'"
```

## Cross-Platform Support

Most formats work on all platforms. Some are platform-specific:

| Format | Windows | macOS | Linux |
|--------|---------|-------|-------|
| CSV, JSON, XML | Yes | Yes | Yes |
| W3C, IIS, NCSA | Yes | Yes | Yes |
| EVTX | Yes | Yes | Yes |
| ETW | Yes | No | No |
| ADS | Yes | No | No |

Platform-specific formats return clear error messages on unsupported platforms:

```bash
# On macOS/Linux
loq -i:ETW "SELECT * FROM events"
# Error: ETW format is only supported on Windows
```

## Examples

### Query CSV Data

```bash
loq "SELECT name, age FROM users.csv WHERE age > 30"
```

### Analyze Web Logs

```bash
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) FROM access.log GROUP BY cs-uri-stem"
```

### Parse JSON API Response

```bash
loq -i:JSON "SELECT id, name FROM response.json WHERE status = 'active'"
```

### Query Windows Events

```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Message FROM System.evtx WHERE Level <= 2"
```

### List Large Files

```bash
loq -i:FS "SELECT Name, Size FROM '/home' WHERE Size > 1000000 ORDER BY Size DESC LIMIT 20"
```

### Query S3 Data

```bash
loq -i:S3 "SELECT * FROM 's3://bucket/logs/*.csv' WHERE status >= 400"
```

## See Also

- [CSV / TSV](/input-formats/csv)
- [JSON / NDJSON](/input-formats/json)
- [XML](/input-formats/xml)
- [W3C / IIS](/input-formats/w3c)
- [NCSA / Apache](/input-formats/ncsa)
- [Syslog](/input-formats/syslog)
- [EVTX](/input-formats/evtx)
- [Filesystem](/input-formats/filesystem)
- [S3](/input-formats/s3)
- [Parquet](/input-formats/parquet)
- [TEXTLINE](/input-formats/textline)
- [TEXTWORD](/input-formats/textword)
- [Registry](/input-formats/registry)
- [PCAP](/input-formats/pcap)
