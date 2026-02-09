# Input Format Reference (LLM Quick Reference)

Comprehensive reference for all input formats supported by Log Parser. Optimized for LLM lookup and query generation.

## Format Index

| Format | Aliases | CLI Flag | Platform |
|--------|---------|----------|----------|
| CSV | (default) | `-i:CSV` | All |
| TSV | | `-i:TSV` | All |
| JSON | NDJSON | `-i:JSON` | All |
| XML | | `-i:XML` | All |
| W3C | IISW3C | `-i:W3C` | All |
| IIS | IISNATIVE | `-i:IIS` | All |
| BIN | IISBIN | `-i:BIN` | All |
| HTTPERR | | `-i:HTTPERR` | All |
| URLSCAN | | `-i:URLSCAN` | All |
| NCSA | APACHE, NGINX | `-i:NCSA` | All |
| TEXTLINE | TEXT | `-i:TEXTLINE` | All |
| TEXTWORD | WORD | `-i:TEXTWORD` | All |
| SYSLOG | | `-i:SYSLOG` | All |
| EVTX | EVT | `-i:EVTX` | All |
| REG | REGISTRY | `-i:REG` | All |
| PCAP | NETMON, CAP | `-i:PCAP` | All |
| FS | FILESYSTEM | `-i:FS` | All |
| ETW | | `-i:ETW` | Windows only |
| ADS | | `-i:ADS` | Windows only |
| S3 | | `-i:S3` | All (AWS) |
| PARQUET | | `-i:PARQUET` | All |
| FIXEDWIDTH | | `-i:FIXEDWIDTH` | All |

---

## CSV / TSV

**Description**: Comma/tab-separated values with automatic type inference.

**CLI Flags**: `-i:CSV` (default), `-i:TSV`

**Schema**: Dynamic - based on header row

**Common Options**:
- `-iSeparator:CHAR` - Custom delimiter (e.g., `|`, `;`)
- `-headerRow:ON/OFF` - First row as headers (default: ON)
- `-iCodepage:ENCODING` - Character encoding (UTF8, LATIN1, 1252)

**Example**:
```bash
loq "SELECT name, age FROM users.csv WHERE age > 30"
loq -i:TSV "SELECT * FROM data.tsv"
loq -i:CSV -iSeparator:"|" "SELECT * FROM pipe_delimited.txt"
```

**Type Inference**: Integer, Float, Boolean, String (automatic)

**Notes**:
- Quoted fields supported
- Empty values = NULL
- Performance optimized (64KB buffers, fast-path parsing)

---

## JSON / NDJSON

**Description**: JSON arrays and newline-delimited JSON with nested flattening.

**CLI Flags**: `-i:JSON`, `-i:NDJSON`

**Schema**: Dynamic - extracted from JSON structure

**Nested Flattening**: 
- `{"user": {"name": "Alice"}}` → column `"user.name"`
- Arrays converted to JSON string representation

**Example**:
```bash
loq -i:JSON "SELECT id, name FROM users.json WHERE active = true"
loq -i:NDJSON 'SELECT "user.name", status FROM events.ndjson'
```

**Notes**:
- Column names with dots must be quoted: `"user.name"`
- NDJSON more memory-efficient for large files
- Heterogeneous objects supported (missing fields = NULL)

---

## XML

**Description**: XML documents with automatic schema detection.

**CLI Flag**: `-i:XML`

**Schema**: Dynamic - extracted from XML structure

**Options**:
- `-iRowElement:TAG` - Specify which element represents rows

**Column Mapping**:
- `<name>Alice</name>` → column `name`
- `<user id="1">` → column `@id` (attributes)
- `<address><city>NY</city></address>` → column `address.city` (nested)

**Example**:
```bash
loq -i:XML "SELECT name, age FROM users.xml"
loq -i:XML 'SELECT "@id", name FROM products.xml'
loq -i:XML -iRowElement:record "SELECT * FROM data.xml"
```

**Notes**:
- Attribute columns prefixed with `@`
- Nested columns use dot notation
- Empty elements = NULL

---

## W3C / IISW3C (IIS Extended Logs)

**Description**: IIS W3C extended log format.

**CLI Flags**: `-i:W3C`, `-i:IISW3C`

**Schema**: Auto-detected from `#Fields:` directive

**Common Columns**:
- `date`, `time` - Request timestamp
- `s-ip`, `c-ip` - Server/client IP
- `cs-method` - HTTP method (GET, POST)
- `cs-uri-stem`, `cs-uri-query` - Request path and query string
- `sc-status` - HTTP status code
- `time-taken` - Request duration (ms)
- `cs(User-Agent)`, `cs(Referer)` - HTTP headers
- `sc-bytes`, `cs-bytes` - Response/request size

