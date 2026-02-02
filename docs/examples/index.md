# Examples & Cookbook

This page provides practical, copy-paste ready examples for common log analysis tasks. Each example includes the full command and expected output where helpful.

[[toc]]

## Web Server Log Analysis

Analyze IIS, Apache, and Nginx web server logs to understand traffic patterns, identify errors, and troubleshoot performance issues.

### Top Requested URLs

Find the most frequently requested URLs:

```bash
loq -i:W3C "SELECT cs-uri-stem AS url, COUNT(*) AS requests
            FROM access.log
            GROUP BY cs-uri-stem
            ORDER BY requests DESC
            LIMIT 20"
```

Output:
```
url,requests
/api/v1/users,45231
/api/v1/products,38102
/index.html,12045
/api/v1/orders,9823
/favicon.ico,8456
```

### HTTP Status Code Distribution

Get an overview of all HTTP status codes:

```bash
loq -i:W3C "SELECT sc-status AS status,
            COUNT(*) AS count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM access.log), 2) AS pct
            FROM access.log
            GROUP BY sc-status
            ORDER BY count DESC"
```

Or generate a chart:

```bash
loq -i:W3C -o:CHART -chartType:Pie -chartTitle:"HTTP Status Distribution" \
    --ofile:status_chart.png \
    "SELECT sc-status, COUNT(*) FROM access.log GROUP BY sc-status"
```

### Slow Requests Analysis

Find requests that took longer than 5 seconds (5000ms):

```bash
loq -i:W3C "SELECT date, time, cs-uri-stem AS url, time-taken AS ms
            FROM access.log
            WHERE time-taken > 5000
            ORDER BY time-taken DESC
            LIMIT 50"
```

Average response time by endpoint:

```bash
loq -i:W3C "SELECT cs-uri-stem AS url,
            COUNT(*) AS requests,
            ROUND(AVG(time-taken), 0) AS avg_ms,
            MAX(time-taken) AS max_ms
            FROM access.log
            GROUP BY cs-uri-stem
            HAVING COUNT(*) > 100
            ORDER BY avg_ms DESC
            LIMIT 20"
```

### Traffic by Hour

Analyze traffic patterns throughout the day:

```bash
loq -i:W3C "SELECT SUBSTR(time, 1, 2) AS hour,
            COUNT(*) AS requests,
            SUM(sc-bytes) AS bytes_sent
            FROM access.log
            GROUP BY hour
            ORDER BY hour"
```

Output:
```
hour,requests,bytes_sent
00,1234,45678901
01,987,34567890
02,756,23456789
...
23,2345,56789012
```

Generate an hourly traffic chart:

```bash
loq -i:W3C -o:CHART -chartType:Bar -chartTitle:"Requests by Hour" \
    --ofile:hourly_traffic.png \
    "SELECT SUBSTR(time, 1, 2) AS hour, COUNT(*) AS requests
     FROM access.log
     GROUP BY hour
     ORDER BY hour"
```

### Traffic by Day

Daily request volume:

```bash
loq -i:W3C "SELECT date, COUNT(*) AS requests, SUM(sc-bytes) AS bytes
            FROM access.log
            GROUP BY date
            ORDER BY date"
```

### 404 Errors Analysis

Find broken links and missing resources:

```bash
loq -i:W3C "SELECT cs-uri-stem AS url, COUNT(*) AS count
            FROM access.log
            WHERE sc-status = 404
            GROUP BY cs-uri-stem
            ORDER BY count DESC
            LIMIT 30"
```

Find 404s with referrer information to identify broken links:

```bash
loq -i:W3C "SELECT cs-uri-stem AS missing_url,
            cs(Referer) AS referrer,
            COUNT(*) AS count
            FROM access.log
            WHERE sc-status = 404
              AND cs(Referer) IS NOT NULL
              AND cs(Referer) != '-'
            GROUP BY cs-uri-stem, cs(Referer)
            ORDER BY count DESC
            LIMIT 20"
```

