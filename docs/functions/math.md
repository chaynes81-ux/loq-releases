# Math Functions

Math functions perform numeric calculations and transformations.

## ABS

Return the absolute value.

```sql
ABS(number)
```

**Examples:**
```sql
SELECT ABS(-5)    -- 5
SELECT ABS(5)     -- 5
SELECT ABS(-3.14) -- 3.14

SELECT name, ABS(balance) AS abs_balance FROM accounts.csv
```

## ROUND

Round a number to specified decimal places.

```sql
ROUND(number, decimals)
```

- `decimals`: Number of decimal places (default: 0)

**Examples:**
```sql
SELECT ROUND(3.14159, 2)  -- 3.14
SELECT ROUND(3.14159, 0)  -- 3
SELECT ROUND(3.5)         -- 4 (rounds to nearest integer)
SELECT ROUND(3.14159, 4)  -- 3.1416

SELECT name, ROUND(price, 2) AS price FROM products.csv
```

### Rounding Behavior

Standard rounding (half up):
- `ROUND(2.5, 0)` → 3
- `ROUND(2.4, 0)` → 2
- `ROUND(-2.5, 0)` → -3

## FLOOR

Round down to the nearest integer.

```sql
FLOOR(number)
```

**Examples:**
```sql
SELECT FLOOR(3.7)   -- 3
SELECT FLOOR(3.2)   -- 3
SELECT FLOOR(-3.2)  -- -4 (toward negative infinity)
SELECT FLOOR(-3.7)  -- -4

SELECT FLOOR(price) AS whole_dollars FROM products.csv
```

## CEIL / CEILING

Round up to the nearest integer.

```sql
CEIL(number)
CEILING(number)  -- alias
```

**Examples:**
```sql
SELECT CEIL(3.2)   -- 4
SELECT CEIL(3.7)   -- 4
SELECT CEIL(-3.2)  -- -3 (toward positive infinity)
SELECT CEIL(-3.7)  -- -3

-- Calculate pages needed
SELECT CEIL(total_items / 10.0) AS pages FROM pagination.csv
```

## MOD

Return the remainder of division (modulo).

```sql
MOD(dividend, divisor)
```

**Examples:**
```sql
SELECT MOD(10, 3)  -- 1  (10 = 3*3 + 1)
SELECT MOD(10, 2)  -- 0  (10 is even)
SELECT MOD(17, 5)  -- 2

-- Check if even or odd
SELECT id, MOD(id, 2) AS is_odd FROM items.csv
SELECT * FROM items.csv WHERE MOD(id, 2) = 0  -- Even IDs only
```

## POWER / POW

Raise a number to a power.

```sql
POWER(base, exponent)
POW(base, exponent)  -- alias
```

**Examples:**
```sql
SELECT POWER(2, 3)   -- 8    (2³)
SELECT POWER(10, 2)  -- 100  (10²)
SELECT POWER(2, 10)  -- 1024
SELECT POWER(4, 0.5) -- 2    (square root)

-- Compound interest
SELECT principal * POWER(1 + rate, years) AS future_value FROM investments.csv
```

## SQRT

Return the square root.

```sql
SQRT(number)
```

**Examples:**
```sql
SELECT SQRT(16)  -- 4
SELECT SQRT(2)   -- 1.4142135623730951
SELECT SQRT(0)   -- 0

-- Distance calculation
SELECT SQRT(POWER(x2-x1, 2) + POWER(y2-y1, 2)) AS distance FROM points.csv
```

## Common Patterns

### Currency Formatting

```sql
SELECT
    name,
    ROUND(price, 2) AS price,
    ROUND(price * 1.08, 2) AS price_with_tax
FROM products.csv
```

### Percentage Calculations

```sql
SELECT
    category,
    total,
    ROUND(100.0 * total / SUM(total) OVER (), 2) AS percentage
FROM category_totals.csv
```

### Statistics

```sql
SELECT
    ROUND(AVG(score), 2) AS mean,
    MIN(score) AS min,
    MAX(score) AS max,
    MAX(score) - MIN(score) AS range
FROM scores.csv
```

### Binning/Bucketing

```sql
SELECT
    FLOOR(age / 10) * 10 AS age_bracket,
    COUNT(*) AS count
FROM users.csv
GROUP BY FLOOR(age / 10) * 10
ORDER BY age_bracket
```

Output:
```
age_bracket,count
10,15
20,45
30,38
40,22
```

### Rounding to Nearest N

```sql
-- Round to nearest 5
SELECT ROUND(value / 5.0) * 5 AS rounded FROM data.csv

-- Round to nearest 100
SELECT ROUND(value / 100.0) * 100 AS rounded FROM data.csv
```

### Safe Division

```sql
-- Avoid division by zero
SELECT
    numerator / NULLIF(denominator, 0) AS ratio
FROM data.csv

-- Or with CASE
SELECT
    CASE WHEN denominator = 0 THEN 0
         ELSE numerator / denominator
    END AS ratio
FROM data.csv
```

### Geometric Calculations

```sql
-- Circle area (π * r²)
SELECT name, ROUND(3.14159 * POWER(radius, 2), 2) AS area FROM circles.csv

-- Distance between two points
SELECT
    SQRT(POWER(x2 - x1, 2) + POWER(y2 - y1, 2)) AS distance
FROM point_pairs.csv
```

### Growth Calculations

```sql
-- Percentage change
SELECT
    period,
    value,
    ROUND(100.0 * (value - LAG(value, 1, value) OVER (ORDER BY period))
          / LAG(value, 1, value) OVER (ORDER BY period), 2) AS pct_change
FROM metrics.csv
```

### Normalization

```sql
-- Min-max normalization (scale to 0-1)
SELECT
    name,
    (value - MIN(value) OVER ()) / (MAX(value) OVER () - MIN(value) OVER ()) AS normalized
FROM data.csv
```

## NULL Handling

Math functions return NULL for NULL inputs:

```sql
ABS(NULL)        -- NULL
ROUND(NULL, 2)   -- NULL
SQRT(NULL)       -- NULL
```

Handle with COALESCE:

```sql
SELECT ROUND(COALESCE(price, 0), 2) FROM products.csv
```

## Type Conversion

String values are converted to numbers when valid:

```sql
ROUND('3.14159', 2)  -- 3.14 (string converted)
ABS('-5')            -- 5 (string converted)

-- Invalid strings cause errors
ROUND('abc', 2)      -- Error: cannot convert 'abc' to number
```

## Edge Cases

```sql
-- Square root of negative numbers
SQRT(-1)  -- Error or NaN

-- Very large numbers
POWER(10, 100)  -- May overflow

-- Division by zero
10 / 0  -- Error

-- Use NULLIF to prevent division by zero
10 / NULLIF(x, 0)  -- Returns NULL instead of error
```

## See Also

- [Functions Overview](/functions/) - All function categories
- [Aggregate Functions](/functions/aggregate) - SUM, AVG, etc.
- [Conditional Functions](/functions/conditional) - NULLIF for safe division
