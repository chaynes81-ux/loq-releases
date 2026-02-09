# SQL Syntax Reference for LLMs

Comprehensive SQL syntax guide for loq (Log Query) - Microsoft Log Parser 2.2 compatible query engine.

## Quick Reference

### Query Structure
```sql
WITH cte_name AS (SELECT ...)
SELECT [DISTINCT] [TOP n [PERCENT]] columns
FROM 'file.csv' [alias]
[INNER|LEFT|CROSS] JOIN 'file2' ON condition
WHERE conditions
GROUP BY columns
HAVING aggregate_conditions
ORDER BY columns [ASC|DESC] [NULLS FIRST|LAST]
LIMIT n
[UNION [ALL] SELECT ...]
[INTO 'output.csv']
```

## 1. SELECT Clause

### Syntax
- `SELECT *` - All columns
- `SELECT col1, col2` - Specific columns
- `SELECT col AS alias` - Column with alias (AS optional)
- `SELECT expr AS name` - Expression with alias
- `SELECT DISTINCT col` - Remove duplicates

### Examples
```sql
SELECT * FROM data.csv
SELECT name, age FROM users.csv
SELECT price * quantity AS total FROM orders.csv
SELECT DISTINCT city FROM customers.csv
```

## 2. FROM Clause

### Syntax
- `FROM 'filename.ext'` - File path (quotes for spaces)
- `FROM file.csv alias` - Table alias
- Supports: CSV, TSV, JSON, XML, W3C, IIS, Syslog, EVTX, etc.

### File Patterns
```sql
FROM 'access.log'                    -- Single file
FROM '/var/log/app.log'              -- Absolute path
FROM 'logs/*.csv'                    -- Glob pattern
FROM 'C:\Logs\access.log'            -- Windows path
```

## 3. WHERE Clause

### Operators
- `=`, `!=`, `<>` - Equality/inequality
- `<`, `>`, `<=`, `>=` - Comparison
- `AND`, `OR`, `NOT` - Logical
- `BETWEEN x AND y` - Range (inclusive)
- `IN (val1, val2, ...)` - Value in list
- `NOT IN (...)` - Value not in list
- `LIKE 'pattern'` - Pattern matching (% = any chars, _ = one char)
- `NOT LIKE 'pattern'` - Pattern exclusion
- `IS NULL`, `IS NOT NULL` - NULL checks

### Examples
```sql
WHERE age > 30
WHERE status = 'active' AND city IN ('NYC', 'LA')
WHERE price BETWEEN 10 AND 100
WHERE name LIKE 'J%'
WHERE email IS NOT NULL
WHERE NOT (deleted OR banned)
```

## 4. GROUP BY

### Syntax
- `GROUP BY col1, col2, ...` - Group by columns
- All non-aggregated SELECT columns must be in GROUP BY
- Can group by expressions: `GROUP BY EXTRACT('year', date)`

### Examples
```sql
SELECT city, COUNT(*) FROM users.csv GROUP BY city
SELECT dept, AVG(salary) FROM emp.csv GROUP BY dept
SELECT EXTRACT('year', date) AS yr, SUM(amt) FROM sales.csv GROUP BY yr
```

## 5. HAVING

### Syntax
- `HAVING condition` - Filter groups after aggregation
- Use aggregate functions in condition
- Follows GROUP BY

### Examples
```sql
SELECT city, COUNT(*) AS cnt FROM users.csv GROUP BY city HAVING cnt > 100
SELECT dept, AVG(salary) AS avg FROM emp.csv GROUP BY dept HAVING avg > 50000
SELECT region, SUM(sales) FROM sales.csv GROUP BY region HAVING COUNT(*) >= 5
```

## 6. ORDER BY

### Syntax
- `ORDER BY col [ASC|DESC]` - Single column (ASC default)
- `ORDER BY col1, col2 DESC` - Multiple columns
- `ORDER BY 1, 2` - By position (1-based)
- `ORDER BY expr` - By expression
- `NULLS FIRST|LAST` - NULL positioning