### Client IP Analysis

Top clients by request volume:

```bash
loq -i:W3C "SELECT c-ip AS client,
            COUNT(*) AS requests,
            SUM(sc-bytes) AS bytes_sent
            FROM access.log
            GROUP BY c-ip
            ORDER BY requests DESC
            LIMIT 20"
```

### Bot Detection

Identify bot traffic:

```bash
loq -i:W3C "SELECT cs(User-Agent) AS user_agent,
            COUNT(*) AS requests
            FROM access.log
            WHERE LOWER(cs(User-Agent)) LIKE '%bot%'
               OR LOWER(cs(User-Agent)) LIKE '%crawler%'
               OR LOWER(cs(User-Agent)) LIKE '%spider%'
               OR LOWER(cs(User-Agent)) LIKE '%slurp%'
            GROUP BY cs(User-Agent)
            ORDER BY requests DESC"
```

### Apache/Nginx Combined Logs

For NCSA combined format logs:

```bash
loq -i:NCSA "SELECT remote_host, request, status, bytes_sent
             FROM access.log
             WHERE status >= 400
             ORDER BY bytes_sent DESC
             LIMIT 20"
```

---

## Security & Windows Events

Analyze Windows Event Logs (.evtx files) for security incidents, login attempts, and system changes.

### Failed Login Attempts (Event ID 4625)

Track failed authentication attempts:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.TargetUserName AS username,
             EventData.IpAddress AS source_ip,
             EventData.FailureReason AS reason
             FROM Security.evtx
             WHERE EventID = 4625
             ORDER BY TimeCreated DESC
             LIMIT 50"
```

Failed logins by user:

```bash
loq -i:EVTX "SELECT EventData.TargetUserName AS username,
             COUNT(*) AS failed_attempts
             FROM Security.evtx
             WHERE EventID = 4625
             GROUP BY EventData.TargetUserName
             ORDER BY failed_attempts DESC
             LIMIT 20"
```

Failed logins by source IP (potential brute force):

```bash
loq -i:EVTX "SELECT EventData.IpAddress AS source_ip,
             COUNT(*) AS attempts,
             COUNT(DISTINCT EventData.TargetUserName) AS unique_users
             FROM Security.evtx
             WHERE EventID = 4625
               AND EventData.IpAddress IS NOT NULL
             GROUP BY EventData.IpAddress
             HAVING COUNT(*) > 5
             ORDER BY attempts DESC"
```

### Account Lockouts (Event ID 4740)

Find locked out accounts:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.TargetUserName AS locked_user,
             EventData.TargetDomainName AS domain,
             EventData.SubjectUserName AS locked_by
             FROM Security.evtx
             WHERE EventID = 4740
             ORDER BY TimeCreated DESC"
```

### User Creation Events (Event ID 4720)

Track new user account creation:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.TargetUserName AS new_user,
             EventData.SubjectUserName AS created_by,
             EventData.TargetDomainName AS domain
             FROM Security.evtx
             WHERE EventID = 4720
             ORDER BY TimeCreated DESC"
```

### User Account Modifications

Track all user account changes:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventID,
             CASE EventID
               WHEN 4720 THEN 'Created'
               WHEN 4722 THEN 'Enabled'
               WHEN 4723 THEN 'Password Change Attempted'
               WHEN 4724 THEN 'Password Reset'
               WHEN 4725 THEN 'Disabled'
               WHEN 4726 THEN 'Deleted'
               WHEN 4738 THEN 'Modified'
             END AS action,
             EventData.TargetUserName AS target_user,
             EventData.SubjectUserName AS by_user
             FROM Security.evtx
             WHERE EventID IN (4720, 4722, 4723, 4724, 4725, 4726, 4738)
             ORDER BY TimeCreated DESC
             LIMIT 100"
```

### Service Installations (Event ID 7045)

