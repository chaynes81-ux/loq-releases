# Subqueries

Subqueries (nested queries) allow you to use the result of one query within another query.

## Types of Subqueries

loq supports three types of subqueries:

| Type | Returns | Used In |
|------|---------|---------|
| Scalar | Single value | SELECT, WHERE |
| IN | List of values | WHERE IN (...) |
| EXISTS | Boolean | WHERE EXISTS (...) |

## Scalar Subqueries

A scalar subquery returns a single value.

### In WHERE Clause

Compare against a calculated value:

```sql
-- Employees earning above average
SELECT name, salary
FROM employees.csv
WHERE salary > (SELECT AVG(salary) FROM employees.csv)
```

### In SELECT Clause

Include a calculated value in output:

```sql
SELECT
    name,
    salary,
    salary - (SELECT AVG(salary) FROM employees.csv) AS diff_from_avg
FROM employees.csv
```

### With Aggregate Functions

```sql
-- Find the highest earner
SELECT name, salary
FROM employees.csv
WHERE salary = (SELECT MAX(salary) FROM employees.csv)

-- Orders from the most recent date
SELECT *
FROM orders.csv
WHERE order_date = (SELECT MAX(order_date) FROM orders.csv)
```

## IN Subqueries

Check if a value exists in a list returned by a subquery.

### Basic IN

```sql
-- Users who have placed orders
SELECT name
FROM users.csv
WHERE id IN (SELECT user_id FROM orders.csv)
```

### NOT IN

```sql
-- Users who have never ordered
SELECT name
FROM users.csv
WHERE id NOT IN (SELECT user_id FROM orders.csv)
```

### IN with Conditions

```sql
-- Users with high-value orders
SELECT name
FROM users.csv
WHERE id IN (
    SELECT user_id
    FROM orders.csv
    WHERE total > 1000
)
```

### Multiple Columns (Implicit)

When checking multiple conditions:

```sql
SELECT *
FROM inventory.csv
WHERE product_id IN (
    SELECT product_id
    FROM orders.csv
    WHERE order_date > '2024-01-01'
)
```

## EXISTS Subqueries

EXISTS returns true if the subquery returns any rows.

### Basic EXISTS

```sql
-- Users who have at least one order
SELECT name
FROM users.csv u
WHERE EXISTS (
    SELECT 1
    FROM orders.csv o
    WHERE o.user_id = u.id
)
```

### NOT EXISTS

```sql
-- Users with no orders
SELECT name
FROM users.csv u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders.csv o
    WHERE o.user_id = u.id
)
```

### Correlated Subquery

EXISTS often uses correlated subqueries that reference the outer query:

```sql
-- Products that have been ordered
SELECT product_name
FROM products.csv p
WHERE EXISTS (
    SELECT 1
    FROM order_items.csv oi
    WHERE oi.product_id = p.id
)
```

## EXISTS vs IN

Both can achieve similar results, but have different characteristics:

```sql
-- Using IN
SELECT name FROM users.csv
WHERE id IN (SELECT user_id FROM orders.csv)

-- Using EXISTS
SELECT name FROM users.csv u
WHERE EXISTS (SELECT 1 FROM orders.csv o WHERE o.user_id = u.id)
```

| Feature | IN | EXISTS |
|---------|---|--------|
| NULL handling | Issues with NULLs in subquery | No NULL issues |
| Performance | Executes subquery once | May execute per row |
| Use when | Small subquery result | Large subquery, indexed |

## Correlated Subqueries

A correlated subquery references columns from the outer query and executes once per outer row.

### Example

```sql
-- Employees earning more than their department average
SELECT e.name, e.salary, e.department
FROM employees.csv e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees.csv e2
    WHERE e2.department = e.department
)
```

### Finding Related Maximums

```sql
-- Most recent order for each user
SELECT u.name, o.order_date, o.total
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
WHERE o.order_date = (
    SELECT MAX(o2.order_date)
    FROM orders.csv o2
    WHERE o2.user_id = u.id
)
```

## Subqueries in FROM (Derived Tables)

Use a subquery as a data source:

```sql
SELECT dept, avg_salary
FROM (
    SELECT department AS dept, AVG(salary) AS avg_salary
    FROM employees.csv
    GROUP BY department
) dept_stats
WHERE avg_salary > 50000
```

### Joining Derived Tables

```sql
SELECT u.name, stats.order_count, stats.total_spent
FROM users.csv u
INNER JOIN (
    SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
    FROM orders.csv
    GROUP BY user_id
) stats ON u.id = stats.user_id
```

## Common Patterns

### Find Duplicates

```sql
SELECT *
FROM users.csv u
WHERE id IN (
    SELECT id
    FROM users.csv
    GROUP BY email
    HAVING COUNT(*) > 1
)
```

### Find Records Without Matches

```sql
-- Products never ordered
SELECT product_name
FROM products.csv
WHERE id NOT IN (SELECT DISTINCT product_id FROM order_items.csv)
```

### Compare to Group Statistics

```sql
-- Above-average performers per department
SELECT name, department, sales
FROM employees.csv e
WHERE sales > (
    SELECT AVG(sales)
    FROM employees.csv e2
    WHERE e2.department = e.department
)
```

### Top N Per Group

```sql
-- Top 3 orders per user
SELECT u.name, o.order_id, o.total
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
WHERE o.order_id IN (
    SELECT order_id
    FROM (
        SELECT order_id, user_id,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) as rn
        FROM orders.csv
    )
    WHERE rn <= 3 AND user_id = u.id
)
```

### Conditional Aggregation

```sql
SELECT
    product_name,
    (SELECT COUNT(*) FROM orders.csv WHERE product_id = p.id) AS order_count,
    (SELECT SUM(quantity) FROM orders.csv WHERE product_id = p.id) AS total_quantity
FROM products.csv p
```

## Nested Subqueries

Subqueries can be nested multiple levels:

```sql
SELECT name
FROM users.csv
WHERE id IN (
    SELECT user_id
    FROM orders.csv
    WHERE product_id IN (
        SELECT id
        FROM products.csv
        WHERE category = 'Electronics'
    )
)
```

## Performance Considerations

### 1. Prefer JOINs for Simple Cases

```sql
-- Subquery (may be slower)
SELECT name FROM users.csv
WHERE id IN (SELECT user_id FROM orders.csv)

-- JOIN (often faster)
SELECT DISTINCT u.name
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
```

### 2. Use EXISTS for Existence Checks

```sql
-- Better for checking existence
SELECT name FROM users.csv u
WHERE EXISTS (SELECT 1 FROM orders.csv o WHERE o.user_id = u.id)

-- IN loads all matching IDs into memory
SELECT name FROM users.csv
WHERE id IN (SELECT user_id FROM orders.csv)
```

### 3. Limit Subquery Results When Possible

```sql
-- If you only need to check existence
WHERE id IN (SELECT user_id FROM orders.csv LIMIT 1000)
```

### 4. Use Derived Tables to Reduce Data Early

```sql
-- Filter in subquery first
SELECT u.name, s.total
FROM users.csv u
INNER JOIN (
    SELECT user_id, SUM(amount) AS total
    FROM orders.csv
    WHERE status = 'completed'
    GROUP BY user_id
) s ON u.id = s.user_id
```

## Related Documentation

- [SQL Overview](/sql/) - General SQL reference
- [JOINs](/sql/joins) - JOIN operations
- [Window Functions](/sql/window-functions) - Alternative to some subqueries
