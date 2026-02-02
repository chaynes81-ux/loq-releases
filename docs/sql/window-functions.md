# Window Functions

Window functions perform calculations across a set of rows related to the current row, without collapsing rows like GROUP BY.

## Syntax

```sql
function_name(args) OVER (
    [PARTITION BY column1, column2, ...]
    [ORDER BY column3 [ASC|DESC], ...]
)
```

## Window Function Categories

| Category | Functions | Description |
|----------|-----------|-------------|
| Ranking | ROW_NUMBER, RANK, DENSE_RANK | Assign ranks to rows |
| Aggregate | SUM, AVG, COUNT, MIN, MAX | Running calculations |
| Navigation | LAG, LEAD, FIRST_VALUE, LAST_VALUE | Access other rows |

## Ranking Functions

### ROW_NUMBER()

Assigns a unique sequential number to each row.

```sql
SELECT
    name,
    score,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num
FROM students.csv
```

**Result:**
```
name,score,row_num
Alice,95,1
Bob,90,2
Carol,90,3
David,85,4
```

Each row gets a unique number, even with ties.

### RANK()

Assigns rank with gaps for ties.

```sql
SELECT
    name,
    score,
    RANK() OVER (ORDER BY score DESC) AS rank
FROM students.csv
```

**Result:**
```
name,score,rank
Alice,95,1
Bob,90,2
Carol,90,2
David,85,4
```

Bob and Carol tie at rank 2; David is rank 4 (rank 3 is skipped).

### DENSE_RANK()

Assigns rank without gaps for ties.

```sql
SELECT
    name,
    score,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM students.csv
```

**Result:**
```
name,score,dense_rank
Alice,95,1
Bob,90,2
Carol,90,2
David,85,3
```

Bob and Carol tie at rank 2; David is rank 3 (no gap).

### Comparison

```sql
SELECT
    name,
    score,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,
    RANK() OVER (ORDER BY score DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM students.csv
```

| name | score | row_num | rank | dense_rank |
|------|-------|---------|------|------------|
| Alice | 95 | 1 | 1 | 1 |
| Bob | 90 | 2 | 2 | 2 |
| Carol | 90 | 3 | 2 | 2 |
| David | 85 | 4 | 4 | 3 |

## PARTITION BY

Divide rows into groups for independent calculations.

### Ranking Within Groups

```sql
SELECT
    department,
    name,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees.csv
```

**Result:**
```
department,name,salary,dept_rank
Engineering,Alice,120000,1
Engineering,Bob,100000,2
Marketing,Carol,90000,1
Marketing,David,85000,2
```

Each department has its own ranking.

### Multiple Partitions

```sql
SELECT
    region,
    department,
    name,
    sales,
    ROW_NUMBER() OVER (
        PARTITION BY region, department
        ORDER BY sales DESC
    ) AS rank_in_dept
FROM sales_reps.csv
```

## Aggregate Window Functions

Apply aggregate functions without collapsing rows.

### Running Total

```sql
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions.csv
```

**Result:**
```
date,amount,running_total
2024-01-01,100,100
2024-01-02,150,250
2024-01-03,75,325
```

### Partition Total

```sql
SELECT
    department,
    name,
    salary,
    SUM(salary) OVER (PARTITION BY department) AS dept_total
FROM employees.csv
```

Each row shows its department's total salary.

### Running Average

```sql
SELECT
    date,
    temperature,
    AVG(temperature) OVER (ORDER BY date) AS running_avg
FROM weather.csv
```

### Count Within Partition

```sql
SELECT
    department,
    name,
    COUNT(*) OVER (PARTITION BY department) AS dept_size
FROM employees.csv
```

### MIN/MAX Within Partition

```sql
SELECT
    department,
    name,
    salary,
    MIN(salary) OVER (PARTITION BY department) AS dept_min,
    MAX(salary) OVER (PARTITION BY department) AS dept_max
FROM employees.csv
```

## Navigation Functions

Access values from other rows.

### LAG()

Access previous row's value.

```sql
LAG(column, offset, default) OVER (...)
```

- `column`: Column to retrieve
- `offset`: Number of rows back (default: 1)
- `default`: Value if no previous row exists