Detect new services installed on the system:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.ServiceName AS service,
             EventData.ImagePath AS path,
             EventData.ServiceType AS type,
             EventData.StartType AS start_type
             FROM System.evtx
             WHERE EventID = 7045
             ORDER BY TimeCreated DESC"
```

### Privilege Escalation (Event ID 4672)

Track special privilege assignments:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.SubjectUserName AS user,
             EventData.SubjectDomainName AS domain,
             EventData.PrivilegeList AS privileges
             FROM Security.evtx
             WHERE EventID = 4672
             ORDER BY TimeCreated DESC
             LIMIT 100"
```

### Successful Logins (Event ID 4624)

Audit successful authentication:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.TargetUserName AS user,
             EventData.LogonType AS logon_type,
             EventData.IpAddress AS source_ip
             FROM Security.evtx
             WHERE EventID = 4624
               AND EventData.TargetUserName NOT LIKE '%$'
             ORDER BY TimeCreated DESC
             LIMIT 50"
```

Logon types: 2=Interactive, 3=Network, 7=Unlock, 10=RemoteInteractive (RDP)

### RDP Sessions

Track Remote Desktop connections:

```bash
loq -i:EVTX "SELECT TimeCreated,
             EventData.TargetUserName AS user,
             EventData.IpAddress AS source_ip
             FROM Security.evtx
             WHERE EventID = 4624
               AND EventData.LogonType = 10
             ORDER BY TimeCreated DESC"
```

### Security Event Summary

Overview of security events:

```bash
loq -i:EVTX "SELECT EventID,
             COUNT(*) AS count
             FROM Security.evtx
             GROUP BY EventID
             ORDER BY count DESC
             LIMIT 30"
```

---

## Application Log Analysis

Analyze application logs to find errors, track performance, and identify issues.

### Error Frequency by Type

Group errors by type or category:

```bash
loq -i:JSON "SELECT error_type, COUNT(*) AS count
             FROM app_logs.json
             WHERE level = 'ERROR'
             GROUP BY error_type
             ORDER BY count DESC"
```

For text logs with patterns:

```bash
loq -i:TEXTLINE "SELECT EXTRACT_PREFIX(Text, ':') AS error_type,
                 COUNT(*) AS count
                 FROM app.log
                 WHERE Text LIKE '%ERROR%'
                 GROUP BY error_type
                 ORDER BY count DESC"
```

### Exceptions with Stack Traces

Find unique exceptions:

```bash
loq -i:JSON "SELECT exception_class,
             exception_message,
             COUNT(*) AS occurrences
             FROM app_logs.json
             WHERE exception_class IS NOT NULL
             GROUP BY exception_class, exception_message
             ORDER BY occurrences DESC
             LIMIT 20"
```

### Slow Database Queries

Analyze query performance from logs:

```bash
loq -i:JSON "SELECT query,
             COUNT(*) AS executions,
             ROUND(AVG(duration_ms), 2) AS avg_ms,
             MAX(duration_ms) AS max_ms
             FROM db_logs.json
             WHERE duration_ms > 100
             GROUP BY query
             ORDER BY avg_ms DESC
             LIMIT 20"
```

### API Endpoint Performance

Track response times by endpoint:

```bash
loq -i:JSON "SELECT endpoint,
             method,
             COUNT(*) AS requests,
             ROUND(AVG(response_time_ms), 0) AS avg_ms,
             MAX(response_time_ms) AS max_ms,
             SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) AS errors
             FROM api_logs.json
             GROUP BY endpoint, method
             ORDER BY avg_ms DESC
             LIMIT 30"
