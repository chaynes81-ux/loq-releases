# SQL Functions Reference for LLMs

Comprehensive function reference for log parser SQL queries. This document provides quick lookup for all available functions with signatures, return types, and examples.

## String Functions

### UPPER / UCASE / TO_UPPERCASE
**Syntax:** `UPPER(string)`
**Returns:** String
**Description:** Convert string to uppercase.
**Example:** `SELECT UPPER(name) FROM data.csv` → 'alice' becomes 'ALICE'

### LOWER / LCASE / TO_LOWERCASE
**Syntax:** `LOWER(string)`
**Returns:** String
**Description:** Convert string to lowercase.
**Example:** `SELECT LOWER(email) FROM data.csv` → 'Alice@EXAMPLE.COM' becomes 'alice@example.com'

### LENGTH / LEN / STRLEN
**Syntax:** `LENGTH(string)`
**Returns:** Integer
**Description:** Get the length of a string in characters.
**Example:** `SELECT LENGTH(name) FROM data.csv WHERE LENGTH(name) > 10`

### SUBSTR / SUBSTRING
**Syntax:** `SUBSTR(string, start, length)`
**Returns:** String
**Description:** Extract a substring starting at position (1-based). Omit length to extract to end.
**Example:** `SELECT SUBSTR(name, 1, 3) FROM data.csv` → 'Alice' becomes 'Ali'

### CONCAT / STRCAT
**Syntax:** `CONCAT(string1, string2, ...)`
**Returns:** String
**Description:** Concatenate multiple strings together.
**Example:** `SELECT CONCAT(first_name, ' ', last_name) FROM data.csv`

### REPLACE / REPLACE_STR
**Syntax:** `REPLACE(string, search, replacement)`
**Returns:** String
**Description:** Replace all occurrences of search string with replacement string.
**Example:** `SELECT REPLACE(phone, '-', '') FROM data.csv` → '555-1234' becomes '5551234'

### TRIM
**Syntax:** `TRIM(string)`
**Returns:** String
**Description:** Remove leading and trailing whitespace.
**Example:** `SELECT TRIM(name) FROM data.csv` → '  Alice  ' becomes 'Alice'

### LTRIM
**Syntax:** `LTRIM(string)`
**Returns:** String
**Description:** Remove leading whitespace only.
**Example:** `SELECT LTRIM(name) FROM data.csv` → '  Alice' becomes 'Alice'

### RTRIM
**Syntax:** `RTRIM(string)`
**Returns:** String
**Description:** Remove trailing whitespace only.
**Example:** `SELECT RTRIM(name) FROM data.csv` → 'Alice  ' becomes 'Alice'

### INDEX_OF
**Syntax:** `INDEX_OF(string, substring)`
**Returns:** Integer (1-based position, or 0 if not found)
**Description:** Find the first occurrence of substring within string.
**Example:** `SELECT INDEX_OF(email, '@') FROM data.csv`

### LAST_INDEX_OF
**Syntax:** `LAST_INDEX_OF(string, substring)`
**Returns:** Integer (1-based position, or 0 if not found)
**Description:** Find the last occurrence of substring within string.
**Example:** `SELECT LAST_INDEX_OF(path, '/') FROM data.csv`

### EXTRACT_PREFIX
**Syntax:** `EXTRACT_PREFIX(string, delimiter)` or `EXTRACT_PREFIX(string, index, delimiter)`
**Returns:** String
**Description:** Extract the prefix before the first (or nth) occurrence of delimiter.
**Example:** `SELECT EXTRACT_PREFIX(email, '@') FROM data.csv` → 'alice@example.com' becomes 'alice'

### EXTRACT_SUFFIX
**Syntax:** `EXTRACT_SUFFIX(string, delimiter)` or `EXTRACT_SUFFIX(string, index, delimiter)`
**Returns:** String
**Description:** Extract the suffix after the first (or nth) occurrence of delimiter.
**Example:** `SELECT EXTRACT_SUFFIX(email, '@') FROM data.csv` → 'alice@example.com' becomes 'example.com'

