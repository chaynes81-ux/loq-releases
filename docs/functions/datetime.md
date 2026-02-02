# Date/Time Functions

Date/Time functions parse, manipulate, and extract information from temporal values.

## NOW

Get the current timestamp (UTC).

```sql
NOW()
```

**Example:**
```sql
SELECT NOW() AS current_time
-- Returns: 2024-01-15T14:30:45

SELECT *, NOW() AS query_time FROM logs.csv
```

## TO_TIMESTAMP

Parse a string into a timestamp using a format string.

```sql
TO_TIMESTAMP(string, format)
```

### Format Specifiers

| Specifier | Description | Example |
|-----------|-------------|---------|
| `%Y` | 4-digit year | `2024` |
| `%m` | 2-digit month (01-12) | `01` |
| `%d` | 2-digit day (01-31) | `15` |
| `%H` | 2-digit hour (00-23) | `14` |
| `%M` | 2-digit minute (00-59) | `30` |
| `%S` | 2-digit second (00-59) | `45` |

**Examples:**
```sql
-- ISO date
SELECT TO_TIMESTAMP('2024-01-15', '%Y-%m-%d')

-- ISO datetime
SELECT TO_TIMESTAMP('2024-01-15 14:30:00', '%Y-%m-%d %H:%M:%S')

-- US date format
SELECT TO_TIMESTAMP('01/15/2024', '%m/%d/%Y')

-- European date format
SELECT TO_TIMESTAMP('15-01-2024', '%d-%m-%Y')

-- Date with time
SELECT TO_TIMESTAMP('2024-01-15T14:30:00', '%Y-%m-%dT%H:%M:%S')
```

### Using in Queries

```sql
SELECT
    event_date,
    TO_TIMESTAMP(event_date, '%Y-%m-%d') AS parsed_date
FROM events.csv
WHERE TO_TIMESTAMP(event_date, '%Y-%m-%d') > TO_TIMESTAMP('2024-01-01', '%Y-%m-%d')
```

## TO_DATE

Extract the date part from a timestamp as a string (YYYY-MM-DD).

```sql
TO_DATE(timestamp)
```

**Example:**
```sql
SELECT TO_DATE(TO_TIMESTAMP('2024-01-15 14:30:00', '%Y-%m-%d %H:%M:%S'))
-- Returns: '2024-01-15'

SELECT TO_DATE(timestamp_column) AS date_only FROM logs.csv
```

## TO_TIME

Extract the time part from a timestamp as a string (HH:MM:SS).

```sql
TO_TIME(timestamp)
```

**Example:**
```sql
SELECT TO_TIME(TO_TIMESTAMP('2024-01-15 14:30:45', '%Y-%m-%d %H:%M:%S'))
-- Returns: '14:30:45'

SELECT TO_TIME(timestamp_column) AS time_only FROM logs.csv
```

## EXTRACT

Extract a specific component from a timestamp.

```sql
EXTRACT(part, timestamp)
```

### Supported Parts

| Part | Returns | Range |
|------|---------|-------|
| `'YEAR'` | 4-digit year | e.g., 2024 |
| `'MONTH'` | Month number | 1-12 |
| `'DAY'` | Day of month | 1-31 |
| `'HOUR'` | Hour | 0-23 |
| `'MINUTE'` | Minute | 0-59 |
| `'SECOND'` | Second | 0-59 |
| `'WEEKDAY'` | Day of week | 0 (Mon) - 6 (Sun) |

**Examples:**
```sql
SELECT EXTRACT('YEAR', timestamp_col) AS year FROM events.csv
SELECT EXTRACT('MONTH', timestamp_col) AS month FROM events.csv
SELECT EXTRACT('WEEKDAY', timestamp_col) AS dow FROM events.csv

-- Filter by year
SELECT * FROM logs.csv
WHERE EXTRACT('YEAR', TO_TIMESTAMP(date, '%Y-%m-%d')) = 2024

-- Group by month
SELECT
    EXTRACT('MONTH', TO_TIMESTAMP(date, '%Y-%m-%d')) AS month,
    COUNT(*) AS count
FROM events.csv
GROUP BY EXTRACT('MONTH', TO_TIMESTAMP(date, '%Y-%m-%d'))
```

## DATE_ADD

Add an interval to a timestamp.

```sql
DATE_ADD(timestamp, interval, unit)
```

### Supported Units

| Unit | Description |
|------|-------------|
| `'YEAR'` | Add years |
| `'MONTH'` | Add months |
| `'DAY'` | Add days |
| `'HOUR'` | Add hours |
| `'MINUTE'` | Add minutes |
| `'SECOND'` | Add seconds |

**Examples:**
```sql
-- Add 7 days
SELECT DATE_ADD(timestamp_col, 7, 'DAY') AS next_week FROM events.csv

-- Add 1 month
SELECT DATE_ADD(timestamp_col, 1, 'MONTH') AS next_month FROM events.csv

-- Subtract (use negative interval)
SELECT DATE_ADD(timestamp_col, -30, 'DAY') AS thirty_days_ago FROM events.csv

-- Add hours
SELECT DATE_ADD(NOW(), 3, 'HOUR') AS three_hours_later

-- Calculate due date
SELECT
    order_date,
    DATE_ADD(TO_TIMESTAMP(order_date, '%Y-%m-%d'), 14, 'DAY') AS due_date
FROM orders.csv
```

## DATE_DIFF

Calculate the difference between two timestamps.

```sql
DATE_DIFF(timestamp1, timestamp2, unit)
```