**Example**:
```bash
loq -i:W3C "SELECT date, time, cs-uri-stem, sc-status FROM access.log WHERE sc-status >= 400"
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) FROM u_ex*.log GROUP BY cs-uri-stem"
```

**Notes**:
- Lines starting with `#` are directives (skipped)
- Supports wildcards: `'logs/u_ex*.log'`
- `-` represents null values

---

## IIS / IISNATIVE

**Description**: IIS native log format (fixed 15-field schema).

**CLI Flags**: `-i:IIS`, `-i:IISNATIVE`

**Schema**: Fixed 15 columns

**Columns**:
1. `c-ip` - Client IP
2. `cs-username` - Username
3. `date` - Date
4. `time` - Time
5. `s-computername` - Server name
6. `s-sitename` - Site name
7. `s-ip` - Server IP
8. `time-taken` - Duration (ms)
9. `cs-bytes` - Bytes received
10. `sc-bytes` - Bytes sent
11. `sc-status` - HTTP status
12. `sc-win32-status` - Windows status
13. `cs-method` - HTTP method
14. `cs-uri-stem` - Request path
15. `cs-uri-query` - Query string

**Example**:
```bash
loq -i:IIS "SELECT date, time, cs-uri-stem, sc-status FROM iis_native.log"
```

---

## BIN / IISBIN

**Description**: IIS centralized binary logging format (.ibl files).

**CLI Flags**: `-i:BIN`, `-i:IISBIN`

**Schema**: Dynamic - extracted from binary header

**Example**:
```bash
loq -i:BIN "SELECT * FROM access.ibl"
```

**Notes**:
- More compact than text logs
- Better performance for large datasets
- Cross-platform support

---

## HTTPERR

**Description**: HTTP.sys error logs from Windows IIS.

**CLI Flag**: `-i:HTTPERR`

**Schema**: Dynamic - extracted from `#Fields:` directive

**Common Columns**:
- `date`, `time` - Error timestamp
- `c-ip` - Client IP
- `s-port` - Server port
- `s-siteid` - Site ID
- `s-reason` - Error reason
- `s-queuename` - Request queue name

**Example**:
```bash
loq -i:HTTPERR "SELECT date, time, c-ip, s-reason FROM httperr1.log"
loq -i:HTTPERR "SELECT s-reason, COUNT(*) FROM httperr*.log GROUP BY s-reason"
```

**Notes**:
- Records HTTP.sys kernel-level errors
- Lines starting with `#` are directives

---

## URLSCAN

**Description**: URLScan security logs (IIS security tool).

**CLI Flag**: `-i:URLSCAN`

**Schema**: Fixed 6 columns

**Columns**:
- `date` - Date (YYYY-MM-DD)
- `time` - Time (HH:MM:SS)
- `c-ip` - Client IP
- `cs-uri` - Blocked URI
- `Reason` - Block reason
- `DateTime` - Combined timestamp

**Example**:
```bash
loq -i:URLSCAN "SELECT DateTime, c-ip, cs-uri, Reason FROM urlscan.log"
loq -i:URLSCAN "SELECT Reason, COUNT(*) FROM urlscan.log GROUP BY Reason"
```

**Notes**:
- Logs rejected/blocked requests
- Lines starting with `#` are comments

---

## NCSA / APACHE / NGINX

**Description**: NCSA Common/Combined log format (Apache, Nginx).

**CLI Flags**: `-i:NCSA`, `-i:APACHE`, `-i:NGINX`

**Schema**: Fixed (Common: 9 columns, Combined: 11 columns)

**Columns**:
- `host` - Client IP/hostname
- `ident` - RFC 1413 identity (usually `-`)
- `user` - Authenticated username
- `timestamp` - Request timestamp
- `method` - HTTP method
- `path` - Request path
- `protocol` - HTTP protocol
- `status` - HTTP status code
- `bytes` - Response size
- `referer` - Referrer URL (Combined only)
- `user_agent` - User agent (Combined only)

**Example**:
```bash
loq -i:NCSA "SELECT timestamp, method, path, status FROM access.log WHERE status >= 400"
loq -i:APACHE "SELECT path, COUNT(*) FROM access.log GROUP BY path ORDER BY COUNT(*) DESC"
```

**Notes**:
- Auto-detects Common vs Combined format
- Timestamp format: `DD/Mon/YYYY:HH:MM:SS +/-ZZZZ`

---

## TEXTLINE / TEXT

**Description**: Line-by-line text parsing with optional regex extraction.

