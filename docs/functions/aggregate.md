# Aggregate Functions

Aggregate functions compute a single result from a set of input values, typically used with GROUP BY.

## COUNT

Count rows or non-NULL values.

### COUNT(*)

Count all rows, including NULLs:

```sql
SELECT COUNT(*) AS total_rows FROM users.csv
```

### COUNT(column)

Count non-NULL values in a column:

```sql
SELECT COUNT(email) AS users_with_email FROM users.csv
-- Only counts rows where email is not NULL
```

### COUNT(DISTINCT column)

Count unique non-NULL values:

```sql
SELECT COUNT(DISTINCT city) AS unique_cities FROM users.csv
```

**Examples:**
```sql
-- Total rows
SELECT COUNT(*) FROM orders.csv

-- Non-NULL values
SELECT COUNT(shipped_date) AS shipped_count FROM orders.csv

-- Unique values
SELECT COUNT(DISTINCT customer_id) AS unique_customers FROM orders.csv

-- With GROUP BY
SELECT status, COUNT(*) AS count FROM orders.csv GROUP BY status
```

## SUM

Sum numeric values.

```sql
SUM(numeric_column)
```

**Examples:**
```sql
-- Total of a column
SELECT SUM(amount) AS total_sales FROM orders.csv

-- With conditions
SELECT SUM(amount) AS completed_sales
FROM orders.csv
WHERE status = 'completed'

-- With GROUP BY
SELECT
    customer_id,
    SUM(amount) AS customer_total
FROM orders.csv
GROUP BY customer_id

-- Conditional sum
SELECT
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
FROM orders.csv
```

## AVG

Calculate the arithmetic mean of numeric values.

```sql
AVG(numeric_column)
```

NULL values are ignored in the calculation.

**Examples:**
```sql
-- Simple average
SELECT AVG(score) AS average_score FROM students.csv

-- Rounded average
SELECT ROUND(AVG(price), 2) AS avg_price FROM products.csv

-- With GROUP BY
SELECT
    department,
    AVG(salary) AS avg_salary
FROM employees.csv
GROUP BY department

-- Weighted average (manual)
SELECT SUM(score * weight) / SUM(weight) AS weighted_avg FROM grades.csv
```

## MIN

Find the minimum value.

```sql
MIN(column)
```

Works with numbers, strings (alphabetically), and dates.

**Examples:**
```sql
-- Minimum number
SELECT MIN(price) AS lowest_price FROM products.csv

-- Minimum date
SELECT MIN(order_date) AS first_order FROM orders.csv

-- Minimum string (alphabetically first)
SELECT MIN(name) AS first_name FROM users.csv

-- With GROUP BY
SELECT
    category,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products.csv
GROUP BY category
```

## MAX

Find the maximum value.

```sql
MAX(column)
```

Works with numbers, strings (alphabetically), and dates.

**Examples:**
```sql
-- Maximum number
SELECT MAX(salary) AS highest_salary FROM employees.csv

-- Maximum date
SELECT MAX(last_login) AS most_recent_login FROM users.csv

-- With GROUP BY
SELECT
    department,
    MAX(salary) AS top_salary
FROM employees.csv
GROUP BY department

-- Combined with MIN
SELECT
    MAX(score) - MIN(score) AS score_range
FROM results.csv
```

## GROUP_CONCAT

Concatenate values from multiple rows into a single string.

```sql
GROUP_CONCAT(column)
```

Values are comma-separated by default.

**Examples:**
```sql
-- List all names
SELECT GROUP_CONCAT(name) AS all_names FROM users.csv
-- Returns: 'Alice,Bob,Carol,David'

-- With GROUP BY
SELECT
    department,
    GROUP_CONCAT(name) AS employees
FROM employees.csv
GROUP BY department
-- Returns:
-- Engineering,Alice,Bob
-- Marketing,Carol,David

-- Combined with other aggregates
SELECT
    category,
    COUNT(*) AS count,
    GROUP_CONCAT(product_name) AS products
FROM products.csv
GROUP BY category
```