Returns `timestamp1 - timestamp2` in the specified unit.

### Supported Units

| Unit | Description |
|------|-------------|
| `'DAY'` | Difference in days |
| `'HOUR'` | Difference in hours |
| `'MINUTE'` | Difference in minutes |
| `'SECOND'` | Difference in seconds |

**Examples:**
```sql
-- Days between two dates
SELECT DATE_DIFF(
    TO_TIMESTAMP('2024-01-15', '%Y-%m-%d'),
    TO_TIMESTAMP('2024-01-01', '%Y-%m-%d'),
    'DAY'
)
-- Returns: 14

-- Hours since event
SELECT DATE_DIFF(NOW(), event_timestamp, 'HOUR') AS hours_ago FROM events.csv

-- Age in days
SELECT
    name,
    DATE_DIFF(NOW(), TO_TIMESTAMP(created_date, '%Y-%m-%d'), 'DAY') AS age_days
FROM accounts.csv
```

## QUANTIZE

Round a timestamp to the nearest interval (time bucketing).

```sql
QUANTIZE(timestamp, interval_seconds)
```

**Examples:**
```sql
-- Round to hour (3600 seconds)
SELECT QUANTIZE(timestamp_col, 3600) AS hour_bucket FROM logs.csv

-- Round to 15 minutes (900 seconds)
SELECT QUANTIZE(timestamp_col, 900) AS quarter_hour FROM logs.csv

-- Round to day (86400 seconds)
SELECT QUANTIZE(timestamp_col, 86400) AS day_bucket FROM logs.csv

-- Aggregate by hour
SELECT
    QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S'), 3600) AS hour,
    COUNT(*) AS requests
FROM access_log.csv
GROUP BY QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S'), 3600)
ORDER BY hour
```

## Common Patterns

### Date Range Filtering

```sql
-- Last 7 days
SELECT * FROM logs.csv
WHERE DATE_DIFF(NOW(), TO_TIMESTAMP(date, '%Y-%m-%d'), 'DAY') <= 7

-- Specific date range
SELECT * FROM orders.csv
WHERE TO_TIMESTAMP(order_date, '%Y-%m-%d') BETWEEN
      TO_TIMESTAMP('2024-01-01', '%Y-%m-%d') AND
      TO_TIMESTAMP('2024-03-31', '%Y-%m-%d')
```

### Time-Based Aggregation

```sql
-- Events per hour
SELECT
    EXTRACT('HOUR', TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S')) AS hour,
    COUNT(*) AS count
FROM events.csv
GROUP BY EXTRACT('HOUR', TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S'))
ORDER BY hour

-- Events per day of week
SELECT
    EXTRACT('WEEKDAY', TO_TIMESTAMP(date, '%Y-%m-%d')) AS dow,
    CASE EXTRACT('WEEKDAY', TO_TIMESTAMP(date, '%Y-%m-%d'))
        WHEN 0 THEN 'Monday'
        WHEN 1 THEN 'Tuesday'
        WHEN 2 THEN 'Wednesday'
        WHEN 3 THEN 'Thursday'
        WHEN 4 THEN 'Friday'
        WHEN 5 THEN 'Saturday'
        WHEN 6 THEN 'Sunday'
    END AS day_name,
    COUNT(*) AS count
FROM events.csv
GROUP BY dow
ORDER BY dow
```

### Age Calculations

```sql
SELECT
    name,
    birth_date,
    EXTRACT('YEAR', NOW()) - EXTRACT('YEAR', TO_TIMESTAMP(birth_date, '%Y-%m-%d')) AS age
FROM users.csv
```

### Month-over-Month Comparison

```sql
SELECT
    EXTRACT('YEAR', TO_TIMESTAMP(date, '%Y-%m-%d')) AS year,
    EXTRACT('MONTH', TO_TIMESTAMP(date, '%Y-%m-%d')) AS month,
    SUM(amount) AS total
FROM sales.csv
GROUP BY year, month
ORDER BY year, month
```

### Time Series Analysis

```sql
SELECT
    QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S'), 3600) AS hour,
    COUNT(*) AS requests,
    AVG(response_time) AS avg_response
FROM access_log.csv
GROUP BY QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S'), 3600)
ORDER BY hour
```

### Working Days Calculation

```sql
SELECT
    start_date,
    end_date,
    DATE_DIFF(
        TO_TIMESTAMP(end_date, '%Y-%m-%d'),
        TO_TIMESTAMP(start_date, '%Y-%m-%d'),
        'DAY'
    ) AS calendar_days
FROM projects.csv
```

## NULL Handling

Date/time functions return NULL for NULL inputs:

```sql
EXTRACT('YEAR', NULL)  -- NULL
DATE_ADD(NULL, 1, 'DAY')  -- NULL
TO_TIMESTAMP(NULL, '%Y-%m-%d')  -- NULL
```

## Error Handling

Invalid inputs produce errors:

```sql
-- Invalid date string
TO_TIMESTAMP('not-a-date', '%Y-%m-%d')
-- Error: Failed to parse timestamp

-- Invalid format
TO_TIMESTAMP('2024-01-15', '%m/%d/%Y')
-- Error: date string doesn't match format

-- Invalid EXTRACT part
EXTRACT('INVALID', timestamp)
-- Error: Invalid EXTRACT part
```

## See Also

- [Functions Overview](/functions/) - All function categories
- [Aggregation](/sql/aggregation) - GROUP BY for time series
- [Window Functions](/sql/window-functions) - Time-based calculations