### EXTRACT_PATH
**Syntax:** `EXTRACT_PATH(filepath)`
**Returns:** String
**Description:** Extract the directory path from a file path (everything before the last slash).
**Example:** `SELECT EXTRACT_PATH('/var/log/app.log') FROM data.csv` → '/var/log'

### EXTRACT_FILENAME
**Syntax:** `EXTRACT_FILENAME(filepath)`
**Returns:** String
**Description:** Extract the filename from a file path (everything after the last slash).
**Example:** `SELECT EXTRACT_FILENAME('/var/log/app.log') FROM data.csv` → 'app.log'

### EXTRACT_EXTENSION
**Syntax:** `EXTRACT_EXTENSION(filename)`
**Returns:** String
**Description:** Extract the file extension (everything after the last dot, including the dot).
**Example:** `SELECT EXTRACT_EXTENSION('document.pdf') FROM data.csv` → '.pdf'

### PRINTF
**Syntax:** `PRINTF(format, arg1, arg2, ...)`
**Returns:** String
**Description:** Format string using C-style printf format specifiers (%s, %d, %f, etc.). Supports width, precision, and flags.
**Example:** `SELECT PRINTF('%s: $%.2f', product, price) FROM data.csv`

## Math Functions

### ABS
**Syntax:** `ABS(number)`
**Returns:** Numeric (same type as input)
**Description:** Return the absolute value of a number.
**Example:** `SELECT ABS(balance) FROM data.csv` → -123.45 becomes 123.45

### ROUND
**Syntax:** `ROUND(number, decimals)`
**Returns:** Float
**Description:** Round a number to specified decimal places. Default decimals is 0.
**Example:** `SELECT ROUND(price, 2) FROM data.csv` → 3.14159 becomes 3.14

### FLOOR
**Syntax:** `FLOOR(number)`
**Returns:** Integer
**Description:** Round down to the nearest integer (toward negative infinity).
**Example:** `SELECT FLOOR(price) FROM data.csv` → 3.7 becomes 3, -3.2 becomes -4

### CEIL / CEILING
**Syntax:** `CEIL(number)`
**Returns:** Integer
**Description:** Round up to the nearest integer (toward positive infinity).
**Example:** `SELECT CEIL(price) FROM data.csv` → 3.2 becomes 4, -3.7 becomes -3

### MOD
**Syntax:** `MOD(dividend, divisor)`
**Returns:** Integer
**Description:** Return the remainder of division (modulo operation).
**Example:** `SELECT MOD(id, 2) FROM data.csv WHERE MOD(id, 2) = 0` → even IDs only

### POWER / POW
**Syntax:** `POWER(base, exponent)`
**Returns:** Float
**Description:** Raise a number to a power.
**Example:** `SELECT POWER(2, 3) FROM data.csv` → returns 8 (2³)

### SQRT / SQRROOT
**Syntax:** `SQRT(number)`
**Returns:** Float
**Description:** Return the square root of a number.
**Example:** `SELECT SQRT(16) FROM data.csv` → returns 4

## Date/Time Functions

### NOW
**Syntax:** `NOW()`
**Returns:** Timestamp
**Description:** Get the current UTC timestamp.
**Example:** `SELECT NOW() AS query_time FROM data.csv`

### TO_TIMESTAMP
**Syntax:** `TO_TIMESTAMP(string, format)`
**Returns:** Timestamp
**Description:** Parse a string into a timestamp using strftime format specifiers (%Y, %m, %d, %H, %M, %S).
**Example:** `SELECT TO_TIMESTAMP(date_str, '%Y-%m-%d %H:%M:%S') FROM data.csv`