```

### Error Rate by Time Window

Track errors over time using QUANTIZE:

```bash
loq -i:JSON "SELECT QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%dT%H:%M:%S'), 3600) AS hour,
             COUNT(*) AS total,
             SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) AS errors,
             ROUND(SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS error_rate
             FROM app_logs.json
             GROUP BY hour
             ORDER BY hour"
```

### Log Level Distribution

Analyze log severity:

```bash
loq -i:JSON "SELECT level,
             COUNT(*) AS count
             FROM app_logs.json
             GROUP BY level
             ORDER BY CASE level
               WHEN 'FATAL' THEN 1
               WHEN 'ERROR' THEN 2
               WHEN 'WARN' THEN 3
               WHEN 'INFO' THEN 4
               WHEN 'DEBUG' THEN 5
               ELSE 6 END"
```

### Syslog Analysis

Parse syslog messages:

```bash
loq -i:SYSLOG "SELECT facility, severity, hostname, message
               FROM /var/log/syslog
               WHERE severity <= 3
               ORDER BY timestamp DESC
               LIMIT 50"
```

Group by application:

```bash
loq -i:SYSLOG "SELECT app_name, COUNT(*) AS count
               FROM /var/log/syslog
               GROUP BY app_name
               ORDER BY count DESC"
```

---

## Data Transformation

Transform and convert data between formats, clean data, and join datasets.

### CSV to JSON Conversion

Convert CSV data to JSON format:

```bash
loq -o:JSON "SELECT * FROM data.csv" > data.json
```

Pretty-print JSON output:

```bash
loq -o:JSON -jsonMode:array "SELECT * FROM data.csv" | jq '.'
```

### CSV to SQLite

Export query results to SQLite:

```bash
loq -o:SQLITE --ofile:output.db \
    "SELECT * FROM large_data.csv WHERE status = 'active'"
```

### Cleaning and Normalizing Data

Trim whitespace and normalize case:

```bash
loq "SELECT TRIM(name) AS name,
     LOWER(email) AS email,
     UPPER(state) AS state
     FROM users.csv" > cleaned_users.csv
```

Handle NULL values:

```bash
loq "SELECT name,
     COALESCE(phone, 'N/A') AS phone,
     COALESCE(email, 'unknown@example.com') AS email
     FROM contacts.csv" > normalized_contacts.csv
```

### Joining Multiple Files

Join two CSV files:

```bash
loq "SELECT e.name, e.department_id, d.department_name, e.salary
     FROM employees.csv e
     INNER JOIN departments.csv d ON e.department_id = d.id"
```

Left join to keep all records from the first file:

```bash
loq "SELECT o.order_id, o.customer_id, c.customer_name, o.total
     FROM orders.csv o
     LEFT JOIN customers.csv c ON o.customer_id = c.id"
```

### Aggregating Across Multiple Files

Query multiple files with wildcard patterns:

```bash
loq "SELECT * FROM 'logs/*.csv'"
```

Aggregate across all files:

```bash
loq "SELECT date,
     SUM(amount) AS total_sales,
     COUNT(*) AS transactions
     FROM 'sales_*.csv'
     GROUP BY date
     ORDER BY date"
```

### Combine with UNION

Combine results from multiple queries:

```bash
loq "SELECT 'Q1' AS quarter, SUM(amount) AS total FROM q1_sales.csv
     UNION ALL
     SELECT 'Q2' AS quarter, SUM(amount) AS total FROM q2_sales.csv
     UNION ALL
     SELECT 'Q3' AS quarter, SUM(amount) AS total FROM q3_sales.csv
     UNION ALL
     SELECT 'Q4' AS quarter, SUM(amount) AS total FROM q4_sales.csv"
```

### Deduplication

Remove duplicate rows:

```bash
loq "SELECT DISTINCT email, name FROM users.csv" > unique_users.csv
```

Find and review duplicates before removing:

```bash
loq "SELECT email, COUNT(*) AS count
     FROM users.csv
     GROUP BY email
     HAVING COUNT(*) > 1
     ORDER BY count DESC"
```

### Data Sampling

Random sample using ROW_NUMBER:

```bash
loq "SELECT * FROM (
       SELECT *, ROW_NUMBER() OVER () AS rn FROM large_data.csv
     ) WHERE rn % 100 = 0"