```sql
SELECT
    date,
    price,
    LAG(price, 1, 0) OVER (ORDER BY date) AS prev_price,
    price - LAG(price, 1, price) OVER (ORDER BY date) AS price_change
FROM stock_prices.csv
```

**Result:**
```
date,price,prev_price,price_change
2024-01-01,100,0,100
2024-01-02,105,100,5
2024-01-03,103,105,-2
```

### LEAD()

Access next row's value.

```sql
LEAD(column, offset, default) OVER (...)
```

```sql
SELECT
    date,
    price,
    LEAD(price, 1, 0) OVER (ORDER BY date) AS next_price
FROM stock_prices.csv
```

**Result:**
```
date,price,next_price
2024-01-01,100,105
2024-01-02,105,103
2024-01-03,103,0
```

### FIRST_VALUE()

Get first value in the partition/window.

```sql
SELECT
    name,
    salary,
    FIRST_VALUE(name) OVER (ORDER BY salary DESC) AS highest_earner
FROM employees.csv
```

### LAST_VALUE()

Get last value in the partition/window.

```sql
SELECT
    name,
    salary,
    LAST_VALUE(name) OVER (ORDER BY salary DESC) AS lowest_earner
FROM employees.csv
```

## Common Patterns

### Top N Per Group

```sql
SELECT * FROM (
    SELECT
        department,
        name,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees.csv
) ranked
WHERE rn <= 3
```

### Percent of Total

```sql
SELECT
    department,
    name,
    salary,
    ROUND(100.0 * salary / SUM(salary) OVER (), 2) AS pct_of_total,
    ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY department), 2) AS pct_of_dept
FROM employees.csv
```

### Moving Average

```sql
-- 7-day moving average
SELECT
    date,
    value,
    AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7
FROM metrics.csv
```

### Year-over-Year Comparison

```sql
SELECT
    month,
    year,
    sales,
    LAG(sales, 12) OVER (ORDER BY year, month) AS sales_last_year,
    sales - LAG(sales, 12) OVER (ORDER BY year, month) AS yoy_change
FROM monthly_sales.csv
```

### Cumulative Distribution

```sql
SELECT
    name,
    score,
    ROUND(100.0 * ROW_NUMBER() OVER (ORDER BY score) / COUNT(*) OVER (), 2) AS percentile
FROM students.csv
```

### Gap Detection

```sql
SELECT
    id,
    value,
    id - LAG(id, 1, id) OVER (ORDER BY id) AS gap
FROM sequence.csv
WHERE id - LAG(id, 1, id) OVER (ORDER BY id) > 1
```

### Running Difference

```sql
SELECT
    date,
    balance,
    balance - LAG(balance, 1, balance) OVER (ORDER BY date) AS daily_change
FROM account.csv
```

## Window Function vs GROUP BY

| Feature | Window Function | GROUP BY |
|---------|-----------------|----------|
| Rows returned | All rows preserved | One row per group |
| Access to detail | Yes | Only aggregated values |
| Multiple aggregations | Same row can show multiple | Requires separate queries |

**GROUP BY** (collapses rows):
```sql
SELECT department, AVG(salary) FROM employees.csv GROUP BY department
```

**Window Function** (preserves rows):
```sql
SELECT name, department, salary,
       AVG(salary) OVER (PARTITION BY department) AS dept_avg
FROM employees.csv
```

## Performance Considerations

### 1. Index-Friendly ORDER BY

Order by indexed columns when possible:

```sql
ROW_NUMBER() OVER (ORDER BY id)  -- Faster if id is indexed
```

### 2. Minimize Partitions

Fewer partitions = faster computation:

```sql
-- More efficient (fewer partitions)
OVER (PARTITION BY department ORDER BY date)

-- Less efficient (many partitions)
OVER (PARTITION BY department, team, project ORDER BY date)
```

### 3. Use LIMIT with Subqueries

```sql
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn
    FROM large_table.csv
) WHERE rn <= 10
```

## Related Documentation

- [SQL Overview](/sql/) - General SQL reference
- [Aggregation](/sql/aggregation) - GROUP BY and aggregates
- [Aggregate Functions](/functions/aggregate) - Function reference
