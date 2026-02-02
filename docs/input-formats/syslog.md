# Syslog

Parse syslog messages in RFC 3164 (BSD) and RFC 5424 formats.

## Usage

```bash
loq -i:SYSLOG "SELECT * FROM /var/log/syslog"
loq -i:SYSLOG "SELECT * FROM messages.log"
```

## Supported Formats

### RFC 3164 (BSD Syslog)

Traditional syslog format:

```
<34>Oct 11 22:14:15 mymachine su: 'su root' failed for lonvick on /dev/pts/8
```

### RFC 5424 (Modern Syslog)

Structured syslog with more fields:

```
<34>1 2024-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed
```

loq auto-detects the format.

## Schema

| Column | RFC 3164 | RFC 5424 | Description |
|--------|----------|----------|-------------|
| `priority` | Yes | Yes | Priority value (facility * 8 + severity) |
| `facility` | Yes | Yes | Facility code (0-23) |
| `severity` | Yes | Yes | Severity level (0-7) |
| `timestamp` | Yes | Yes | Event timestamp |
| `hostname` | Yes | Yes | Source hostname |
| `app_name` | Partial | Yes | Application name |
| `proc_id` | No | Yes | Process ID |
| `msg_id` | No | Yes | Message ID |
| `message` | Yes | Yes | Log message |

### Facility Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | kern | Kernel messages |
| 1 | user | User-level messages |
| 2 | mail | Mail system |
| 3 | daemon | System daemons |
| 4 | auth | Security/authorization |
| 5 | syslog | Syslogd internal |
| 6 | lpr | Printer subsystem |
| 7 | news | News subsystem |
| 8 | uucp | UUCP subsystem |
| 9 | cron | Cron daemon |
| 10 | authpriv | Security/authorization (private) |
| 11 | ftp | FTP daemon |
| 16-23 | local0-7 | Local use |

### Severity Levels

| Code | Name | Description |
|------|------|-------------|
| 0 | emerg | System is unusable |
| 1 | alert | Action must be taken immediately |
| 2 | crit | Critical conditions |
| 3 | err | Error conditions |
| 4 | warning | Warning conditions |
| 5 | notice | Normal but significant |
| 6 | info | Informational |
| 7 | debug | Debug-level messages |

## Examples

### View All Messages

```bash
loq -i:SYSLOG "SELECT * FROM /var/log/syslog LIMIT 20"
```

### Filter by Severity

```bash
# Errors and above (severity <= 3)
loq -i:SYSLOG "SELECT timestamp, hostname, message
                     FROM /var/log/syslog
                     WHERE severity <= 3
                     ORDER BY timestamp DESC"
```

### Filter by Facility

```bash
# Auth messages only (facility = 4 or 10)
loq -i:SYSLOG "SELECT timestamp, hostname, message
                     FROM /var/log/auth.log
                     WHERE facility IN (4, 10)"
```

### Filter by Hostname

```bash
loq -i:SYSLOG "SELECT timestamp, message
                     FROM /var/log/syslog
                     WHERE hostname = 'webserver01'"
```

### Filter by Application

```bash
loq -i:SYSLOG "SELECT timestamp, message
                     FROM /var/log/syslog
                     WHERE app_name = 'sshd'"
```

### Search Messages

```bash
loq -i:SYSLOG "SELECT timestamp, hostname, message
                     FROM /var/log/syslog
                     WHERE message LIKE '%error%'
                     ORDER BY timestamp DESC
                     LIMIT 50"
```

### Count by Severity

```bash
loq -i:SYSLOG "SELECT severity, COUNT(*) AS count
                     FROM /var/log/syslog
                     GROUP BY severity
                     ORDER BY severity"
```

### Count by Host

```bash
loq -i:SYSLOG "SELECT hostname, COUNT(*) AS count
                     FROM /var/log/syslog
                     GROUP BY hostname
                     ORDER BY count DESC"
```

### Count by Application

```bash
loq -i:SYSLOG "SELECT app_name, COUNT(*) AS count
                     FROM /var/log/syslog
                     GROUP BY app_name
                     ORDER BY count DESC
                     LIMIT 20"
```

## Common Patterns

### Security Events

```bash
loq -i:SYSLOG "SELECT timestamp, hostname, message
                     FROM /var/log/auth.log
                     WHERE message LIKE '%Failed password%'
                     ORDER BY timestamp DESC
                     LIMIT 50"
```

### SSH Login Attempts

```bash
loq -i:SYSLOG "SELECT timestamp, hostname, message
                     FROM /var/log/auth.log
                     WHERE app_name = 'sshd'
                       AND (message LIKE '%Accepted%' OR message LIKE '%Failed%')
                     ORDER BY timestamp DESC"
```

### Cron Job Logs

```bash
loq -i:SYSLOG "SELECT timestamp, message
                     FROM /var/log/syslog
                     WHERE app_name = 'CRON'
                     ORDER BY timestamp DESC"
```

### Kernel Messages

```bash
loq -i:SYSLOG "SELECT timestamp, message
                     FROM /var/log/kern.log
                     WHERE severity <= 4
                     ORDER BY timestamp DESC"
```

### Error Trends

```bash
loq -i:SYSLOG "SELECT SUBSTR(timestamp, 1, 10) AS date,
                            severity,
                            COUNT(*) AS count
                     FROM /var/log/syslog
                     WHERE severity <= 4
                     GROUP BY date, severity
                     ORDER BY date, severity"
```

## Multiple Log Files

### All Syslog Files

```bash
loq -i:SYSLOG "SELECT * FROM '/var/log/syslog*'"
```

### Rotated Logs

```bash
# Query current and rotated logs
loq -i:SYSLOG "SELECT * FROM '/var/log/messages*'"
```

### Recursive Search

```bash
loq -i:SYSLOG -recurse:2 "SELECT * FROM '/var/log/*.log'"
```

## Time-Based Analysis

### Recent Errors

```bash
loq -i:SYSLOG "SELECT timestamp, hostname, app_name, message
                     FROM /var/log/syslog
                     WHERE severity <= 3
                     ORDER BY timestamp DESC
                     LIMIT 100"
```

### Hourly Error Rate

```bash
loq -i:SYSLOG "SELECT SUBSTR(timestamp, 12, 2) AS hour, COUNT(*) AS errors
                     FROM /var/log/syslog
                     WHERE severity <= 3
                     GROUP BY hour
                     ORDER BY hour"
```

## Priority Calculation

Priority = (Facility × 8) + Severity

```sql
-- Extract facility and severity from priority
SELECT
    priority,
    FLOOR(priority / 8) AS facility,
    MOD(priority, 8) AS severity
FROM /var/log/syslog
```

## Troubleshooting

### Parse Errors

If messages don't parse correctly:

1. Check the syslog format (RFC 3164 vs 5424)
2. Verify timestamp format
3. Check for malformed entries

### Missing Fields

Some fields may be empty depending on the format:

- `proc_id` and `msg_id` are only in RFC 5424
- `app_name` may be missing in some RFC 3164 messages

### Timestamp Formats

RFC 3164: `Oct 11 22:14:15`
RFC 5424: `2024-10-11T22:14:15.003Z`

## See Also

- [Input Formats Overview](/input-formats/)
- [EVTX](/input-formats/evtx)
- [Syslog Output](/output-formats/)
