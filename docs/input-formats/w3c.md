# W3C / IIS Logs

Parse IIS W3C extended log format and IIS native log format.

## Formats

| Format | Flag | Description |
|--------|------|-------------|
| W3C Extended | `-i:W3C` or `-i:IISW3C` | W3C extended log format (most common) |
| IIS Native | `-i:IIS` or `-i:IISNATIVE` | Fixed 15-field IIS native format |

## W3C Extended Format

The W3C extended log format is a flexible, customizable format used by IIS and other web servers.

### Usage

```bash
loq -i:W3C "SELECT * FROM access.log"
loq -i:IISW3C "SELECT * FROM u_ex240115.log"
```

### File Format

```
#Software: Microsoft Internet Information Services 10.0
#Version: 1.0
#Date: 2024-01-15 00:00:00
#Fields: date time s-ip cs-method cs-uri-stem cs-uri-query s-port cs-username c-ip cs(User-Agent) cs(Referer) sc-status sc-substatus sc-win32-status time-taken
2024-01-15 00:00:01 192.168.1.1 GET /api/users - 443 - 10.0.0.1 Mozilla/5.0+(Windows) - 200 0 0 125
2024-01-15 00:00:02 192.168.1.1 POST /api/login - 443 - 10.0.0.2 curl/7.68.0 - 401 0 0 45
```

### Common Columns

| Column | Description |
|--------|-------------|
| `date` | Date of request (YYYY-MM-DD) |
| `time` | Time of request (HH:MM:SS) |
| `s-ip` | Server IP address |
| `cs-method` | HTTP method (GET, POST, etc.) |
| `cs-uri-stem` | Request path |
| `cs-uri-query` | Query string |
| `s-port` | Server port |
| `cs-username` | Authenticated username |
| `c-ip` | Client IP address |
| `cs(User-Agent)` | User agent string |
| `cs(Referer)` | Referrer URL |
| `sc-status` | HTTP status code |
| `sc-substatus` | HTTP substatus code |
| `sc-win32-status` | Windows status code |
| `time-taken` | Request duration (ms) |
| `sc-bytes` | Bytes sent |
| `cs-bytes` | Bytes received |

### Auto-Detection

loq automatically parses the `#Fields:` directive to determine available columns.

## IIS Native Format

The IIS native format is a fixed 15-field comma-separated format.

### Usage

```bash
loq -i:IIS "SELECT * FROM iis_native.log"
```

### Fixed Schema

| Position | Column | Description |
|----------|--------|-------------|
| 1 | `c-ip` | Client IP |
| 2 | `cs-username` | Username |
| 3 | `date` | Date |
| 4 | `time` | Time |
| 5 | `s-computername` | Server name |
| 6 | `s-sitename` | Site name |
| 7 | `s-ip` | Server IP |
| 8 | `time-taken` | Duration (ms) |
| 9 | `cs-bytes` | Bytes received |
| 10 | `sc-bytes` | Bytes sent |
| 11 | `sc-status` | HTTP status |
| 12 | `sc-win32-status` | Windows status |
| 13 | `cs-method` | HTTP method |
| 14 | `cs-uri-stem` | Request path |
| 15 | `cs-uri-query` | Query string |

## Examples

### View Recent Requests

```bash
loq -i:W3C "SELECT date, time, cs-method, cs-uri-stem, sc-status
                  FROM access.log
                  LIMIT 20"
```

### Analyze HTTP Status Codes

```bash
loq -i:W3C "SELECT sc-status, COUNT(*) AS count
                  FROM access.log
                  GROUP BY sc-status
                  ORDER BY count DESC"
```

### Find Errors

```bash
loq -i:W3C "SELECT date, time, c-ip, cs-uri-stem, sc-status
                  FROM access.log
                  WHERE sc-status >= 400
                  ORDER BY date DESC, time DESC
                  LIMIT 50"
```

### Slow Requests

```bash
loq -i:W3C "SELECT date, time, cs-uri-stem, time-taken
                  FROM access.log
                  WHERE time-taken > 5000
                  ORDER BY time-taken DESC
                  LIMIT 20"
```

### Top Requested URLs

```bash
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) AS requests, AVG(time-taken) AS avg_time
                  FROM access.log
                  GROUP BY cs-uri-stem
                  ORDER BY requests DESC
                  LIMIT 20"
```

### Client Analysis

```bash
loq -i:W3C "SELECT c-ip, COUNT(*) AS requests
                  FROM access.log
                  GROUP BY c-ip
                  ORDER BY requests DESC
                  LIMIT 20"
```

### User Agent Analysis

```bash
loq -i:W3C "SELECT cs(User-Agent), COUNT(*) AS requests
                  FROM access.log
                  GROUP BY cs(User-Agent)
                  ORDER BY requests DESC
                  LIMIT 10"
```

### Time-Based Analysis

```bash
# Requests per hour
loq -i:W3C "SELECT SUBSTR(time, 1, 2) AS hour, COUNT(*) AS requests
                  FROM access.log
                  GROUP BY hour
                  ORDER BY hour"

# Requests per day
loq -i:W3C "SELECT date, COUNT(*) AS requests
                  FROM access.log
                  GROUP BY date
                  ORDER BY date"
```

### Bandwidth Analysis

```bash
loq -i:W3C "SELECT date, SUM(sc-bytes) AS total_bytes
                  FROM access.log
                  GROUP BY date
                  ORDER BY date"
```

### Generate Chart

```bash
loq -i:W3C -o:CHART -chartType:Bar -chartTitle:"HTTP Status Codes" \
          --ofile:status.png \
          "SELECT sc-status, COUNT(*) FROM access.log GROUP BY sc-status"
```

## Multiple Log Files

### Wildcard Pattern

```bash
loq -i:W3C "SELECT * FROM 'logs/u_ex*.log'"
```

### Recursive Search

```bash
loq -i:W3C -recurse:2 "SELECT * FROM 'logs/*.log'"
```

## Combining with Date Filtering

```bash
loq -i:W3C "SELECT * FROM access.log
                  WHERE date >= '2024-01-01'
                  AND date <= '2024-01-31'"
```

## Common Patterns

### 404 Errors

```bash
loq -i:W3C "SELECT cs-uri-stem, COUNT(*) AS count
                  FROM access.log
                  WHERE sc-status = 404
                  GROUP BY cs-uri-stem
                  ORDER BY count DESC"
```

### 500 Errors with Details

```bash
loq -i:W3C "SELECT date, time, c-ip, cs-uri-stem, cs-uri-query, sc-win32-status
                  FROM access.log
                  WHERE sc-status >= 500
                  ORDER BY date DESC, time DESC"
```

### Authentication Failures

```bash
loq -i:W3C "SELECT date, time, c-ip, cs-uri-stem
                  FROM access.log
                  WHERE sc-status = 401
                  ORDER BY date DESC, time DESC"
```

### Bot Detection

```bash
loq -i:W3C "SELECT cs(User-Agent), COUNT(*) AS count
                  FROM access.log
                  WHERE cs(User-Agent) LIKE '%bot%'
                     OR cs(User-Agent) LIKE '%crawler%'
                     OR cs(User-Agent) LIKE '%spider%'
                  GROUP BY cs(User-Agent)
                  ORDER BY count DESC"
```

## See Also

- [Input Formats Overview](/input-formats/)
- [NCSA / Apache](/input-formats/ncsa)
- [Chart Output](/output-formats/chart)