**CLI Flags**: `-i:TEXTLINE`, `-i:TEXT`

**Schema**: Single column `Text` (or dynamic with regex)

**Example**:
```bash
loq -i:TEXT "SELECT Text FROM app.log WHERE Text LIKE '%ERROR%'"
loq -i:TEXT "SELECT COUNT(*) FROM file.txt"
```

**Notes**:
- Each line = one row
- Empty lines included
- Regex patterns available in library mode (not CLI)
- Use for unstructured logs

---

## TEXTWORD / WORD

**Description**: Word-by-word parsing with position tracking.

**CLI Flags**: `-i:TEXTWORD`, `-i:WORD`

**Schema**: Fixed 4 columns

**Columns**:
- `Word` - The word text
- `Line` - Line number (1-based)
- `WordIndex` - Word position in line (1-based)
- `Position` - Character offset in file (0-based)

**Example**:
```bash
loq -i:TEXTWORD "SELECT LOWER(Word), COUNT(*) FROM book.txt GROUP BY LOWER(Word) ORDER BY COUNT(*) DESC LIMIT 20"
loq -i:WORD "SELECT Word, Line FROM log.txt WHERE Word LIKE 'ERROR%'"
```

**Notes**:
- Whitespace-delimited
- Punctuation included with words
- Useful for word frequency analysis

---

## SYSLOG

**Description**: Syslog RFC 3164 (BSD) and RFC 5424 formats.

**CLI Flag**: `-i:SYSLOG`

**Schema**: Dynamic (9+ columns)

**Columns**:
- `priority` - Priority value
- `facility` - Facility code (0-23)
- `severity` - Severity level (0-7)
- `timestamp` - Event timestamp
- `hostname` - Source hostname
- `app_name` - Application name
- `proc_id` - Process ID (RFC 5424)
- `msg_id` - Message ID (RFC 5424)
- `message` - Log message

**Severity Levels**:
- 0=emerg, 1=alert, 2=crit, 3=err, 4=warning, 5=notice, 6=info, 7=debug

**Example**:
```bash
loq -i:SYSLOG "SELECT timestamp, hostname, message FROM /var/log/syslog WHERE severity <= 3"
loq -i:SYSLOG "SELECT app_name, COUNT(*) FROM messages.log GROUP BY app_name"
```

**Notes**:
- Auto-detects RFC 3164 vs 5424
- Priority = (Facility * 8) + Severity

---

## EVTX / EVT

**Description**: Windows Event Log files (.evtx) - cross-platform.

**CLI Flags**: `-i:EVTX`, `-i:EVT`

**Schema**: Dynamic (10+ columns + EventData fields)

**Core Columns**:
- `EventID` - Event identifier
- `Level` - Severity (0=Always, 1=Critical, 2=Error, 3=Warning, 4=Info, 5=Verbose)
- `TimeCreated` - Event timestamp
- `Computer` - Source computer
- `Channel` - Log channel (Security, System, Application)
- `Provider` - Event provider name
- `EventRecordId` - Unique record ID
- `ProcessId`, `ThreadId` - Process/thread IDs
- `Message` - Event message
- `EventData.*` - Event-specific fields (dot notation)

**Example**:
```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Message FROM System.evtx WHERE Level <= 2"
loq -i:EVTX "SELECT EventID, COUNT(*) FROM Security.evtx GROUP BY EventID"
loq -i:EVTX "SELECT TimeCreated, EventData.TargetUserName FROM Security.evtx WHERE EventID = 4624"
```

**Notes**:
- Cross-platform (no Windows APIs required)
- EventData fields accessed with dot notation
- Common Security Events: 4624 (logon), 4625 (failed logon), 4740 (lockout)

---

## REG / REGISTRY

**Description**: Windows Registry export files (.reg) - cross-platform.

**CLI Flags**: `-i:REG`, `-i:REGISTRY`

**Schema**: Fixed 5 columns

**Columns**:
- `KeyPath` - Full registry key path
- `ValueName` - Registry value name (or "(Default)")
- `ValueType` - Type (REG_SZ, REG_DWORD, REG_BINARY, REG_EXPAND_SZ, REG_MULTI_SZ)
- `Value` - Value data (as string)
- `LastWriteTime` - Modification time (NULL for .reg files)

**Example**:
```bash
loq -i:REG "SELECT KeyPath, ValueName, Value FROM export.reg WHERE KeyPath LIKE '%Software%'"
loq -i:REG "SELECT ValueType, COUNT(*) FROM system.reg GROUP BY ValueType"
```