### Examples
```sql
ORDER BY name
ORDER BY age DESC
ORDER BY city ASC, name DESC
ORDER BY price * quantity DESC
ORDER BY 2 DESC  -- Second column
ORDER BY score DESC NULLS LAST
```

## 7. LIMIT / TOP / TOP PERCENT

### LIMIT Syntax
```sql
LIMIT n  -- Restrict to n rows (standard SQL)
```

### TOP Syntax (MS Log Parser compatible)
```sql
SELECT TOP n * FROM file.csv           -- First n rows
SELECT TOP n PERCENT * FROM file.csv   -- Top n% of rows (requires ORDER BY)
```

### Examples
```sql
SELECT * FROM data.csv LIMIT 10
SELECT TOP 100 * FROM logs.csv
SELECT TOP 25 PERCENT * FROM sales.csv ORDER BY amount DESC
SELECT TOP 10 * FROM users.csv ORDER BY score DESC  -- Top 10 by score
```

## 8. INTO (Output Routing)

### Syntax
```sql
SELECT ... INTO 'output.file' FROM ...
```

### Format Inference
- `.csv` → CSV
- `.json`, `.ndjson` → JSON
- `.xml` → XML
- `.db`, `.sqlite` → SQLite
- `.tsv` → TSV
- `.parquet` → Parquet
- `.png`, `.svg` → Chart

### Examples
```sql
SELECT * INTO results.csv FROM data.csv
SELECT name, total INTO output.json FROM orders.csv WHERE total > 1000
SELECT TOP 1000 * INTO filtered.db FROM large_file.csv
```

## 9. JOINs

### Syntax
```sql
FROM table1 [alias1]
[INNER|LEFT|CROSS] JOIN table2 [alias2] ON condition
```

### Types
- `INNER JOIN` (or just `JOIN`) - Matching rows only
- `LEFT JOIN` - All left rows + matching right rows (NULL if no match)
- `CROSS JOIN` - Cartesian product (all combinations)

### Examples
```sql
-- INNER JOIN
SELECT u.name, o.total
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id

-- LEFT JOIN
SELECT u.name, COALESCE(o.product, 'No orders') AS product
FROM users.csv u
LEFT JOIN orders.csv o ON u.id = o.user_id

-- CROSS JOIN
SELECT p.product, c.color
FROM products.csv p
CROSS JOIN colors.csv c

-- Multiple JOINs
SELECT u.name, o.order_id, p.product_name
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
INNER JOIN products.csv p ON o.product_id = p.id

-- Non-equality JOIN
SELECT a.name, b.name
FROM table1.csv a
INNER JOIN table2.csv b ON a.value > b.threshold
```

## 10. UNION / UNION ALL

### Syntax
```sql
SELECT cols FROM table1
UNION [ALL]
SELECT cols FROM table2
[ORDER BY cols]
[LIMIT n]
```

### Rules
- Same number of columns
- Compatible data types
- Column names from first SELECT
- `UNION` removes duplicates (slower)
- `UNION ALL` keeps all rows (faster)

### Examples
```sql
-- Basic UNION
SELECT city FROM customers.csv
UNION
SELECT city FROM suppliers.csv

-- UNION ALL (keep duplicates)
SELECT name, 'Customer' AS type FROM customers.csv
UNION ALL
SELECT name, 'Supplier' AS type FROM suppliers.csv

-- With ORDER BY and LIMIT
SELECT * FROM jan_sales.csv
UNION ALL
SELECT * FROM feb_sales.csv
ORDER BY date DESC
LIMIT 100

-- Individual LIMIT with parentheses
(SELECT * FROM region1.csv ORDER BY sales DESC LIMIT 5)
UNION ALL
(SELECT * FROM region2.csv ORDER BY sales DESC LIMIT 5)

-- With GROUP BY
SELECT region, SUM(sales) AS total FROM q1.csv GROUP BY region
UNION ALL
SELECT region, SUM(sales) AS total FROM q2.csv GROUP BY region
```

