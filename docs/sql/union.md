# UNION / UNION ALL

UNION combines the results of two or more SELECT statements into a single result set.

## Syntax

```sql
SELECT columns FROM table1
UNION [ALL]
SELECT columns FROM table2
[ORDER BY column]
[LIMIT n]
```

## UNION vs UNION ALL

| Feature | UNION | UNION ALL |
|---------|-------|-----------|
| Duplicates | Removes duplicates | Keeps all rows |
| Performance | Slower (deduplication) | Faster |
| Use when | Need unique rows | Want all rows |

## Basic UNION

Combine results and remove duplicates:

```sql
SELECT city FROM customers.csv
UNION
SELECT city FROM suppliers.csv
```

**customers.csv:**
```
name,city
Alice,New York
Bob,Chicago
```

**suppliers.csv:**
```
name,city
Acme,Chicago
Best,Boston
```

**Result:**
```
city
New York
Chicago
Boston
```

Chicago appears once (deduplicated).

## UNION ALL

Keep all rows including duplicates:

```sql
SELECT city FROM customers.csv
UNION ALL
SELECT city FROM suppliers.csv
```

**Result:**
```
city
New York
Chicago
Chicago
Boston
```

Chicago appears twice (from both tables).

## Column Requirements

UNION requires:
1. Same number of columns in each SELECT
2. Compatible data types in corresponding columns

```sql
-- Correct: same number and types
SELECT name, age FROM employees.csv
UNION
SELECT name, years FROM contractors.csv

-- Incorrect: different column counts
SELECT name, age, city FROM employees.csv
UNION
SELECT name, age FROM contractors.csv  -- ERROR
```

### Column Names

The result uses column names from the first SELECT:

```sql
SELECT name AS person, city AS location FROM employees.csv
UNION
SELECT company, headquarters FROM companies.csv
```

**Result columns:** `person`, `location` (from first SELECT)

## Multiple UNIONs

Chain multiple UNION operations:

```sql
SELECT name, 'Customer' AS type FROM customers.csv
UNION ALL
SELECT name, 'Supplier' AS type FROM suppliers.csv
UNION ALL
SELECT name, 'Partner' AS type FROM partners.csv
```

## UNION with ORDER BY

ORDER BY applies to the final combined result:

```sql
SELECT name, sales FROM q1_sales.csv
UNION ALL
SELECT name, sales FROM q2_sales.csv
ORDER BY sales DESC
```

::: tip
ORDER BY must come after all UNION operations. It sorts the final result, not individual SELECTs.
:::

## UNION with LIMIT

LIMIT on the final result:

```sql
SELECT name, sales FROM region1.csv
UNION ALL
SELECT name, sales FROM region2.csv
ORDER BY sales DESC
LIMIT 10
```

This returns the top 10 from the combined data.

### LIMIT on Individual SELECTs

Use parentheses to limit individual queries:

```sql
(SELECT name, sales FROM region1.csv ORDER BY sales DESC LIMIT 5)
UNION ALL
(SELECT name, sales FROM region2.csv ORDER BY sales DESC LIMIT 5)
```

This returns top 5 from each region.

## UNION with GROUP BY

GROUP BY applies to individual SELECTs:

```sql
SELECT region, SUM(sales) AS total FROM q1_sales.csv GROUP BY region
UNION ALL
SELECT region, SUM(sales) AS total FROM q2_sales.csv GROUP BY region
```

To aggregate the combined result, use a subquery:

```sql
SELECT region, SUM(total) AS annual_total
FROM (
    SELECT region, SUM(sales) AS total FROM q1_sales.csv GROUP BY region
    UNION ALL
    SELECT region, SUM(sales) AS total FROM q2_sales.csv GROUP BY region
) quarterly
GROUP BY region
```

## Common Patterns

### Combine Log Files

```sql
SELECT * FROM access_2024_01.log
UNION ALL
SELECT * FROM access_2024_02.log
UNION ALL
SELECT * FROM access_2024_03.log
```

### Add Type Indicator

```sql
SELECT 'Error' AS level, message, timestamp FROM errors.log
UNION ALL
SELECT 'Warning' AS level, message, timestamp FROM warnings.log
UNION ALL
SELECT 'Info' AS level, message, timestamp FROM info.log
ORDER BY timestamp DESC
```

### Combine with Filtering

```sql
SELECT name, amount, 'Credit' AS type
FROM credits.csv
WHERE amount > 100
UNION ALL
SELECT name, amount, 'Debit' AS type
FROM debits.csv
WHERE amount > 100
ORDER BY amount DESC
```

### Compare Data Sets

Find items in one set but not another:

```sql
-- Items in A but not in B
SELECT id FROM set_a.csv
WHERE id NOT IN (SELECT id FROM set_b.csv)

-- Or using UNION to see differences
SELECT id, 'Only in A' AS source FROM set_a.csv
WHERE id NOT IN (SELECT id FROM set_b.csv)
UNION ALL
SELECT id, 'Only in B' AS source FROM set_b.csv
WHERE id NOT IN (SELECT id FROM set_a.csv)
```

### Pivot Data

Transform rows to columns:

```sql
SELECT product, 'Q1' AS quarter, q1_sales AS sales FROM annual_sales.csv
UNION ALL
SELECT product, 'Q2' AS quarter, q2_sales AS sales FROM annual_sales.csv
UNION ALL
SELECT product, 'Q3' AS quarter, q3_sales AS sales FROM annual_sales.csv
UNION ALL
SELECT product, 'Q4' AS quarter, q4_sales AS sales FROM annual_sales.csv
ORDER BY product, quarter
```

### Aggregate Across Files

```sql
SELECT
    'January' AS month,
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM jan_orders.csv

UNION ALL

SELECT
    'February' AS month,
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM feb_orders.csv

ORDER BY month
```

## Performance Considerations

### Use UNION ALL When Possible

If you don't need deduplication, UNION ALL is faster:

```sql
-- Slower: checks for duplicates
SELECT * FROM file1.csv UNION SELECT * FROM file2.csv

-- Faster: no deduplication
SELECT * FROM file1.csv UNION ALL SELECT * FROM file2.csv
```

### Filter Before UNION

Reduce data early:

```sql
-- Better: filter first
SELECT * FROM file1.csv WHERE status = 'active'
UNION ALL
SELECT * FROM file2.csv WHERE status = 'active'

-- Slower: union all, then filter
SELECT * FROM (
    SELECT * FROM file1.csv
    UNION ALL
    SELECT * FROM file2.csv
) WHERE status = 'active'
```

### Limit Early When Possible

```sql
-- If you only need top 10 overall
(SELECT * FROM file1.csv ORDER BY score DESC LIMIT 10)
UNION ALL
(SELECT * FROM file2.csv ORDER BY score DESC LIMIT 10)
ORDER BY score DESC
LIMIT 10
```

## Differences from Other Databases

loq's UNION implementation follows standard SQL:

| Feature | loq | Standard SQL |
|---------|-----------|--------------|
| UNION | Yes | Yes |
| UNION ALL | Yes | Yes |
| ORDER BY on result | Yes | Yes |
| LIMIT on result | Yes | Yes |
| Parentheses for subqueries | Yes | Yes |

## Related Documentation

- [SQL Overview](/sql/) - General SQL reference
- [Subqueries](/sql/subqueries) - Subquery syntax
- [Aggregation](/sql/aggregation) - GROUP BY and aggregates