**Notes**:
- Cross-platform (reads .reg exports)
- Export with `reg export HKLM output.reg` (Windows)
- DWORD values displayed as decimal

---

## PCAP / NETMON / CAP

**Description**: Network packet capture files - cross-platform.

**CLI Flags**: `-i:PCAP`, `-i:NETMON`, `-i:CAP`

**Schema**: Fixed 8 columns

**Columns**:
- `Timestamp` - Packet capture time
- `SourceIP` - Source IP address
- `DestIP` - Destination IP address
- `SourcePort` - Source port
- `DestPort` - Destination port
- `Protocol` - Protocol (TCP, UDP, ICMP, etc.)
- `Length` - Packet length (bytes)
- `Data` - Packet payload (hex)

**Example**:
```bash
loq -i:PCAP "SELECT SourceIP, DestIP, Protocol FROM traffic.pcap"
loq -i:PCAP "SELECT Protocol, COUNT(*), SUM(Length) FROM capture.pcap GROUP BY Protocol"
```

**Notes**:
- Supports .pcap and .pcapng formats
- Cross-platform (no WinPcap required)
- Large captures may require significant memory

---

## FS / FILESYSTEM

**Description**: Query file/directory metadata.

**CLI Flags**: `-i:FS`, `-i:FILESYSTEM`

**Schema**: Fixed 10 columns

**Columns**:
- `Name` - File/directory name
- `Path` - Full absolute path
- `Size` - Size in bytes
- `Extension` - File extension (no dot)
- `IsDirectory` - Boolean
- `IsReadOnly` - Boolean
- `IsHidden` - Boolean
- `Created` - Creation timestamp
- `LastModified` - Modification timestamp
- `LastAccessed` - Access timestamp

**Options**:
- `-recurse:N` - Recursion depth (-1 = unlimited)

**Example**:
```bash
loq -i:FS "SELECT Name, Size FROM '.' WHERE Extension = 'log' ORDER BY Size DESC"
loq -i:FS -recurse:3 "SELECT Extension, SUM(Size) FROM '.' GROUP BY Extension"
loq -i:FS "SELECT * FROM '/var/log' WHERE IsDirectory = false"
```

**Notes**:
- Wildcards supported: `'*.log'`
- Hidden files: `.` prefix (Unix) or hidden attribute (Windows)
- Skips files without read permission

---

## ETW (Event Tracing for Windows)

**Description**: Real-time Windows event tracing (Windows only).

**CLI Flag**: `-i:ETW`

**Platform**: Windows only

**Example**:
```bash
loq -i:ETW "SELECT * FROM 'Microsoft-Windows-Kernel-Process'"
```

**Notes**:
- Requires Windows
- Real-time event tracing
- Administrative privileges may be required

---

## ADS (Active Directory)

**Description**: Query Active Directory objects (Windows only).

**CLI Flag**: `-i:ADS`

**Platform**: Windows only

**Example**:
```bash
loq -i:ADS "SELECT cn, mail FROM 'LDAP://DC=example,DC=com' WHERE objectClass='user'"
```

**Notes**:
- Requires Windows with domain access
- LDAP-style paths
- Schema depends on AD objects queried

---

## S3 (Amazon S3)

**Description**: Query files in Amazon S3 buckets.

**CLI Flag**: `-i:S3`

**Schema**: Dynamic - depends on file format

**Authentication**: AWS credential chain (env vars, ~/.aws/credentials, IAM role)

**URL Formats**:
- Single file: `s3://bucket/key.csv`
- Glob pattern: `s3://bucket/logs/*.csv`
- Prefix: `s3://bucket/prefix/`

**Compression**: Automatic .gz decompression

**Example**:
```bash
loq -i:S3 "SELECT * FROM 's3://my-logs/access.csv' LIMIT 100"
loq -i:S3 "SELECT status, COUNT(*) FROM 's3://logs/2024-01-*.csv.gz' GROUP BY status"
```

