# NCSA / Apache / Nginx

Parse NCSA Common Log Format and Combined Log Format used by Apache, Nginx, and other web servers.

## Usage

```bash
loq -i:NCSA "SELECT * FROM access.log"
loq -i:APACHE "SELECT * FROM access.log"
loq -i:NGINX "SELECT * FROM access.log"
```

All three aliases (`NCSA`, `APACHE`, `NGINX`) work identically.

## Log Formats

### Common Log Format (CLF)

```
127.0.0.1 - frank [10/Oct/2024:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
```

### Combined Log Format

Extends CLF with referrer and user agent:

```
127.0.0.1 - frank [10/Oct/2024:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 "http://www.example.com/start.html" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

## Schema

| Column | Description | Example |
|--------|-------------|---------|
| `host` | Client IP or hostname | `127.0.0.1` |
| `ident` | RFC 1413 identity (usually `-`) | `-` |
| `user` | Authenticated username | `frank` |
| `timestamp` | Request timestamp | `10/Oct/2024:13:55:36 -0700` |
| `method` | HTTP method | `GET` |
| `path` | Request path | `/apache_pb.gif` |
| `protocol` | HTTP protocol | `HTTP/1.0` |
| `status` | HTTP status code | `200` |
| `bytes` | Response size in bytes | `2326` |
| `referer` | Referrer URL (Combined only) | `http://www.example.com/` |
| `user_agent` | User agent (Combined only) | `Mozilla/5.0...` |

## Auto-Detection

loq automatically detects Common vs Combined format based on the number of fields.

## Examples

### View Recent Requests

```bash
loq -i:NCSA "SELECT timestamp, method, path, status
                   FROM access.log
                   LIMIT 20"
```

### Analyze Status Codes

```bash
loq -i:NCSA "SELECT status, COUNT(*) AS count
                   FROM access.log
                   GROUP BY status
                   ORDER BY count DESC"
```

### Find Errors

```bash
loq -i:NCSA "SELECT timestamp, host, path, status
                   FROM access.log
                   WHERE status >= 400
                   ORDER BY timestamp DESC
                   LIMIT 50"
```

### Top Requested URLs

```bash
loq -i:NCSA "SELECT path, COUNT(*) AS requests
                   FROM access.log
                   GROUP BY path
                   ORDER BY requests DESC
                   LIMIT 20"
```

### Client Analysis

```bash
loq -i:NCSA "SELECT host, COUNT(*) AS requests
                   FROM access.log
                   GROUP BY host
                   ORDER BY requests DESC
                   LIMIT 20"
```

### Bandwidth Usage

```bash
loq -i:NCSA "SELECT path, SUM(bytes) AS total_bytes
                   FROM access.log
                   GROUP BY path
                   ORDER BY total_bytes DESC
                   LIMIT 20"
```

### User Agent Analysis (Combined Format)

```bash
loq -i:NCSA "SELECT user_agent, COUNT(*) AS requests
                   FROM access.log
                   WHERE user_agent IS NOT NULL
                   GROUP BY user_agent
                   ORDER BY requests DESC
                   LIMIT 10"
```

### Referrer Analysis (Combined Format)

```bash
loq -i:NCSA "SELECT referer, COUNT(*) AS count
                   FROM access.log
                   WHERE referer IS NOT NULL
                     AND referer != '-'
                   GROUP BY referer
                   ORDER BY count DESC
                   LIMIT 20"
```

### HTTP Methods

```bash
loq -i:NCSA "SELECT method, COUNT(*) AS count
                   FROM access.log
                   GROUP BY method
                   ORDER BY count DESC"
```

## Common Patterns

### 404 Errors

```bash
loq -i:NCSA "SELECT path, COUNT(*) AS count
                   FROM access.log
                   WHERE status = 404
                   GROUP BY path
                   ORDER BY count DESC
                   LIMIT 20"
```

### Slow Responses (if using extended format)

```bash
# Note: Standard NCSA format doesn't include response time
# This works with extended formats that include it
loq -i:NCSA "SELECT path, AVG(time) AS avg_time
                   FROM access.log
                   GROUP BY path
                   ORDER BY avg_time DESC
                   LIMIT 20"
```

### Bot Traffic

```bash
loq -i:NCSA "SELECT user_agent, COUNT(*) AS count
                   FROM access.log
                   WHERE user_agent LIKE '%bot%'
                      OR user_agent LIKE '%crawler%'
                      OR user_agent LIKE '%spider%'
                   GROUP BY user_agent
                   ORDER BY count DESC"
```

### Specific User Activity

```bash
loq -i:NCSA "SELECT timestamp, path, status
                   FROM access.log
                   WHERE user = 'admin'
                   ORDER BY timestamp DESC"
```

### Traffic by Hour

```bash
loq -i:NCSA "SELECT SUBSTR(timestamp, 13, 2) AS hour, COUNT(*) AS requests
                   FROM access.log
                   GROUP BY hour
                   ORDER BY hour"
```

## Multiple Log Files

### Wildcard Pattern

```bash
loq -i:NCSA "SELECT * FROM 'logs/access*.log'"
```

### Recursive Search

```bash
loq -i:NCSA -recurse:2 "SELECT * FROM '/var/log/apache2/*.log'"
```

### Rotated Logs

```bash
# Query current and rotated logs
loq -i:NCSA "SELECT * FROM 'access.log*'"
```

## Comparison with W3C Format

| Feature | NCSA | W3C |
|---------|------|-----|
| Server IP | No | Yes |
| Response time | No (standard) | Yes |
| Substatus | No | Yes |
| Custom fields | No | Yes |
| Referrer | Combined only | Optional |
| User agent | Combined only | Optional |

## Troubleshooting

### Parse Errors

If logs don't parse correctly:

1. Check for custom log format
2. Verify all fields are present
3. Check for malformed entries

### Missing Columns

- `referer` and `user_agent` only exist in Combined format
- Check your server configuration for the log format

### Timestamp Parsing

The NCSA timestamp format is `DD/Mon/YYYY:HH:MM:SS +/-ZZZZ`:

```
10/Oct/2024:13:55:36 -0700
```

Use SUBSTR or custom parsing for date filtering:

```sql
SELECT * FROM access.log
WHERE timestamp LIKE '%Oct/2024%'
```

## See Also

- [Input Formats Overview](/input-formats/)
- [W3C / IIS](/input-formats/w3c)
- [Syslog](/input-formats/syslog)
