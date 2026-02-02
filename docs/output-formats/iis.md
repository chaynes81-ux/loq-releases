# IIS Output

Export query results in IIS native log format.

## Overview

The IIS output format (`-o:IIS` or `-o:IISNATIVE`) writes data in the IIS native log format used by Microsoft Internet Information Services. This is a comma-separated format with specific characteristics:

- **Comma + space separator**: Fields are separated by `, ` (comma followed by space)
- **No header line**: Output contains data rows only (fixed 15-field schema expected)
- **No quoting**: Fields are written without quotes, even if they contain special characters
- **Null representation**: NULL values are written as `-` (hyphen)

This format is useful for generating log files that can be consumed by IIS log analysis tools or for converting logs from other formats to IIS native format.

## Usage

```bash
# Basic usage
loq -o:IIS "SELECT * FROM access.log"

# With alias
loq -o:IISNATIVE "SELECT * FROM access.log"

# Output to file
loq -o:IIS --ofile:output.log "SELECT * FROM access.log"
```

## Output Format

Each row is written as comma-space separated values with no header:

```
192.168.1.100, admin, 2024-01-15, 14:30:00, WEBSERVER, Default Web Site, 10.0.0.1, 125, 1024, 512, 200, 0, GET, /api/users, id=123
192.168.1.101, -, 2024-01-15, 14:30:01, WEBSERVER, Default Web Site, 10.0.0.1, 45, 256, 128, 404, 0, GET, /missing, -
```

## Field Mapping

The IIS native format expects a fixed 15-field schema. Query results are mapped to these fields in order:

| Position | Field Name | Description |
|----------|------------|-------------|
| 1 | `client_ip` | Client IP address |
| 2 | `user_name` | Authenticated username |
| 3 | `date` | Date of request (YYYY-MM-DD) |
| 4 | `time` | Time of request (HH:MM:SS) |
| 5 | `service` | Service name (e.g., W3SVC1) |
| 6 | `server_name` | Server computer name |
| 7 | `server_ip` | Server IP address |
| 8 | `time_taken` | Request duration in milliseconds |
| 9 | `bytes_sent` | Bytes sent to client |
| 10 | `bytes_received` | Bytes received from client |
| 11 | `status` | HTTP status code |
| 12 | `windows_status` | Windows status code |
| 13 | `request` | HTTP method (GET, POST, etc.) |
| 14 | `target` | Request URI stem |
| 15 | `parameters` | Query string parameters |

## Examples

### Basic Export

```bash
loq -o:IIS --ofile:iis_logs.log "SELECT * FROM access.csv"
```

### Converting from W3C Format

Convert W3C extended logs to IIS native format:

```bash
loq -i:W3C -o:IIS --ofile:native.log \
    "SELECT c-ip, cs-username, date, time,
            'W3SVC1' AS service, s-computername, s-ip,
            time-taken, sc-bytes, cs-bytes,
            sc-status, sc-win32-status, cs-method,
            cs-uri-stem, cs-uri-query
     FROM access.log"
```

### Converting from NCSA/Apache Format

Convert Apache combined logs to IIS native format:

```bash
loq -i:NCSA -o:IIS --ofile:native.log \
    "SELECT remote_host, remote_user,
            TO_DATE(time) AS date, TO_TIME(time) AS time,
            'W3SVC1' AS service, 'SERVER' AS server_name, '-' AS server_ip,
            '-' AS time_taken, bytes, '-' AS bytes_received,
            status, '0' AS win_status, method, uri, query
     FROM access.log"
```

### Filtering Before Export

Export only error responses:

```bash
loq -i:W3C -o:IIS --ofile:errors.log \
    "SELECT c-ip, cs-username, date, time,
            'W3SVC1', s-computername, s-ip,
            time-taken, sc-bytes, cs-bytes,
            sc-status, sc-win32-status, cs-method,
            cs-uri-stem, cs-uri-query
     FROM access.log
     WHERE sc-status >= 400"
```

### From CSV Data

Export arbitrary CSV data as IIS format:

```bash
loq -o:IIS --ofile:output.log \
    "SELECT ip, username, request_date, request_time,
            service, server, server_ip,
            duration, sent, received,
            http_status, win_status, method, path, params
     FROM requests.csv"
```

## NULL Handling

NULL values are output as a hyphen (`-`), which is the standard IIS convention:

```
192.168.1.100, -, 2024-01-15, 14:30:00, W3SVC1, SERVER, 10.0.0.1, 125, 1024, -, 200, 0, GET, /index.html, -
```

In this example, the username and parameters fields are NULL.

## Type Handling

| SQL Type | Output |
|----------|--------|
| Integer | Number as string |
| Float | Number as string |
| Boolean | `true` or `false` |
| String | String value (unquoted) |
| NULL | `-` |
| DateTime | ISO 8601 format |

## When to Use This Format

Use IIS output format when:

- **Generating test data**: Create synthetic IIS logs for testing log analysis tools
- **Format conversion**: Convert logs from other formats (W3C, NCSA, CSV) to IIS native format
- **Tool compatibility**: Output data for tools that specifically require IIS native format
- **Log aggregation**: Standardize logs from multiple sources into IIS native format

## Considerations

### No Column Flexibility

Unlike CSV or JSON output, IIS native format has no header row. Consuming tools expect exactly 15 fields in the prescribed order. Ensure your query produces the correct number and order of columns.

### No Quoting

Field values are not quoted. If your data contains commas, the output may not parse correctly when read back. Consider using CSV format for data with special characters.

### Field Order Matters

The 15 fields must appear in the exact order shown in the field mapping table. Use column aliases and reorder your SELECT clause as needed.

## See Also

- [Output Formats Overview](/output-formats/)
- [W3C / IIS Input](/input-formats/w3c)
- [CSV Output](/output-formats/csv)
- [NCSA / Apache Input](/input-formats/ncsa)
