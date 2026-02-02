# GROUP BY, HAVING, ORDER BY

This page covers aggregation and sorting in loq SQL.

## ORDER BY

Sort results by one or more columns.

### Basic Sorting

```sql
-- Ascending (default)
SELECT * FROM users.csv ORDER BY name

-- Explicit ascending
SELECT * FROM users.csv ORDER BY name ASC

-- Descending
SELECT * FROM users.csv ORDER BY age DESC
```

### Multiple Columns

Sort by multiple columns (first column takes priority):

```sql
-- Sort by city, then by name within each city
SELECT * FROM users.csv ORDER BY city ASC, name ASC

-- Sort by department, then salary descending within each
SELECT * FROM employees.csv ORDER BY department, salary DESC
```

### Sorting by Expressions

Sort by calculated values:

```sql
SELECT name, price, quantity, price * quantity AS total
FROM orders.csv
ORDER BY price * quantity DESC
```

### Sorting by Alias

Use column aliases in ORDER BY:

```sql
SELECT name, price * quantity AS total
FROM orders.csv
ORDER BY total DESC
```

### Sorting by Position

Reference columns by position (1-based):

```sql
SELECT name, age, city FROM users.csv
ORDER BY 2 DESC  -- Sort by age (column 2)
```

### NULL Ordering

NULL values sort first in ascending, last in descending:

```sql
-- NULLs first
SELECT * FROM users.csv ORDER BY email ASC

-- NULLs last
SELECT * FROM users.csv ORDER BY email DESC
```

## Aggregate Functions

Aggregate functions compute a single value from multiple rows.

### COUNT

Count rows:

```sql
-- Count all rows
SELECT COUNT(*) FROM users.csv

-- Count non-NULL values
SELECT COUNT(email) FROM users.csv

-- Count with alias
SELECT COUNT(*) AS total_users FROM users.csv
```

### SUM

Sum numeric values:

```sql
SELECT SUM(amount) AS total_sales FROM orders.csv

-- Sum with condition
SELECT SUM(amount) AS total
FROM orders.csv
WHERE status = 'completed'
```

### AVG

Calculate average:

```sql
SELECT AVG(salary) AS avg_salary FROM employees.csv

-- Rounded average
SELECT ROUND(AVG(salary), 2) AS avg_salary FROM employees.csv
```

### MIN / MAX

Find minimum or maximum:

```sql
SELECT
    MIN(price) AS lowest_price,
    MAX(price) AS highest_price
FROM products.csv

-- With dates
SELECT
    MIN(created_date) AS first_order,
    MAX(created_date) AS last_order
FROM orders.csv
```

### GROUP_CONCAT

Concatenate values from multiple rows:

```sql
SELECT department, GROUP_CONCAT(name) AS employees
FROM employees.csv
GROUP BY department
```

Output:
```
department,employees
Engineering,Alice,Bob,Carol
Marketing,David,Eve
```

### Multiple Aggregates

Combine multiple aggregate functions:

```sql
SELECT
    COUNT(*) AS total,
    SUM(amount) AS sum,
    AVG(amount) AS avg,
    MIN(amount) AS min,
    MAX(amount) AS max
FROM orders.csv
```

## GROUP BY

Group rows with the same values in specified columns.

### Basic Grouping

```sql
SELECT city, COUNT(*) AS count
FROM users.csv
GROUP BY city
```

Output:
```
city,count
New York,150
Chicago,89
Los Angeles,120
```

### Multiple Grouping Columns

```sql
SELECT city, status, COUNT(*) AS count
FROM users.csv
GROUP BY city, status
```

### Grouping with Aggregates

```sql
SELECT
    department,
    COUNT(*) AS employees,
    AVG(salary) AS avg_salary,
    SUM(salary) AS total_payroll
FROM employees.csv
GROUP BY department
```

### Grouping by Expressions

```sql
-- Group by year
SELECT
    EXTRACT('year', order_date) AS year,
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM orders.csv
GROUP BY EXTRACT('year', order_date)

-- Group by first letter
SELECT
    SUBSTR(name, 1, 1) AS initial,
    COUNT(*) AS count
FROM users.csv
GROUP BY SUBSTR(name, 1, 1)
```

### All Non-Aggregated Columns Must Be in GROUP BY

::: warning Rule
Any column in SELECT that's not in an aggregate function must be in GROUP BY.
:::

```sql
-- Correct
SELECT city, status, COUNT(*)
FROM users.csv
GROUP BY city, status

-- Incorrect (status not in GROUP BY)
SELECT city, status, COUNT(*)
FROM users.csv
GROUP BY city
```

