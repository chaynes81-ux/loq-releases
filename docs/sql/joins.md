# JOINs

loq supports joining data from multiple files using INNER JOIN, LEFT JOIN, and CROSS JOIN.

## JOIN Syntax

```sql
SELECT columns
FROM 'file1' [alias1]
[INNER|LEFT|CROSS] JOIN 'file2' [alias2] ON condition
[WHERE conditions]
```

## INNER JOIN

Returns rows that have matching values in both tables.

### Basic INNER JOIN

```sql
SELECT u.name, o.product, o.amount
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
```

Only rows where `users.id` matches `orders.user_id` are returned.

### Example

**users.csv:**
```
id,name
1,Alice
2,Bob
3,Carol
```

**orders.csv:**
```
order_id,user_id,product,amount
101,1,Widget,50
102,1,Gadget,75
103,2,Widget,30
```

**Query:**
```sql
SELECT u.name, o.product, o.amount
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
```

**Result:**
```
name,product,amount
Alice,Widget,50
Alice,Gadget,75
Bob,Widget,30
```

Carol has no orders, so she doesn't appear in the result.

### JOIN Without INNER Keyword

The `INNER` keyword is optional:

```sql
-- These are equivalent
SELECT * FROM users.csv u JOIN orders.csv o ON u.id = o.user_id
SELECT * FROM users.csv u INNER JOIN orders.csv o ON u.id = o.user_id
```

## LEFT JOIN

Returns all rows from the left table and matching rows from the right table. If no match, NULL values are returned for right table columns.

### Basic LEFT JOIN

```sql
SELECT u.name, o.product, o.amount
FROM users.csv u
LEFT JOIN orders.csv o ON u.id = o.user_id
```

### Example

Using the same tables:

```sql
SELECT u.name, COALESCE(o.product, 'No orders') AS product
FROM users.csv u
LEFT JOIN orders.csv o ON u.id = o.user_id
```

**Result:**
```
name,product
Alice,Widget
Alice,Gadget
Bob,Widget
Carol,No orders
```

Carol appears with NULL values (or 'No orders' via COALESCE) because she has no matching orders.

### Find Rows Without Matches

Use LEFT JOIN with NULL check:

```sql
-- Users who have never ordered
SELECT u.name
FROM users.csv u
LEFT JOIN orders.csv o ON u.id = o.user_id
WHERE o.order_id IS NULL
```

## CROSS JOIN

Returns the Cartesian product of both tables (every combination).

### Basic CROSS JOIN

```sql
SELECT p.product, c.color
FROM products.csv p
CROSS JOIN colors.csv c
```

### Example

**products.csv:**
```
product
Shirt
Pants
```

**colors.csv:**
```
color
Red
Blue
```

**Query:**
```sql
SELECT p.product, c.color
FROM products.csv p
CROSS JOIN colors.csv c
```

**Result:**
```
product,color
Shirt,Red
Shirt,Blue
Pants,Red
Pants,Blue
```

::: warning
CROSS JOIN can produce large results. For tables with M and N rows, the result has M × N rows.
:::

### Limit CROSS JOIN Results

```sql
SELECT * FROM table1.csv
CROSS JOIN table2.csv
LIMIT 100
```

## Multiple JOINs

Join more than two tables:

```sql
SELECT
    u.name,
    o.order_id,
    p.product_name,
    p.price
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
INNER JOIN products.csv p ON o.product_id = p.id
```

### Mixed JOIN Types

```sql
SELECT
    u.name,
    o.order_id,
    COALESCE(a.street, 'No address') AS address
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
LEFT JOIN addresses.csv a ON u.id = a.user_id
```

## JOIN Conditions

### Simple Equality

```sql
ON u.id = o.user_id
```

### Multiple Conditions

```sql
ON u.id = o.user_id AND u.region = o.region
```

### Non-Equality Conditions

```sql
-- Orders within a date range per user
SELECT u.name, o.order_date
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
    AND o.order_date >= u.signup_date
```

## Table Aliases

Aliases are essential for JOINs:

```sql
-- With aliases (recommended)
SELECT u.name, o.total
FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id

-- Without aliases (verbose)
SELECT users.name, orders.total
FROM users.csv users
INNER JOIN orders.csv orders ON users.id = orders.user_id
```

### Resolving Ambiguous Columns

When both tables have a column with the same name, use aliases:

```sql
-- Ambiguous: which 'id' column?
SELECT id FROM users.csv u JOIN orders.csv o ON u.id = o.user_id  -- ERROR

-- Clear: specify the table
SELECT u.id, o.id AS order_id
FROM users.csv u
JOIN orders.csv o ON u.id = o.user_id
```

## Self JOIN

Join a table to itself:

```sql
-- Find employees and their managers
SELECT
    e.name AS employee,
    m.name AS manager
FROM employees.csv e
LEFT JOIN employees.csv m ON e.manager_id = m.id
```

## JOIN with Aggregation

Combine JOINs with GROUP BY:

```sql
SELECT
    u.name,
    COUNT(o.order_id) AS order_count,
    SUM(o.amount) AS total_spent
FROM users.csv u
LEFT JOIN orders.csv o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY total_spent DESC
```

## JOIN with Subqueries

Join with a subquery result:

```sql
SELECT u.name, recent.last_order
FROM users.csv u
INNER JOIN (
    SELECT user_id, MAX(order_date) AS last_order
    FROM orders.csv
    GROUP BY user_id
) recent ON u.id = recent.user_id
```

## Common Patterns

### Find Matching Records

```sql
SELECT * FROM table1.csv t1
INNER JOIN table2.csv t2 ON t1.key = t2.key
```

### Find Records Without Matches

```sql
SELECT t1.* FROM table1.csv t1
LEFT JOIN table2.csv t2 ON t1.key = t2.key
WHERE t2.key IS NULL
```

### Find Records in Both Tables

```sql
SELECT DISTINCT t1.key FROM table1.csv t1
INNER JOIN table2.csv t2 ON t1.key = t2.key
```

### Combine with Aggregates

```sql
SELECT
    d.dept_name,
    COUNT(e.id) AS employee_count,
    AVG(e.salary) AS avg_salary
FROM departments.csv d
LEFT JOIN employees.csv e ON d.id = e.dept_id
GROUP BY d.id, d.dept_name
```

## Performance Tips

### 1. Smaller Table First

Put the smaller table first in the FROM clause:

```sql
-- If users is smaller than orders
SELECT * FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
```

### 2. Filter Early

Apply WHERE conditions to reduce data before joining:

```sql
-- Filter users before joining
SELECT u.name, o.product
FROM (SELECT * FROM users.csv WHERE status = 'active') u
INNER JOIN orders.csv o ON u.id = o.user_id
```

### 3. Avoid CROSS JOIN on Large Tables

```sql
-- This could be huge!
-- 1000 rows × 1000 rows = 1,000,000 rows
SELECT * FROM large1.csv CROSS JOIN large2.csv
```

### 4. Use LIMIT with Complex JOINs

```sql
SELECT * FROM users.csv u
INNER JOIN orders.csv o ON u.id = o.user_id
INNER JOIN products.csv p ON o.product_id = p.id
LIMIT 1000
```

## Related Documentation

- [SQL Basics](/sql/basics) - SELECT, WHERE, LIMIT
- [Aggregation](/sql/aggregation) - GROUP BY with JOINs
- [Subqueries](/sql/subqueries) - Subqueries in JOINs