**Environment Variables**:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` or `AWS_DEFAULT_REGION`
- `AWS_PROFILE`

**Notes**:
- Supports CSV, JSON, NDJSON, Parquet
- S3 charges for data transfer
- Use specific prefixes to minimize cost

---

## PARQUET

**Description**: Apache Parquet columnar format.

**CLI Flag**: `-i:PARQUET`

**Schema**: Dynamic - from Parquet metadata

**Compression**: All codecs supported (Snappy, Gzip, LZ4, Zstd, Brotli)

**Type Mapping**:
- INT32/INT64 → Integer
- FLOAT/DOUBLE → Float
- BOOLEAN → Boolean
- BYTE_ARRAY (UTF8) → String
- DATE/TIMESTAMP/INT96 → DateTime

**Example**:
```bash
loq -i:PARQUET "SELECT id, name, amount FROM sales.parquet WHERE year = 2024"
loq -i:PARQUET "SELECT category, SUM(amount) FROM data.parquet GROUP BY category"
```

**Performance**:
- Column pruning: Only reads requested columns
- Predicate pushdown: Skips row groups based on filters
- Excellent for large datasets

**Notes**:
- 50-90% smaller than CSV
- Binary format (not human-readable)
- Best for repeated analytics queries

---

## FIXEDWIDTH

**Description**: Fixed-width/columnar text files.

**CLI Flag**: `-i:FIXEDWIDTH`

**Schema**: Dynamic - defined via `--iFieldDef`

**Options**:
- `--iFieldDef "name:start-end,..."` - Field definitions

**Field Syntax**:
- `name:0-9` - Characters 0-9 (10 chars)
- `name:10-` - Character 10 to end of line
- `name:5-5` - Single character at position 5

**Example**:
```bash
loq -i:FIXEDWIDTH --iFieldDef "id:0-4,name:5-24,amount:25-34" "SELECT * FROM ledger.txt"
loq -i:FIXEDWIDTH --iFieldDef "code:0-3,desc:4-29,qty:30-35" "SELECT * FROM inventory.txt WHERE qty > 100"
```

**Notes**:
- 0-indexed positions
- Trailing spaces trimmed by default
- Common in mainframe/legacy systems

---

## Common Options (All Formats)

**Input Options**:
- `-i:FORMAT` - Specify input format
- `-e:N` - Max parse errors before abort (-1 = unlimited, default: 10)
- `-headerRow:ON/OFF` - Control header row parsing (CSV/TSV)
- `-recurse:N` - Recursion depth for file patterns

**Query Examples**:
```bash
# Wildcards
loq -i:CSV "SELECT * FROM 'logs/*.csv'"

# Recursion
loq -i:W3C -recurse:2 "SELECT * FROM '/var/log/*.log'"

# Error tolerance
loq -i:CSV -e:-1 "SELECT * FROM messy_data.csv"
```

---

## Type System

**Automatic Type Inference** (CSV, JSON, XML):
- **Integer**: `42`, `-100`, `0`
- **Float**: `3.14`, `-0.5`, `1.0e10`
- **Boolean**: `true`, `false`, `TRUE`, `FALSE`
- **DateTime**: ISO 8601 format
- **String**: Default fallback

**Explicit Conversion**:
```sql
SELECT
    CAST(id AS INTEGER),
    TO_TIMESTAMP(date_str, '%Y-%m-%d'),
    TO_FLOAT(amount)
FROM data.csv
```

---

## Quick Format Selection Guide

**Web Server Logs**: W3C, IIS, NCSA, APACHE, NGINX  
**System Logs**: SYSLOG, EVTX  
**Structured Data**: CSV, TSV, JSON, XML, PARQUET  
**Network**: PCAP, NETMON  
**Windows**: EVTX, REG, HTTPERR, URLSCAN, ETW, ADS, IIS, BIN  
**Cloud**: S3  
**Filesystem**: FS  
**Unstructured Text**: TEXTLINE, TEXTWORD  
**Legacy**: FIXEDWIDTH

---

## Example Queries by Use Case

**Find Errors in Logs**:
```bash
loq -i:W3C "SELECT * FROM access.log WHERE sc-status >= 500"
loq -i:SYSLOG "SELECT * FROM /var/log/syslog WHERE severity <= 3"
loq -i:TEXT "SELECT * FROM app.log WHERE Text LIKE '%ERROR%'"
```

**Aggregate Statistics**:
```bash
loq -i:NCSA "SELECT path, COUNT(*) FROM access.log GROUP BY path ORDER BY COUNT(*) DESC LIMIT 10"
loq -i:PARQUET "SELECT category, SUM(amount) FROM sales.parquet GROUP BY category"
```

**File System Analysis**:
```bash
loq -i:FS -recurse:3 "SELECT Extension, SUM(Size) FROM '.' GROUP BY Extension ORDER BY SUM(Size) DESC"
```

**Security Analysis**:
```bash
loq -i:EVTX "SELECT TimeCreated, EventData.TargetUserName FROM Security.evtx WHERE EventID = 4625"
loq -i:URLSCAN "SELECT Reason, COUNT(*) FROM urlscan.log GROUP BY Reason"
```

**Cloud Data**:
```bash
loq -i:S3 "SELECT * FROM 's3://bucket/logs/*.csv.gz' WHERE status >= 400"
```