## Using Aggregates

### Without GROUP BY

Aggregates entire result set:

```sql
SELECT
    COUNT(*) AS total,
    SUM(amount) AS sum,
    AVG(amount) AS avg,
    MIN(amount) AS min,
    MAX(amount) AS max
FROM orders.csv
```

### With GROUP BY

Aggregates each group:

```sql
SELECT
    category,
    COUNT(*) AS count,
    SUM(price) AS total,
    AVG(price) AS average
FROM products.csv
GROUP BY category
```

### With HAVING

Filter groups by aggregate values:

```sql
SELECT
    customer_id,
    COUNT(*) AS order_count,
    SUM(amount) AS total_spent
FROM orders.csv
GROUP BY customer_id
HAVING COUNT(*) >= 5 AND SUM(amount) > 1000
```

### With Window Functions

As window aggregates:

```sql
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    SUM(salary) OVER () AS company_total
FROM employees.csv
```

## Common Patterns

### Summary Statistics

```sql
SELECT
    COUNT(*) AS count,
    ROUND(AVG(value), 2) AS mean,
    MIN(value) AS min,
    MAX(value) AS max,
    MAX(value) - MIN(value) AS range
FROM measurements.csv
```

### Percentage of Total

```sql
SELECT
    category,
    SUM(sales) AS category_sales,
    ROUND(100.0 * SUM(sales) / (SELECT SUM(sales) FROM sales.csv), 2) AS pct
FROM sales.csv
GROUP BY category
ORDER BY pct DESC
```

### Running Totals

```sql
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions.csv
```

### Conditional Counting

```sql
SELECT
    department,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive,
    ROUND(100.0 * SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) / COUNT(*), 1) AS active_pct
FROM employees.csv
GROUP BY department
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

### Pivot by Condition

```sql
SELECT
    product,
    SUM(CASE WHEN year = 2023 THEN sales END) AS sales_2023,
    SUM(CASE WHEN year = 2024 THEN sales END) AS sales_2024
FROM annual_sales.csv
GROUP BY product
```

### First/Last Values

```sql
-- Most recent order per customer
SELECT
    customer_id,
    MAX(order_date) AS last_order,
    MIN(order_date) AS first_order
FROM orders.csv
GROUP BY customer_id
```

### Moving Averages

```sql
SELECT
    date,
    value,
    AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7
FROM metrics.csv
```

## NULL Handling

| Function | NULL Behavior |
|----------|---------------|
| `COUNT(*)` | Counts all rows including NULLs |
| `COUNT(col)` | Ignores NULLs |
| `SUM(col)` | Ignores NULLs; returns NULL if all NULL |
| `AVG(col)` | Ignores NULLs; returns NULL if all NULL |
| `MIN(col)` | Ignores NULLs; returns NULL if all NULL |
| `MAX(col)` | Ignores NULLs; returns NULL if all NULL |
| `GROUP_CONCAT(col)` | Ignores NULLs |

```sql
-- COUNT(*) vs COUNT(column)
SELECT
    COUNT(*) AS all_rows,           -- Includes NULLs
    COUNT(email) AS with_email      -- Excludes NULLs
FROM users.csv

-- Handle NULL results
SELECT COALESCE(SUM(amount), 0) AS total FROM orders.csv WHERE 1=0
-- Returns 0 instead of NULL
```

## Type Requirements

| Function | Input Type |
|----------|------------|
| `SUM` | Numeric |
| `AVG` | Numeric |
| `MIN` | Numeric, String, Date |
| `MAX` | Numeric, String, Date |
| `COUNT` | Any |
| `GROUP_CONCAT` | Any (converted to string) |

## See Also

- [Functions Overview](/functions/) - All function categories
- [Aggregation](/sql/aggregation) - GROUP BY, HAVING
- [Window Functions](/sql/window-functions) - OVER clause aggregates