### TO_DATE
**Syntax:** `TO_DATE(timestamp)`
**Returns:** String (YYYY-MM-DD format)
**Description:** Extract the date part from a timestamp.
**Example:** `SELECT TO_DATE(timestamp_col) FROM data.csv`

### TO_TIME
**Syntax:** `TO_TIME(timestamp)`
**Returns:** String (HH:MM:SS format)
**Description:** Extract the time part from a timestamp.
**Example:** `SELECT TO_TIME(timestamp_col) FROM data.csv`

### EXTRACT
**Syntax:** `EXTRACT(part, timestamp)`
**Returns:** Integer
**Description:** Extract a specific component from a timestamp. Parts: 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'WEEKDAY' (0=Mon, 6=Sun).
**Example:** `SELECT EXTRACT('YEAR', timestamp_col) FROM data.csv GROUP BY EXTRACT('MONTH', timestamp_col)`

### DATE_ADD
**Syntax:** `DATE_ADD(timestamp, interval, unit)`
**Returns:** Timestamp
**Description:** Add an interval to a timestamp. Units: 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND'. Use negative interval to subtract.
**Example:** `SELECT DATE_ADD(order_date, 30, 'DAY') AS due_date FROM data.csv`

### DATE_DIFF
**Syntax:** `DATE_DIFF(timestamp1, timestamp2, unit)`
**Returns:** Integer
**Description:** Calculate difference between two timestamps. Returns timestamp1 - timestamp2. Units: 'DAY', 'HOUR', 'MINUTE', 'SECOND'.
**Example:** `SELECT DATE_DIFF(NOW(), created_at, 'DAY') AS age_days FROM data.csv`

### QUANTIZE
**Syntax:** `QUANTIZE(timestamp, interval_seconds)`
**Returns:** Timestamp
**Description:** Round timestamp to the nearest interval (time bucketing). Common intervals: 3600 (hour), 900 (15 min), 86400 (day).
**Example:** `SELECT QUANTIZE(timestamp_col, 3600) AS hour, COUNT(*) FROM data.csv GROUP BY hour`

## Conditional Functions

### IF
**Syntax:** `IF(condition, true_value, false_value)`
**Returns:** Type of true_value/false_value
**Description:** Return true_value if condition is truthy, otherwise false_value. NULL is falsy.
**Example:** `SELECT IF(age >= 18, 'Adult', 'Minor') AS category FROM data.csv`

### COALESCE
**Syntax:** `COALESCE(value1, value2, ..., valueN)`
**Returns:** Type of first non-NULL value
**Description:** Return the first non-NULL value from the argument list.
**Example:** `SELECT COALESCE(nickname, name, 'Unknown') AS display_name FROM data.csv`

### NULLIF
**Syntax:** `NULLIF(expression1, expression2)`
**Returns:** Type of expression1 or NULL
**Description:** Return NULL if the two expressions are equal, otherwise return expression1.
**Example:** `SELECT value / NULLIF(divisor, 0) FROM data.csv` → prevents division by zero

### CASE WHEN
**Syntax:** `CASE WHEN condition1 THEN result1 WHEN condition2 THEN result2 ELSE default END`
**Returns:** Type of result values
**Description:** SQL standard conditional expression with multiple branches.
**Example:** `SELECT CASE WHEN score >= 90 THEN 'A' WHEN score >= 80 THEN 'B' ELSE 'F' END FROM data.csv`

## Aggregate Functions

Aggregate functions compute a single result from a set of values, typically used with GROUP BY.

### COUNT
**Syntax:** `COUNT(*)` or `COUNT(column)` or `COUNT(DISTINCT column)`
**Returns:** Integer
**Description:** Count rows. COUNT(*) includes NULLs, COUNT(column) excludes NULLs, COUNT(DISTINCT column) counts unique values.
**Example:** `SELECT category, COUNT(*) AS total FROM data.csv GROUP BY category`

