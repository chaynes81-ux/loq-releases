# SQL Reference

loq implements a comprehensive SQL engine for querying structured and semi-structured data.

## SQL Syntax Overview

```sql
SELECT [DISTINCT] columns
FROM 'filename' [alias]
[JOIN 'file2' ON condition]
[WHERE conditions]
[GROUP BY columns]
[HAVING aggregate_conditions]
[ORDER BY columns [ASC|DESC]]
[LIMIT n]
```

## Supported Features

### Basic Queries

| Feature | Example |
|---------|---------|
| Select all | `SELECT * FROM file.csv` |
| Select columns | `SELECT name, age FROM file.csv` |
| Column aliases | `SELECT name AS n, age AS a FROM file.csv` |
| Expressions | `SELECT name, age * 2 AS double_age FROM file.csv` |
| DISTINCT | `SELECT DISTINCT city FROM file.csv` |

### Filtering

| Feature | Example |
|---------|---------|
| WHERE | `WHERE age > 30` |
| AND/OR | `WHERE age > 30 AND city = 'NYC'` |
| BETWEEN | `WHERE age BETWEEN 20 AND 40` |
| IN | `WHERE city IN ('NYC', 'LA', 'Chicago')` |
| LIKE | `WHERE name LIKE 'J%'` |
| IS NULL | `WHERE email IS NOT NULL` |

### Aggregation

| Feature | Example |
|---------|---------|
| COUNT | `SELECT COUNT(*) FROM file.csv` |
| SUM/AVG | `SELECT SUM(amount), AVG(amount) FROM file.csv` |
| MIN/MAX | `SELECT MIN(date), MAX(date) FROM file.csv` |
| GROUP BY | `SELECT city, COUNT(*) FROM file.csv GROUP BY city` |
| HAVING | `GROUP BY city HAVING COUNT(*) > 5` |

### Sorting and Limiting

| Feature | Example |
|---------|---------|
| ORDER BY | `ORDER BY name ASC` |
| Multiple columns | `ORDER BY city, name DESC` |
| LIMIT | `LIMIT 10` |

### Advanced Features

| Feature | Documentation |
|---------|---------------|
| JOINs | [JOIN Documentation](/sql/joins) |
| UNION | [UNION Documentation](/sql/union) |
| Subqueries | [Subquery Documentation](/sql/subqueries) |
| Window Functions | [Window Functions](/sql/window-functions) |
| CASE WHEN | [CASE WHEN Documentation](/sql/case-when) |
| CTEs (WITH clause) | [CTE Documentation](/sql/cte) |

## Quick Reference

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal | `WHERE status = 'active'` |
| `!=`, `<>` | Not equal | `WHERE status != 'deleted'` |
| `<`, `>` | Less/greater than | `WHERE age > 21` |
| `<=`, `>=` | Less/greater or equal | `WHERE price <= 100` |
| `AND` | Logical AND | `WHERE a > 1 AND b < 5` |
| `OR` | Logical OR | `WHERE a = 1 OR b = 2` |
| `NOT` | Logical NOT | `WHERE NOT deleted` |
| `BETWEEN` | Range check | `WHERE age BETWEEN 18 AND 65` |
| `IN` | Value in list | `WHERE city IN ('A', 'B')` |
| `LIKE` | Pattern match | `WHERE name LIKE '%son'` |
| `IS NULL` | NULL check | `WHERE email IS NULL` |

### LIKE Patterns

| Pattern | Matches |
|---------|---------|
| `%` | Any sequence of characters |
| `_` | Any single character |
| `%abc` | Ends with "abc" |
| `abc%` | Starts with "abc" |
| `%abc%` | Contains "abc" |
| `a_c` | "a" + any char + "c" |

### Aggregate Functions

| Function | Description |
|----------|-------------|
| `COUNT(*)` | Count all rows |
| `COUNT(col)` | Count non-NULL values |
| `SUM(col)` | Sum of values |
| `AVG(col)` | Average of values |
| `MIN(col)` | Minimum value |
| `MAX(col)` | Maximum value |
| `GROUP_CONCAT(col)` | Concatenate values |

## Examples by Category

### Data Exploration

```sql
-- Preview data
SELECT * FROM data.csv LIMIT 10

-- Count records
SELECT COUNT(*) as total FROM data.csv

-- Unique values
SELECT DISTINCT category FROM products.csv

-- Value distribution
SELECT category, COUNT(*) as count
FROM products.csv
GROUP BY category
ORDER BY count DESC
```

### Filtering Records

```sql
-- Simple filter
SELECT * FROM users.csv WHERE age >= 18

-- Multiple conditions
SELECT * FROM orders.csv
WHERE status = 'completed'
  AND total > 100
  AND created_date > '2024-01-01'

-- Pattern matching
SELECT * FROM logs.csv
WHERE message LIKE '%error%'
  OR message LIKE '%warning%'
```

### Aggregation

```sql
-- Summary statistics
SELECT
    COUNT(*) as total,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount
FROM sales.csv

-- Group by with filtering
SELECT department, AVG(salary) as avg_salary
FROM employees.csv
GROUP BY department
HAVING AVG(salary) > 50000
ORDER BY avg_salary DESC
```

### Data Transformation

```sql
-- String manipulation
SELECT
    UPPER(name) as name,
    LOWER(email) as email,
    CONCAT(first_name, ' ', last_name) as full_name
FROM users.csv

-- Calculations
SELECT
    product,
    price,
    quantity,
    price * quantity as total,
    ROUND(price * quantity * 0.08, 2) as tax
FROM orders.csv

-- Conditional logic
SELECT
    name,
    score,
    CASE
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        ELSE 'F'
    END as grade
FROM students.csv
```

## Related Documentation

- [SQL Basics](/sql/basics) - SELECT, WHERE, LIMIT
- [Aggregation](/sql/aggregation) - GROUP BY, HAVING, ORDER BY
- [JOINs](/sql/joins) - INNER, LEFT, CROSS joins
- [UNION](/sql/union) - Combining query results
- [Subqueries](/sql/subqueries) - Nested queries
- [CASE WHEN](/sql/case-when) - Conditional expressions
- [Window Functions](/sql/window-functions) - Advanced analytics
- [CTEs](/sql/cte) - Common Table Expressions (WITH clause)
- [Functions Reference](/functions/) - All built-in functions