```

---

## System Administration

Query filesystem metadata for disk management, log rotation, and file auditing.

### Disk Space Analysis

Analyze disk usage by extension:

```bash
loq -i:FS -recurse:3 "SELECT Extension,
                      COUNT(*) AS files,
                      SUM(Size) AS total_bytes,
                      ROUND(SUM(Size) / 1048576.0, 2) AS total_mb
                      FROM '/var'
                      WHERE IsDirectory = false
                      GROUP BY Extension
                      ORDER BY total_bytes DESC
                      LIMIT 20"
```

Output:
```
Extension,files,total_bytes,total_mb
log,1523,5234567890,4992.34
gz,892,2345678901,2237.12
tmp,234,456789012,435.67
```

### Large File Finder

Find the largest files:

```bash
loq -i:FS -recurse:5 "SELECT Name, Path,
                      CASE
                        WHEN Size > 1073741824 THEN CONCAT(ROUND(Size / 1073741824.0, 2), ' GB')
                        WHEN Size > 1048576 THEN CONCAT(ROUND(Size / 1048576.0, 2), ' MB')
                        ELSE CONCAT(ROUND(Size / 1024.0, 2), ' KB')
                      END AS size_human
                      FROM '/home'
                      WHERE IsDirectory = false
                      ORDER BY Size DESC
                      LIMIT 50"
```

Files larger than 1GB:

```bash
loq -i:FS -recurse:-1 "SELECT Path, ROUND(Size / 1073741824.0, 2) AS gb
                       FROM '/'
                       WHERE Size > 1073741824
                         AND IsDirectory = false
                       ORDER BY Size DESC"
```

### Log Rotation Candidates

Find large log files that should be rotated:

```bash
loq -i:FS -recurse:3 "SELECT Name, Path,
                      ROUND(Size / 1048576.0, 2) AS size_mb,
                      LastModified
                      FROM '/var/log'
                      WHERE Extension IN ('log', 'txt', 'out')
                        AND Size > 104857600
                      ORDER BY Size DESC"
```

### File Age Analysis

Find old files not modified in 90 days:

```bash
loq -i:FS -recurse:2 "SELECT Name, Path, LastModified,
                      DATE_DIFF(NOW(), LastModified, 'DAY') AS days_old
                      FROM '/tmp'
                      WHERE IsDirectory = false
                      ORDER BY LastModified ASC
                      LIMIT 100"
```

Files modified in the last 24 hours:

```bash
loq -i:FS -recurse:3 "SELECT Name, Path, LastModified
                      FROM '/var/log'
                      WHERE DATE_DIFF(NOW(), LastModified, 'HOUR') < 24
                        AND IsDirectory = false
                      ORDER BY LastModified DESC"
```

### Empty File Cleanup Candidates

Find empty files:

```bash
loq -i:FS -recurse:3 "SELECT Name, Path, LastModified
                      FROM '/home'
                      WHERE Size = 0
                        AND IsDirectory = false
                      ORDER BY LastModified ASC"
```

### Duplicate File Names

Find files with the same name in different locations:

```bash
loq -i:FS -recurse:5 "SELECT Name, COUNT(*) AS count
                      FROM '/home/projects'
                      WHERE IsDirectory = false
                      GROUP BY Name
                      HAVING COUNT(*) > 1
                      ORDER BY count DESC"
```

### Directory Size Summary

Total size by top-level directory:

```bash
loq -i:FS -recurse:1 "SELECT Name,
                      ROUND(SUM(Size) / 1073741824.0, 2) AS gb
                      FROM '/'
                      GROUP BY Name
                      ORDER BY SUM(Size) DESC"
```

### Hidden Files Audit

List all hidden files:

```bash
loq -i:FS -recurse:3 "SELECT Name, Path, Size
                      FROM '/home/user'
                      WHERE IsHidden = true
                        AND IsDirectory = false
                      ORDER BY Size DESC"