## 11. WITH (Common Table Expressions)

### Syntax
```sql
WITH cte_name AS (
    SELECT ...
)
SELECT ... FROM cte_name
```

### Multiple CTEs
```sql
WITH
    cte1 AS (SELECT ...),
    cte2 AS (SELECT ... FROM cte1)
SELECT ... FROM cte2
```

### Examples
```sql
-- Single CTE
WITH active_users AS (
    SELECT * FROM users.csv WHERE status = 'active'
)
SELECT name FROM active_users ORDER BY name

-- Multiple CTEs
WITH
    filtered AS (SELECT * FROM orders.csv WHERE total > 100),
    aggregated AS (SELECT customer_id, SUM(total) AS sum FROM filtered GROUP BY customer_id)
SELECT c.name, a.sum
FROM customers.csv c
INNER JOIN aggregated a ON c.id = a.customer_id

-- Chained CTEs
WITH
    base AS (SELECT * FROM logs.csv WHERE level = 'ERROR'),
    hourly AS (SELECT EXTRACT('hour', time) AS hr, COUNT(*) AS cnt FROM base GROUP BY hr),
    filtered AS (SELECT * FROM hourly WHERE cnt > 100)
SELECT * FROM filtered ORDER BY hr

-- CTE used multiple times
WITH stats AS (
    SELECT AVG(salary) AS avg_sal, MAX(salary) AS max_sal FROM employees.csv
)
SELECT e.name, e.salary, s.avg_sal, e.salary - s.avg_sal AS diff
FROM employees.csv e, stats s
WHERE e.salary > s.avg_sal
```

## 12. Subqueries

### Types
- **Scalar subquery** - Returns single value
- **IN subquery** - Returns list of values
- **EXISTS subquery** - Returns boolean

### Scalar Subquery
```sql
-- In WHERE
SELECT name, salary FROM employees.csv
WHERE salary > (SELECT AVG(salary) FROM employees.csv)

-- In SELECT
SELECT name, salary - (SELECT AVG(salary) FROM employees.csv) AS diff
FROM employees.csv
```

### IN Subquery
```sql
-- Basic IN
SELECT name FROM users.csv
WHERE id IN (SELECT user_id FROM orders.csv)

-- NOT IN
SELECT name FROM users.csv
WHERE id NOT IN (SELECT user_id FROM orders.csv WHERE total > 1000)
```

### EXISTS Subquery
```sql
-- Basic EXISTS
SELECT name FROM users.csv u
WHERE EXISTS (SELECT 1 FROM orders.csv o WHERE o.user_id = u.id)

-- NOT EXISTS
SELECT name FROM users.csv u
WHERE NOT EXISTS (SELECT 1 FROM orders.csv o WHERE o.user_id = u.id)
```

### Correlated Subquery
```sql
-- Reference outer query
SELECT name, salary, department FROM employees.csv e
WHERE salary > (
    SELECT AVG(salary)
    FROM employees.csv e2
    WHERE e2.department = e.department
)
```

### Derived Table (Subquery in FROM)
```sql
SELECT dept, avg_salary
FROM (
    SELECT department AS dept, AVG(salary) AS avg_salary
    FROM employees.csv
    GROUP BY department
) dept_stats
WHERE avg_salary > 50000
```

## 13. CASE WHEN Expressions

### Simple CASE
```sql
CASE column
    WHEN value1 THEN result1
    WHEN value2 THEN result2
    ELSE default_result
END
```

### Searched CASE
```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ELSE default_result
END
```

