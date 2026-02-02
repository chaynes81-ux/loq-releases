# Functions Reference

loq provides a comprehensive set of SQL functions for data manipulation, calculation, and transformation.

## Function Categories

| Category | Description | Examples |
|----------|-------------|----------|
| [String](/functions/string) | Text manipulation | UPPER, LOWER, SUBSTR, CONCAT |
| [Math](/functions/math) | Numeric operations | ROUND, ABS, POWER, SQRT |
| [Date/Time](/functions/datetime) | Temporal operations | TO_TIMESTAMP, EXTRACT, DATE_ADD |
| [Conditional](/functions/conditional) | Logic and branching | IF, COALESCE, NULLIF |
| [Aggregate](/functions/aggregate) | Group calculations | COUNT, SUM, AVG, MIN, MAX |

## Quick Reference

### String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `UPPER(s)` | Convert to uppercase | `UPPER('hello')` → `'HELLO'` |
| `LOWER(s)` | Convert to lowercase | `LOWER('HELLO')` → `'hello'` |
| `LENGTH(s)` | String length | `LENGTH('hello')` → `5` |
| `SUBSTR(s,start,len)` | Extract substring | `SUBSTR('hello',1,3)` → `'hel'` |
| `CONCAT(s1,s2,...)` | Concatenate strings | `CONCAT('a','b')` → `'ab'` |
| `TRIM(s)` | Remove whitespace | `TRIM(' hi ')` → `'hi'` |
| `REPLACE(s,old,new)` | Replace text | `REPLACE('abc','b','x')` → `'axc'` |

### Math Functions

| Function | Description | Example |
|----------|-------------|---------|
| `ROUND(n,d)` | Round to d decimals | `ROUND(3.14159,2)` → `3.14` |
| `FLOOR(n)` | Round down | `FLOOR(3.7)` → `3` |
| `CEIL(n)` | Round up | `CEIL(3.2)` → `4` |
| `ABS(n)` | Absolute value | `ABS(-5)` → `5` |
| `MOD(a,b)` | Modulo (remainder) | `MOD(10,3)` → `1` |
| `POWER(a,b)` | Exponentiation | `POWER(2,3)` → `8` |
| `SQRT(n)` | Square root | `SQRT(16)` → `4` |

### Date/Time Functions

| Function | Description | Example |
|----------|-------------|---------|
| `NOW()` | Current timestamp | `NOW()` → `2024-01-15T14:30:00` |
| `TO_TIMESTAMP(s,fmt)` | Parse timestamp | `TO_TIMESTAMP('2024-01-15','%Y-%m-%d')` |
| `TO_DATE(ts)` | Extract date | `TO_DATE(timestamp)` → `'2024-01-15'` |
| `TO_TIME(ts)` | Extract time | `TO_TIME(timestamp)` → `'14:30:00'` |
| `EXTRACT(part,ts)` | Extract component | `EXTRACT('year',ts)` → `2024` |
| `DATE_ADD(ts,n,unit)` | Add interval | `DATE_ADD(ts,7,'day')` |
| `DATE_DIFF(ts1,ts2,unit)` | Difference | `DATE_DIFF(ts1,ts2,'day')` |

### Conditional Functions

| Function | Description | Example |
|----------|-------------|---------|
| `IF(cond,t,f)` | Conditional | `IF(a>0,'pos','neg')` |
| `COALESCE(v1,v2,...)` | First non-NULL | `COALESCE(a,b,'default')` |
| `NULLIF(a,b)` | NULL if equal | `NULLIF(x,0)` |

### Aggregate Functions

| Function | Description | Example |
|----------|-------------|---------|
| `COUNT(*)` | Count rows | `COUNT(*)` |
| `COUNT(col)` | Count non-NULL | `COUNT(email)` |
| `SUM(col)` | Sum values | `SUM(amount)` |
| `AVG(col)` | Average | `AVG(score)` |
| `MIN(col)` | Minimum | `MIN(price)` |
| `MAX(col)` | Maximum | `MAX(date)` |
| `GROUP_CONCAT(col)` | Concatenate values | `GROUP_CONCAT(name)` |