```

---

## Advanced Patterns

Advanced SQL techniques for complex log analysis scenarios.

### Time Bucketing with QUANTIZE

Group events into time buckets for trend analysis.

Hourly buckets (3600 seconds):

```bash
loq -i:W3C "SELECT QUANTIZE(TO_TIMESTAMP(CONCAT(date, ' ', time), '%Y-%m-%d %H:%M:%S'), 3600) AS hour,
            COUNT(*) AS requests,
            AVG(time-taken) AS avg_response
            FROM access.log
            GROUP BY hour
            ORDER BY hour"
```

15-minute buckets (900 seconds):

```bash
loq -i:JSON "SELECT QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%dT%H:%M:%S'), 900) AS period,
             COUNT(*) AS events,
             SUM(CASE WHEN level = 'ERROR' THEN 1 ELSE 0 END) AS errors
             FROM app.json
             GROUP BY period
             ORDER BY period"
```

### Percentile Calculations

Approximate percentiles using window functions:

```bash
loq "SELECT response_time,
     ROW_NUMBER() OVER (ORDER BY response_time) AS rank,
     COUNT(*) OVER () AS total
     FROM requests.csv"
```

Get the 95th percentile response time:

```bash
loq "WITH ranked AS (
       SELECT response_time,
              ROW_NUMBER() OVER (ORDER BY response_time) AS rank,
              COUNT(*) OVER () AS total
       FROM requests.csv
     )
     SELECT response_time AS p95
     FROM ranked
     WHERE rank >= total * 0.95
     ORDER BY rank
     LIMIT 1"
```

### Rolling/Moving Calculations

Calculate running totals:

```bash
loq "SELECT date,
     amount,
     SUM(amount) OVER (ORDER BY date) AS running_total
     FROM sales.csv
     ORDER BY date"
```

### Sessionization

Group events into sessions based on time gaps.

First, calculate time between events:

```bash
loq "SELECT user_id,
     timestamp,
     LAG(timestamp) OVER (PARTITION BY user_id ORDER BY timestamp) AS prev_timestamp
     FROM events.csv"
```

### Top N per Group

Get top 3 products per category:

```bash
loq "SELECT category, product, revenue, rank FROM (
       SELECT category, product, revenue,
              ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank
       FROM sales.csv
     ) WHERE rank <= 3"
```

### CASE WHEN for Categorization

Categorize response times:

```bash
loq -i:W3C "SELECT
            CASE
              WHEN time-taken < 100 THEN 'Fast (<100ms)'
              WHEN time-taken < 500 THEN 'Normal (100-500ms)'
              WHEN time-taken < 2000 THEN 'Slow (500ms-2s)'
              ELSE 'Very Slow (>2s)'
            END AS category,
            COUNT(*) AS count
            FROM access.log
            GROUP BY category
            ORDER BY MIN(time-taken)"
```

Categorize HTTP status codes:

```bash
loq -i:W3C "SELECT
            CASE
              WHEN sc-status >= 200 AND sc-status < 300 THEN '2xx Success'
              WHEN sc-status >= 300 AND sc-status < 400 THEN '3xx Redirect'
              WHEN sc-status >= 400 AND sc-status < 500 THEN '4xx Client Error'
              WHEN sc-status >= 500 THEN '5xx Server Error'
              ELSE 'Other'
            END AS status_category,
            COUNT(*) AS count
            FROM access.log
            GROUP BY status_category"
```

### Correlation Analysis

Find patterns between columns:

```bash
loq "SELECT
     CASE WHEN age < 25 THEN 'Under 25'
          WHEN age < 35 THEN '25-34'
          WHEN age < 45 THEN '35-44'
          ELSE '45+' END AS age_group,
     ROUND(AVG(purchase_amount), 2) AS avg_purchase,
     COUNT(*) AS count
     FROM transactions.csv
     GROUP BY age_group
     ORDER BY avg_purchase DESC"