### Examples
```sql
-- Simple CASE
SELECT name,
    CASE status
        WHEN 'active' THEN 'A'
        WHEN 'inactive' THEN 'I'
        ELSE 'U'
    END AS status_code
FROM users.csv

-- Searched CASE (grading)
SELECT name, score,
    CASE
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        ELSE 'F'
    END AS grade
FROM students.csv

-- Multiple conditions
SELECT name, age, income,
    CASE
        WHEN age < 18 THEN 'Minor'
        WHEN age >= 65 THEN 'Senior'
        WHEN income > 100000 THEN 'High Income'
        ELSE 'Standard'
    END AS category
FROM customers.csv

-- In WHERE clause
SELECT * FROM orders.csv
WHERE CASE
    WHEN priority = 'high' THEN total > 100
    ELSE total > 500
END

-- Conditional aggregation
SELECT department,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_count
FROM employees.csv
GROUP BY department

-- Pivot with CASE
SELECT product,
    MAX(CASE WHEN region = 'North' THEN sales END) AS north,
    MAX(CASE WHEN region = 'South' THEN sales END) AS south,
    MAX(CASE WHEN region = 'East' THEN sales END) AS east,
    MAX(CASE WHEN region = 'West' THEN sales END) AS west
FROM regional_sales.csv
GROUP BY product
```

## 14. Window Functions

### Syntax
```sql
function_name([args]) OVER (
    [PARTITION BY col1, col2, ...]
    [ORDER BY col3 [ASC|DESC], ...]
)
```

### Ranking Functions
- `ROW_NUMBER()` - Sequential number (1, 2, 3, 4...)
- `RANK()` - Rank with gaps (1, 2, 2, 4...)
- `DENSE_RANK()` - Rank without gaps (1, 2, 2, 3...)

### Aggregate Window Functions
- `SUM(col) OVER (...)` - Running/partitioned sum
- `AVG(col) OVER (...)` - Running/partitioned average
- `COUNT(*) OVER (...)` - Running/partitioned count
- `MIN(col) OVER (...)` - Running/partitioned minimum
- `MAX(col) OVER (...)` - Running/partitioned maximum

### Navigation Functions
- `LAG(col, offset, default) OVER (...)` - Previous row value
- `LEAD(col, offset, default) OVER (...)` - Next row value
- `FIRST_VALUE(col) OVER (...)` - First value in partition/window
- `LAST_VALUE(col) OVER (...)` - Last value in partition/window

### Examples
```sql
-- ROW_NUMBER (unique sequential)
SELECT name, score,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num
FROM students.csv

-- RANK (with gaps for ties)
SELECT name, score,
    RANK() OVER (ORDER BY score DESC) AS rank
FROM students.csv

-- DENSE_RANK (no gaps)
SELECT name, score,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM students.csv

-- PARTITION BY (rank within groups)
SELECT department, name, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees.csv

-- Running total
SELECT date, amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions.csv

-- Partition aggregate
SELECT department, name, salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg
FROM employees.csv

-- LAG (previous row)
SELECT date, price,
    LAG(price, 1, 0) OVER (ORDER BY date) AS prev_price,
    price - LAG(price, 1, price) OVER (ORDER BY date) AS change
FROM stock_prices.csv

-- LEAD (next row)
SELECT date, price,
    LEAD(price, 1, 0) OVER (ORDER BY date) AS next_price
FROM stock_prices.csv

-- FIRST_VALUE / LAST_VALUE
SELECT name, salary,
    FIRST_VALUE(name) OVER (ORDER BY salary DESC) AS highest_earner,
    LAST_VALUE(name) OVER (ORDER BY salary DESC) AS lowest_earner
FROM employees.csv

-- Top N per group
SELECT * FROM (
    SELECT department, name, salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees.csv
) ranked
WHERE rn <= 3

-- Percent of total
SELECT department, name, salary,
    ROUND(100.0 * salary / SUM(salary) OVER (), 2) AS pct_of_total,
    ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY department), 2) AS pct_of_dept
FROM employees.csv

-- Moving average (7-period)
SELECT date, value,
    AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7
FROM metrics.csv
```

## Aggregate Functions