## Function Aliases

Many functions have aliases for compatibility:

| Canonical | Aliases |
|-----------|---------|
| `UPPER` | `UCASE` |
| `LOWER` | `LCASE` |
| `LENGTH` | `LEN`, `STRLEN` |
| `CEIL` | `CEILING` |
| `POWER` | `POW` |

## NULL Handling

Most functions follow these rules:

1. **NULL propagation**: If any required argument is NULL, the result is NULL
2. **Explicit NULL handling**: Use COALESCE, NULLIF, or IS NULL checks

```sql
-- NULL propagates
UPPER(NULL)  -- Returns NULL
ROUND(NULL, 2)  -- Returns NULL

-- Handle NULLs explicitly
COALESCE(name, 'Unknown')  -- Returns 'Unknown' if name is NULL
NULLIF(divisor, 0)  -- Returns NULL if divisor is 0 (prevents division by zero)
```

## Type Coercion

Functions automatically convert compatible types:

```sql
-- String to number (when valid)
ROUND('3.14', 1)  -- Works: returns 3.1

-- Number to string
CONCAT('Value: ', 42)  -- Works: returns 'Value: 42'

-- Invalid conversions return errors
ROUND('abc', 1)  -- Error: cannot convert 'abc' to number
```

## Error Handling

Functions validate inputs and return errors for:

- Wrong argument count
- Invalid argument types
- Invalid values (e.g., invalid date format)

```sql
-- Wrong argument count
UPPER('a', 'b')  -- Error: UPPER expects 1 argument, got 2

-- Invalid type
SQRT('hello')  -- Error: expected number, got string

-- Invalid value
EXTRACT('invalid', timestamp)  -- Error: invalid EXTRACT part
```

## Using Functions

### In SELECT

```sql
SELECT
    UPPER(name) AS name,
    ROUND(price, 2) AS price,
    LENGTH(description) AS desc_len
FROM products.csv
```

### In WHERE

```sql
SELECT * FROM users.csv
WHERE LENGTH(name) > 5
  AND LOWER(status) = 'active'
```

### In ORDER BY

```sql
SELECT * FROM products.csv
ORDER BY LOWER(category), price DESC
```

### In GROUP BY

```sql
SELECT
    SUBSTR(date, 1, 7) AS month,
    COUNT(*) AS count
FROM events.csv
GROUP BY SUBSTR(date, 1, 7)
```

### Nested Functions

```sql
SELECT
    UPPER(TRIM(name)) AS clean_name,
    ROUND(ABS(diff), 2) AS abs_diff,
    COALESCE(NULLIF(value, 0), 1) AS safe_value
FROM data.csv
```

## Best Practices

### 1. Handle NULLs Explicitly

```sql
-- Good: explicit NULL handling
SELECT COALESCE(email, 'no-email@example.com') FROM users.csv

-- Risky: NULL propagation
SELECT email FROM users.csv  -- May return NULLs
```

### 2. Validate Data Types

```sql
-- Check before converting
SELECT
    CASE WHEN price LIKE '%[0-9]%' THEN ROUND(price, 2) ELSE 0 END
FROM products.csv
```

### 3. Use Appropriate Precision

```sql
-- Avoid unnecessary precision
SELECT ROUND(price, 2) FROM products.csv  -- 2 decimals for currency

-- Don't round too much
SELECT ROUND(lat, 6), ROUND(lon, 6) FROM locations.csv  -- Keep precision for coordinates
```

### 4. Chain Functions Readably

```sql
-- Clear nesting
SELECT
    UPPER(
        TRIM(
            REPLACE(name, '"', '')
        )
    ) AS clean_name
FROM data.csv
```

## See Also

- [String Functions](/functions/string) - Text manipulation
- [Math Functions](/functions/math) - Numeric operations
- [Date/Time Functions](/functions/datetime) - Temporal operations
- [Conditional Functions](/functions/conditional) - Logic functions
- [Aggregate Functions](/functions/aggregate) - Group calculations