```

### Subqueries for Filtering

Find users with above-average orders:

```bash
loq "SELECT customer_name, order_total
     FROM orders.csv
     WHERE order_total > (SELECT AVG(order_total) FROM orders.csv)
     ORDER BY order_total DESC"
```

Find events from the busiest hour:

```bash
loq -i:W3C "SELECT *
            FROM access.log
            WHERE SUBSTR(time, 1, 2) = (
              SELECT SUBSTR(time, 1, 2) AS hour
              FROM access.log
              GROUP BY hour
              ORDER BY COUNT(*) DESC
              LIMIT 1
            )"
```

### Pivot-like Analysis

Create a summary by two dimensions:

```bash
loq "SELECT date,
     SUM(CASE WHEN category = 'Electronics' THEN amount ELSE 0 END) AS electronics,
     SUM(CASE WHEN category = 'Clothing' THEN amount ELSE 0 END) AS clothing,
     SUM(CASE WHEN category = 'Food' THEN amount ELSE 0 END) AS food
     FROM sales.csv
     GROUP BY date
     ORDER BY date"
```

### Anomaly Detection

Find outliers using statistical methods:

```bash
loq "WITH stats AS (
       SELECT AVG(value) AS mean, AVG(value) * 0.5 AS threshold
       FROM metrics.csv
     )
     SELECT timestamp, value
     FROM metrics.csv, stats
     WHERE ABS(value - stats.mean) > stats.threshold
     ORDER BY ABS(value - stats.mean) DESC"
```

### Trend Comparison

Compare current period to previous:

```bash
loq "SELECT
     EXTRACT('MONTH', TO_TIMESTAMP(date, '%Y-%m-%d')) AS month,
     SUM(amount) AS total,
     LAG(SUM(amount)) OVER (ORDER BY EXTRACT('MONTH', TO_TIMESTAMP(date, '%Y-%m-%d'))) AS prev_month,
     SUM(amount) - LAG(SUM(amount)) OVER (ORDER BY EXTRACT('MONTH', TO_TIMESTAMP(date, '%Y-%m-%d'))) AS change
     FROM sales.csv
     GROUP BY month
     ORDER BY month"
```

---

## Quick Reference

### Input Format Flags

| Flag | Format |
|------|--------|
| `-i:CSV` | Comma-separated values (default) |
| `-i:TSV` | Tab-separated values |
| `-i:JSON` | JSON / NDJSON |
| `-i:W3C` | IIS W3C logs |
| `-i:NCSA` | Apache/Nginx combined logs |
| `-i:EVTX` | Windows Event Logs |
| `-i:FS` | Filesystem metadata |
| `-i:SYSLOG` | Syslog messages |
| `-i:XML` | XML documents |

### Output Format Flags

| Flag | Format |
|------|--------|
| `-o:CSV` | Comma-separated values (default) |
| `-o:JSON` | JSON / NDJSON |
| `-o:DATAGRID` | ASCII table |
| `-o:SQLITE` | SQLite database |
| `-o:CHART` | PNG/SVG chart |

### Common Functions

| Function | Description |
|----------|-------------|
| `COUNT(*)` | Count rows |
| `SUM(col)` | Sum values |
| `AVG(col)` | Average |
| `MAX(col)` / `MIN(col)` | Maximum / Minimum |
| `UPPER(s)` / `LOWER(s)` | Case conversion |
| `SUBSTR(s, start, len)` | Substring |
| `COALESCE(a, b)` | First non-null |
| `QUANTIZE(ts, secs)` | Time bucketing |
| `DATE_DIFF(a, b, unit)` | Time difference |

---

## See Also

- [Quick Start](/getting-started/quick-start) - Getting started guide
- [SQL Reference](/sql/) - Complete SQL documentation
- [Functions](/functions/) - All built-in functions
- [Input Formats](/input-formats/) - Format-specific documentation
- [CLI Reference](/cli/) - Command-line options