## HAVING

Filter groups after aggregation. Use HAVING with aggregate functions; use WHERE for row-level filtering.

### Basic HAVING

```sql
SELECT city, COUNT(*) AS count
FROM users.csv
GROUP BY city
HAVING COUNT(*) > 100
```

### HAVING vs WHERE

```sql
SELECT city, COUNT(*) AS count
FROM users.csv
WHERE status = 'active'      -- Filter rows BEFORE grouping
GROUP BY city
HAVING COUNT(*) > 10         -- Filter groups AFTER grouping
```

### Multiple HAVING Conditions

```sql
SELECT department, AVG(salary) AS avg_salary
FROM employees.csv
GROUP BY department
HAVING COUNT(*) >= 5
   AND AVG(salary) > 50000
```

### HAVING with Different Aggregates

```sql
SELECT category, SUM(sales) AS total_sales
FROM products.csv
GROUP BY category
HAVING COUNT(*) > 10
   AND AVG(price) > 50
ORDER BY total_sales DESC
```

## Combining Everything

A complete aggregation query:

```sql
SELECT
    category,
    COUNT(*) AS product_count,
    ROUND(AVG(price), 2) AS avg_price,
    SUM(quantity) AS total_stock,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products.csv
WHERE status = 'active'
GROUP BY category
HAVING COUNT(*) >= 5
   AND AVG(price) > 10
ORDER BY total_stock DESC
LIMIT 10
```

## Common Patterns

### Top N by Group

Find top items in each category:

```sql
SELECT category, product, sales
FROM (
    SELECT
        category,
        product,
        sales,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rn
    FROM products.csv
)
WHERE rn <= 3
```

### Percentage of Total

```sql
SELECT
    category,
    SUM(sales) AS category_sales,
    ROUND(SUM(sales) * 100.0 / (SELECT SUM(sales) FROM sales.csv), 2) AS pct
FROM sales.csv
GROUP BY category
ORDER BY pct DESC
```

### Running Totals (with Window Functions)

```sql
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions.csv
```

### Count with Conditions

```sql
SELECT
    department,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive
FROM employees.csv
GROUP BY department
```

### Pivot-Style Aggregation

```sql
SELECT
    product,
    SUM(CASE WHEN month = 'Jan' THEN sales ELSE 0 END) AS jan,
    SUM(CASE WHEN month = 'Feb' THEN sales ELSE 0 END) AS feb,
    SUM(CASE WHEN month = 'Mar' THEN sales ELSE 0 END) AS mar
FROM monthly_sales.csv
GROUP BY product
```

## Execution Order

Understanding execution order helps write correct queries:

1. **FROM** - Identify data source
2. **WHERE** - Filter rows
3. **GROUP BY** - Group rows
4. **HAVING** - Filter groups
5. **SELECT** - Compute output columns
6. **DISTINCT** - Remove duplicates
7. **ORDER BY** - Sort results
8. **LIMIT** - Restrict output rows

This is why:
- WHERE can't use aliases defined in SELECT
- HAVING can use aggregates, WHERE can't
- ORDER BY can use aliases from SELECT

## Best Practices

### 1. Always Use Aliases for Aggregates

```sql
-- Good
SELECT city, COUNT(*) AS count FROM users.csv GROUP BY city

-- Less clear
SELECT city, COUNT(*) FROM users.csv GROUP BY city
```

### 2. Use WHERE for Row Filtering, HAVING for Groups

```sql
-- Correct: filter rows, then groups
SELECT city, COUNT(*) AS count
FROM users.csv
WHERE status = 'active'
GROUP BY city
HAVING COUNT(*) > 10

-- Incorrect: using HAVING for row filtering (works but slower)
SELECT city, COUNT(*) AS count
FROM users.csv
GROUP BY city
HAVING status = 'active'  -- This won't work!
```

### 3. Consider Query Order for Performance

Filter as early as possible:

```sql
-- Better: filter before grouping
SELECT city, COUNT(*) FROM users.csv
WHERE created_date > '2024-01-01'
GROUP BY city

-- Worse: grouping all data, then filtering (if possible)
-- (actually this is how you'd have to do it with aggregates)
```

## Related Documentation

- [SQL Basics](/sql/basics) - SELECT, WHERE, LIMIT
- [Window Functions](/sql/window-functions) - Advanced aggregation
- [Aggregate Functions](/functions/aggregate) - Function reference