### SUM
**Syntax:** `SUM(numeric_column)` or `SUM(DISTINCT numeric_column)`
**Returns:** Numeric (same type as input)
**Description:** Sum all numeric values. NULL values are ignored.
**Example:** `SELECT customer_id, SUM(amount) AS total_spent FROM orders.csv GROUP BY customer_id`

### AVG
**Syntax:** `AVG(numeric_column)` or `AVG(DISTINCT numeric_column)`
**Returns:** Float
**Description:** Calculate arithmetic mean of numeric values. NULL values are ignored.
**Example:** `SELECT department, AVG(salary) AS avg_salary FROM employees.csv GROUP BY department`

### MIN
**Syntax:** `MIN(column)`
**Returns:** Type of column
**Description:** Find the minimum value. Works with numbers, strings (alphabetically), and dates.
**Example:** `SELECT category, MIN(price) AS lowest_price FROM products.csv GROUP BY category`

### MAX
**Syntax:** `MAX(column)`
**Returns:** Type of column
**Description:** Find the maximum value. Works with numbers, strings (alphabetically), and dates.
**Example:** `SELECT category, MAX(price) AS highest_price FROM products.csv GROUP BY category`

### GROUP_CONCAT
**Syntax:** `GROUP_CONCAT(column)`
**Returns:** String
**Description:** Concatenate values from multiple rows into a single comma-separated string.
**Example:** `SELECT department, GROUP_CONCAT(name) AS employees FROM staff.csv GROUP BY department`

## Network Functions

### REVERSEDNS
**Syntax:** `REVERSEDNS(ip_address)`
**Returns:** String
**Description:** Perform reverse DNS lookup on an IP address. Currently returns the IP as-is (placeholder implementation).
**Example:** `SELECT REVERSEDNS(client_ip) AS hostname FROM logs.csv`

### IPMASK / IPNETWORK
**Syntax:** `IPMASK(ip_address, mask)` or `IPNETWORK(ip_address, mask)`
**Returns:** String (IP address)
**Description:** Apply a subnet mask to an IP address to get the network address. Mask can be dotted notation (255.255.255.0) or CIDR prefix (24).
**Example:** `SELECT IPMASK(client_ip, 24) AS network FROM logs.csv GROUP BY network`

## Window Functions

Window functions perform calculations across a set of rows related to the current row. Used with OVER clause.

### Ranking Functions
**Syntax:** `ROW_NUMBER() OVER (PARTITION BY col ORDER BY col2)`
**Returns:** Integer
**Description:** Assign unique sequential numbers starting from 1.
**Example:** `SELECT *, ROW_NUMBER() OVER (ORDER BY sales DESC) AS rank FROM data.csv`

**Syntax:** `RANK() OVER (PARTITION BY col ORDER BY col2)`
**Returns:** Integer
**Description:** Assign rank with gaps for ties (1, 2, 2, 4...).

**Syntax:** `DENSE_RANK() OVER (PARTITION BY col ORDER BY col2)`
**Returns:** Integer
**Description:** Assign rank without gaps for ties (1, 2, 2, 3...).

### Aggregate Window Functions
**Syntax:** `SUM(col) OVER (PARTITION BY col2 ORDER BY col3)`
**Description:** Running sum within partition. Also: AVG, COUNT, MIN, MAX.
**Example:** `SELECT date, amount, SUM(amount) OVER (ORDER BY date) AS running_total FROM data.csv`

### Navigation Functions
**Syntax:** `LAG(col, offset, default) OVER (PARTITION BY col2 ORDER BY col3)`
**Returns:** Type of column
**Description:** Access value from previous row. Default offset is 1.
**Example:** `SELECT date, value, LAG(value, 1) OVER (ORDER BY date) AS prev_value FROM data.csv`

**Syntax:** `LEAD(col, offset, default) OVER (PARTITION BY col2 ORDER BY col3)`
**Description:** Access value from next row.

**Syntax:** `FIRST_VALUE(col) OVER (PARTITION BY col2 ORDER BY col3)`
**Description:** Get first value in window.