- `COUNT(*)` - Count all rows
- `COUNT(col)` - Count non-NULL values
- `SUM(col)` - Sum of values
- `AVG(col)` - Average of values
- `MIN(col)` - Minimum value
- `MAX(col)` - Maximum value
- `GROUP_CONCAT(col)` - Concatenate values

## String Functions (Common)

- `UPPER(s)`, `TO_UPPERCASE(s)` - Uppercase
- `LOWER(s)`, `TO_LOWERCASE(s)` - Lowercase
- `SUBSTR(s, start, len)` - Substring
- `REPLACE(s, old, new)`, `REPLACE_STR(s, old, new)` - Replace text
- `TRIM(s)`, `LTRIM(s)`, `RTRIM(s)` - Trim whitespace
- `STRLEN(s)` - String length
- `CONCAT(s1, s2, ...)`, `STRCAT(s1, s2, ...)` - Concatenate
- `INDEX_OF(s, sub)`, `LAST_INDEX_OF(s, sub)` - Find substring
- `EXTRACT_FILENAME(path)`, `EXTRACT_EXTENSION(path)` - Parse path

## Math Functions (Common)

- `ROUND(n, places)` - Round number
- `FLOOR(n)`, `CEIL(n)` - Round down/up
- `ABS(n)` - Absolute value
- `MOD(n, divisor)` - Modulo
- `POWER(n, exp)`, `SQRT(n)` - Power/square root

## Date/Time Functions (Common)

- `TO_TIMESTAMP(s)`, `TO_DATE(s)`, `TO_TIME(s)` - Parse date/time
- `EXTRACT(part, dt)` - Extract part (year, month, day, hour, etc.)
- `NOW()` - Current timestamp
- `DATE_ADD(dt, interval)`, `DATE_DIFF(dt1, dt2)` - Date arithmetic
- `QUANTIZE(dt, unit)` - Round to time unit

## Conditional Functions

- `COALESCE(val1, val2, ...)` - First non-NULL value
- `NULLIF(val1, val2)` - NULL if equal, else val1
- `IF(condition, true_val, false_val)` - Conditional value

## Query Execution Order

1. **WITH** - Define CTEs
2. **FROM** - Load data
3. **JOIN** - Combine tables
4. **WHERE** - Filter rows
5. **GROUP BY** - Group rows
6. **HAVING** - Filter groups
7. **SELECT** - Compute columns
8. **DISTINCT** - Remove duplicates
9. **UNION** - Combine results
10. **ORDER BY** - Sort results
11. **LIMIT/TOP** - Restrict rows
12. **INTO** - Write output

## Common Patterns

### Top N per Group
```sql
SELECT * FROM (
    SELECT category, product, sales,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rn
    FROM products.csv
) WHERE rn <= 3
```

### Pivot Data
```sql
SELECT dept,
    MAX(CASE WHEN month = 'Jan' THEN sales END) AS jan,
    MAX(CASE WHEN month = 'Feb' THEN sales END) AS feb,
    MAX(CASE WHEN month = 'Mar' THEN sales END) AS mar
FROM sales.csv
GROUP BY dept
```

### Running Totals
```sql
SELECT date, amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions.csv
```

### Above Average in Group
```sql
WITH dept_avg AS (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees.csv
    GROUP BY department
)
SELECT e.name, e.department, e.salary, d.avg_salary
FROM employees.csv e
INNER JOIN dept_avg d ON e.department = d.department
WHERE e.salary > d.avg_salary
```

### Find Duplicates
```sql
SELECT email, COUNT(*) AS cnt
FROM users.csv
GROUP BY email
HAVING cnt > 1
```

### Find Records Without Matches
```sql
SELECT name FROM users.csv
WHERE id NOT IN (SELECT user_id FROM orders.csv)

-- Or using LEFT JOIN
SELECT u.name
FROM users.csv u
LEFT JOIN orders.csv o ON u.id = o.user_id
WHERE o.order_id IS NULL
```

---

**Note:** This is a dense reference optimized for LLM consumption. For human-readable documentation with detailed explanations and more examples, see `/docs/sql/` directory.
