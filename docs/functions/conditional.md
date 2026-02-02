# Conditional Functions

Conditional functions provide logic for handling different cases, NULL values, and branching.

## IF

Conditional expression that returns one value if a condition is true, another if false.

```sql
IF(condition, true_value, false_value)
```

**Examples:**
```sql
-- Simple condition
SELECT IF(age >= 18, 'Adult', 'Minor') AS category FROM users.csv

-- Numeric condition
SELECT IF(score > 50, 'Pass', 'Fail') AS result FROM exams.csv

-- With calculations
SELECT IF(quantity > 0, price / quantity, 0) AS unit_price FROM orders.csv

-- Nested IF
SELECT IF(score >= 90, 'A',
          IF(score >= 80, 'B',
             IF(score >= 70, 'C', 'F'))) AS grade
FROM students.csv
```

### Truthy and Falsy Values

| Type | Truthy | Falsy |
|------|--------|-------|
| Integer | Non-zero | 0 |
| Float | Non-zero | 0.0 |
| Boolean | true | false |
| String | Non-empty | Empty string |
| NULL | Never | Always |

```sql
-- Truthy examples
IF(1, 'yes', 'no')         -- 'yes'
IF('text', 'yes', 'no')    -- 'yes'
IF(true, 'yes', 'no')      -- 'yes'

-- Falsy examples
IF(0, 'yes', 'no')         -- 'no'
IF('', 'yes', 'no')        -- 'no'
IF(NULL, 'yes', 'no')      -- 'no'
IF(false, 'yes', 'no')     -- 'no'
```

## COALESCE

Return the first non-NULL value from a list of arguments.

```sql
COALESCE(value1, value2, ..., valueN)
```

**Examples:**
```sql
-- Single fallback
SELECT COALESCE(nickname, name) AS display_name FROM users.csv

-- Multiple fallbacks
SELECT COALESCE(mobile, home, work, 'No phone') AS phone FROM contacts.csv

-- With default value
SELECT COALESCE(email, 'no-email@example.com') AS email FROM users.csv

-- Chain of alternatives
SELECT COALESCE(
    preferred_name,
    first_name,
    username,
    'Anonymous'
) AS name FROM accounts.csv
```

### Common Use Cases

```sql
-- Handle missing data
SELECT name, COALESCE(score, 0) AS score FROM students.csv

-- Provide defaults for calculations
SELECT
    name,
    COALESCE(quantity, 0) * COALESCE(price, 0) AS total
FROM orders.csv

-- Display friendly NULL message
SELECT
    name,
    COALESCE(status, 'Unknown') AS status
FROM items.csv
```

## NULLIF

Return NULL if two expressions are equal, otherwise return the first expression.

```sql
NULLIF(expression1, expression2)
```

**Examples:**
```sql
-- Convert value to NULL
SELECT NULLIF(status, 'unknown') AS status FROM items.csv
-- 'unknown' → NULL, anything else → unchanged

-- Prevent division by zero
SELECT value / NULLIF(divisor, 0) AS result FROM data.csv
-- If divisor is 0, returns NULL instead of error

-- Exclude specific values from aggregates
SELECT AVG(NULLIF(score, -1)) AS avg_score FROM results.csv
-- Ignores -1 values (which might represent "not applicable")
```

### NULLIF vs COALESCE

These functions are complementary:

```sql
-- NULLIF: convert value TO NULL
NULLIF(x, 0)  -- If x is 0, return NULL

-- COALESCE: convert NULL TO value
COALESCE(x, 0)  -- If x is NULL, return 0

-- Combined: replace one value with another
COALESCE(NULLIF(status, 'unknown'), 'pending')
-- 'unknown' → 'pending', NULL → 'pending', anything else → unchanged
```

## Combining Conditional Functions

### Safe Division

```sql
SELECT
    name,
    numerator / NULLIF(denominator, 0) AS ratio
FROM data.csv
```

### Default Value Pipeline

```sql
SELECT
    COALESCE(
        NULLIF(TRIM(input), ''),  -- Treat empty strings as NULL
        'default'
    ) AS value
FROM data.csv
```

### Complex Conditions

```sql
SELECT
    name,
    IF(status = 'active',
       COALESCE(premium_rate, standard_rate, 0),
       0) AS rate
FROM accounts.csv
```

## Comparison with CASE WHEN

`IF` is simpler for binary choices; `CASE WHEN` is more powerful for multiple conditions:

```sql
-- Simple binary: IF is cleaner
SELECT IF(age >= 18, 'Adult', 'Minor') FROM users.csv

-- Multiple conditions: CASE WHEN is better
SELECT CASE
    WHEN age < 13 THEN 'Child'
    WHEN age < 18 THEN 'Teen'
    WHEN age < 65 THEN 'Adult'
    ELSE 'Senior'
END AS age_group
FROM users.csv
```

## Common Patterns

### Null-Safe Comparisons

```sql
-- Instead of: a = b (fails if either is NULL)
SELECT * FROM data.csv
WHERE COALESCE(a, '') = COALESCE(b, '')
```

### Flag Columns

```sql
SELECT
    name,
    IF(email IS NOT NULL, 'Yes', 'No') AS has_email,
    IF(phone IS NOT NULL, 'Yes', 'No') AS has_phone
FROM users.csv
```

### Conditional Aggregation

```sql
SELECT
    COUNT(*) AS total,
    SUM(IF(status = 'active', 1, 0)) AS active_count,
    SUM(IF(status = 'inactive', 1, 0)) AS inactive_count
FROM users.csv
```

### Data Cleaning

```sql
SELECT
    id,
    -- Clean empty strings to NULL
    NULLIF(TRIM(name), '') AS name,
    -- Provide defaults
    COALESCE(NULLIF(TRIM(email), ''), 'unknown@example.com') AS email,
    -- Normalize status
    COALESCE(NULLIF(UPPER(TRIM(status)), ''), 'UNKNOWN') AS status
FROM raw_data.csv
```

### Pivot-like Transformation

```sql
SELECT
    product,
    SUM(IF(region = 'North', sales, 0)) AS north_sales,
    SUM(IF(region = 'South', sales, 0)) AS south_sales,
    SUM(IF(region = 'East', sales, 0)) AS east_sales,
    SUM(IF(region = 'West', sales, 0)) AS west_sales
FROM regional_sales.csv
GROUP BY product
```

### Risk Scoring

```sql
SELECT
    customer_id,
    IF(credit_score < 600, 3,
       IF(credit_score < 700, 2, 1)) AS risk_level,
    COALESCE(late_payments, 0) AS late_payments
FROM customers.csv
```

## Error Handling

```sql
-- IF requires exactly 3 arguments
IF(condition, true_val)  -- Error: missing false_val

-- COALESCE requires at least 1 argument
COALESCE()  -- Error: no arguments

-- NULLIF requires exactly 2 arguments
NULLIF(a)  -- Error: missing second argument
```

## See Also

- [Functions Overview](/functions/) - All function categories
- [CASE WHEN](/sql/case-when) - Complex conditional logic
- [SQL Basics](/sql/basics) - NULL handling in WHERE