**Syntax:** `LAST_VALUE(col) OVER (PARTITION BY col2 ORDER BY col3)`
**Description:** Get last value in window.

## Function Aliases

Many functions have aliases for MS Log Parser 2.2 compatibility:

| Canonical | Aliases |
|-----------|---------|
| UPPER | UCASE, TO_UPPERCASE |
| LOWER | LCASE, TO_LOWERCASE |
| LENGTH | LEN, STRLEN |
| SUBSTR | SUBSTRING |
| CONCAT | STRCAT |
| CEIL | CEILING |
| POWER | POW |
| SQRT | SQRROOT |
| IPMASK | IPNETWORK |

## NULL Handling

Most functions follow these rules:
- **NULL propagation**: If any required argument is NULL, the result is NULL
- **COALESCE exception**: Returns first non-NULL value
- **NULLIF exception**: Can return NULL by design
- **Aggregate functions**: Ignore NULL values (except COUNT(*))

Examples:
```sql
UPPER(NULL)              -- Returns NULL
CONCAT('a', NULL)        -- Returns NULL
COALESCE(NULL, 'default') -- Returns 'default'
COUNT(*)                 -- Counts rows including NULLs
COUNT(email)             -- Counts non-NULL email values
```

## Type Conversion

Functions automatically convert compatible types:
```sql
ROUND('3.14', 2)          -- String → Number: works
CONCAT('Value: ', 42)     -- Number → String: works
LENGTH(12345)             -- Number → String: works
ROUND('abc', 2)           -- Error: invalid conversion
```

## Common Patterns

### Data Cleaning
```sql
SELECT 
    UPPER(TRIM(name)) AS clean_name,
    COALESCE(NULLIF(TRIM(email), ''), 'unknown@example.com') AS email
FROM users.csv
```

### Date Range Filtering
```sql
SELECT * FROM logs.csv
WHERE DATE_DIFF(NOW(), TO_TIMESTAMP(date, '%Y-%m-%d'), 'DAY') <= 7
```

### Time Series Aggregation
```sql
SELECT 
    QUANTIZE(TO_TIMESTAMP(timestamp, '%Y-%m-%d %H:%M:%S'), 3600) AS hour,
    COUNT(*) AS requests,
    AVG(response_time) AS avg_response
FROM access_log.csv
GROUP BY hour
ORDER BY hour
```

### Conditional Aggregation
```sql
SELECT 
    category,
    COUNT(*) AS total,
    SUM(IF(status = 'active', 1, 0)) AS active_count,
    SUM(IF(status = 'error', 1, 0)) AS error_count
FROM items.csv
GROUP BY category
```

### Top N Per Group
```sql
SELECT * FROM (
    SELECT 
        category,
        product,
        sales,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rank
    FROM products.csv
) ranked
WHERE rank <= 3
```

### Safe Division
```sql
SELECT 
    name,
    numerator / NULLIF(denominator, 0) AS ratio
FROM data.csv
```

### Running Totals
```sql
SELECT 
    date,
    amount,
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM transactions.csv
```

## Best Practices

1. **Handle NULLs explicitly**: Use COALESCE for defaults, NULLIF for safe operations
2. **Use appropriate precision**: ROUND(price, 2) for currency, ROUND(lat, 6) for coordinates
3. **Validate before converting**: Check format before parsing dates or numbers
4. **Leverage window functions**: Use OVER clause instead of self-joins
5. **Group time series data**: Use QUANTIZE or EXTRACT for time bucketing
6. **Avoid nested complexity**: Break complex expressions into CTEs (WITH clauses)

## See Also

- [SQL Basics](/sql/basics) - Query syntax and operators
- [Aggregation](/sql/aggregation) - GROUP BY and HAVING
- [Window Functions](/sql/window-functions) - Advanced window operations
- [Common Table Expressions](/sql/cte) - WITH clause for complex queries
