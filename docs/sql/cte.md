# Common Table Expressions (WITH Clause)

Common Table Expressions (CTEs) allow you to define temporary named result sets that can be referenced within a query. CTEs make complex queries more readable and maintainable by breaking them into logical building blocks.

::: tip Extension Beyond MS Log Parser
CTEs are a loq extension not available in Microsoft Log Parser 2.2. This feature brings modern SQL capabilities to log analysis.
:::

## Syntax

### Basic CTE

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
    cte2 AS (SELECT ...)
SELECT ... FROM cte1, cte2
```

### CTEs Referencing Other CTEs

```sql
WITH
    base AS (SELECT ...),
    derived AS (SELECT ... FROM base)
SELECT ... FROM derived
```

## Simple CTE

A basic CTE to simplify a query.

### Basic Example

```sql
WITH active_users AS (
    SELECT id, name, email
    FROM users.csv
    WHERE status = 'active'
)
SELECT name, email
FROM active_users
ORDER BY name
```

This is equivalent to:

```sql
SELECT name, email
FROM users.csv
WHERE status = 'active'
ORDER BY name
```

### Filtering with CTE

```sql
WITH high_value_orders AS (
    SELECT *
    FROM orders.csv
    WHERE total > 1000
)
SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS total_spent
FROM high_value_orders
GROUP BY customer_id
```

### CTE with Column Aliases

```sql
WITH sales_summary (region, total_sales, order_count) AS (
    SELECT region, SUM(amount), COUNT(*)
    FROM sales.csv
    GROUP BY region
)
SELECT region, total_sales, order_count
FROM sales_summary
WHERE total_sales > 10000
```

## CTE with Aggregation

CTEs are particularly useful for pre-computing aggregates.

### Computing Averages

```sql
WITH dept_stats AS (
    SELECT
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS emp_count
    FROM employees.csv
    GROUP BY department
)
SELECT department, avg_salary, emp_count
FROM dept_stats
WHERE avg_salary > 50000
ORDER BY avg_salary DESC
```

### Comparing to Aggregates

Find employees earning above their department average:

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

### Summary Statistics

```sql
WITH monthly_totals AS (
    SELECT
        EXTRACT('month', order_date) AS month,
        SUM(total) AS revenue,
        COUNT(*) AS orders
    FROM orders.csv
    GROUP BY EXTRACT('month', order_date)
)
SELECT
    month,
    revenue,
    orders,
    ROUND(revenue / orders, 2) AS avg_order_value
FROM monthly_totals
ORDER BY month
```

## Multiple CTEs

Define several CTEs to build up complex logic step by step.

### Basic Multiple CTEs

```sql
WITH
    customers AS (
        SELECT id, name, region
        FROM customers.csv
        WHERE status = 'active'
    ),
    orders AS (
        SELECT customer_id, SUM(total) AS total_spent
        FROM orders.csv
        GROUP BY customer_id
    )
SELECT c.name, c.region, o.total_spent
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
ORDER BY o.total_spent DESC
```

### Combining Aggregates

```sql
WITH
    product_sales AS (
        SELECT product_id, SUM(quantity) AS units_sold, SUM(amount) AS revenue
        FROM order_items.csv
        GROUP BY product_id
    ),
    product_info AS (
        SELECT id, name, category, cost
        FROM products.csv
    )
SELECT
    p.name,
    p.category,
    s.units_sold,
    s.revenue,
    s.revenue - (s.units_sold * p.cost) AS profit
FROM product_info p
INNER JOIN product_sales s ON p.id = s.product_id
ORDER BY profit DESC
```

### Filtering at Multiple Stages

```sql
WITH
    recent_orders AS (
        SELECT *
        FROM orders.csv
        WHERE order_date >= '2024-01-01'
    ),
    high_value AS (
        SELECT *
        FROM recent_orders
        WHERE total > 500
    ),
    by_customer AS (
        SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS total_spent
        FROM high_value
        GROUP BY customer_id
    )
SELECT customer_id, order_count, total_spent
FROM by_customer
WHERE order_count >= 3
ORDER BY total_spent DESC
```

## CTEs Referencing Other CTEs

A CTE can reference any CTE defined before it in the WITH clause.

### Chained Transformations

```sql
WITH
    raw_data AS (
        SELECT *
        FROM access_logs.csv
        WHERE status_code >= 400
    ),
    hourly_errors AS (
        SELECT
            EXTRACT('hour', timestamp) AS hour,
            status_code,
            COUNT(*) AS error_count
        FROM raw_data
        GROUP BY EXTRACT('hour', timestamp), status_code
    ),
    peak_hours AS (
        SELECT hour, SUM(error_count) AS total_errors
        FROM hourly_errors
        GROUP BY hour
        HAVING SUM(error_count) > 100
    )
SELECT h.hour, h.status_code, h.error_count
FROM hourly_errors h
INNER JOIN peak_hours p ON h.hour = p.hour
ORDER BY h.hour, h.error_count DESC
```

### Building on Previous Results

```sql
WITH
    base_metrics AS (
        SELECT
            department,
            COUNT(*) AS headcount,
            SUM(salary) AS total_salary
        FROM employees.csv
        GROUP BY department
    ),
    enriched_metrics AS (
        SELECT
            department,
            headcount,
            total_salary,
            ROUND(total_salary / headcount, 2) AS avg_salary
        FROM base_metrics
    ),
    ranked_metrics AS (
        SELECT
            department,
            headcount,
            avg_salary,
            CASE
                WHEN avg_salary > 80000 THEN 'High'
                WHEN avg_salary > 50000 THEN 'Medium'
                ELSE 'Low'
            END AS salary_tier
        FROM enriched_metrics
    )
SELECT *
FROM ranked_metrics
ORDER BY avg_salary DESC
```

## CTE Used Multiple Times

A key benefit of CTEs is the ability to reference the same named result set multiple times in the main query.

### Self-Join with CTE

```sql
WITH employee_data AS (
    SELECT id, name, department, salary
    FROM employees.csv
)
SELECT
    e1.name AS employee,
    e2.name AS colleague,
    e1.department
FROM employee_data e1
INNER JOIN employee_data e2
    ON e1.department = e2.department
    AND e1.id < e2.id
```

### Comparing to Overall Statistics

```sql
WITH stats AS (
    SELECT
        AVG(salary) AS avg_salary,
        MIN(salary) AS min_salary,
        MAX(salary) AS max_salary
    FROM employees.csv
)
SELECT
    e.name,
    e.salary,
    s.avg_salary,
    e.salary - s.avg_salary AS diff_from_avg,
    ROUND(100.0 * (e.salary - s.min_salary) / (s.max_salary - s.min_salary), 1) AS percentile
FROM employees.csv e, stats s
ORDER BY e.salary DESC
```

### Multiple References in UNION

```sql
WITH monthly_data AS (
    SELECT
        EXTRACT('month', order_date) AS month,
        SUM(total) AS revenue
    FROM orders.csv
    GROUP BY EXTRACT('month', order_date)
)
SELECT 'Above Average' AS category, month, revenue
FROM monthly_data
WHERE revenue > (SELECT AVG(revenue) FROM monthly_data)
UNION ALL
SELECT 'Below Average' AS category, month, revenue
FROM monthly_data
WHERE revenue <= (SELECT AVG(revenue) FROM monthly_data)
ORDER BY revenue DESC
```

## Common Use Cases

### Breaking Down Complex Queries

Instead of deeply nested subqueries:

```sql
-- Hard to read nested subqueries
SELECT name
FROM employees.csv
WHERE department IN (
    SELECT department
    FROM (
        SELECT department, AVG(salary) AS avg_sal
        FROM employees.csv
        GROUP BY department
    )
    WHERE avg_sal > 60000
)

-- Clearer with CTEs
WITH dept_salaries AS (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees.csv
    GROUP BY department
),
high_paying_depts AS (
    SELECT department
    FROM dept_salaries
    WHERE avg_salary > 60000
)
SELECT name
FROM employees.csv
WHERE department IN (SELECT department FROM high_paying_depts)
```

### Reusing Subquery Results

When you need the same derived data multiple times:

```sql
WITH order_totals AS (
    SELECT customer_id, SUM(total) AS lifetime_value
    FROM orders.csv
    GROUP BY customer_id
)
SELECT
    c.name,
    c.segment,
    o.lifetime_value,
    CASE
        WHEN o.lifetime_value > (SELECT AVG(lifetime_value) FROM order_totals) THEN 'Above Average'
        ELSE 'Below Average'
    END AS value_category
FROM customers.csv c
INNER JOIN order_totals o ON c.id = o.customer_id
WHERE o.lifetime_value > (SELECT AVG(lifetime_value) * 0.5 FROM order_totals)
ORDER BY o.lifetime_value DESC
```

### Staging Data Transformations

```sql
WITH
    -- Stage 1: Parse and clean
    cleaned_logs AS (
        SELECT
            TRIM(ip_address) AS ip,
            LOWER(request_method) AS method,
            response_code,
            response_time
        FROM access_logs.csv
        WHERE response_code IS NOT NULL
    ),
    -- Stage 2: Aggregate
    ip_summary AS (
        SELECT
            ip,
            COUNT(*) AS request_count,
            AVG(response_time) AS avg_response_time,
            SUM(CASE WHEN response_code >= 400 THEN 1 ELSE 0 END) AS error_count
        FROM cleaned_logs
        GROUP BY ip
    ),
    -- Stage 3: Classify
    classified_ips AS (
        SELECT
            ip,
            request_count,
            avg_response_time,
            error_count,
            CASE
                WHEN error_count > request_count * 0.5 THEN 'Suspicious'
                WHEN request_count > 1000 THEN 'Heavy User'
                ELSE 'Normal'
            END AS classification
        FROM ip_summary
    )
SELECT *
FROM classified_ips
WHERE classification = 'Suspicious'
ORDER BY error_count DESC
```

### Report Generation

```sql
WITH
    daily_sales AS (
        SELECT
            DATE(order_date) AS sale_date,
            COUNT(*) AS orders,
            SUM(total) AS revenue
        FROM orders.csv
        GROUP BY DATE(order_date)
    ),
    running_totals AS (
        SELECT
            sale_date,
            orders,
            revenue,
            SUM(revenue) OVER (ORDER BY sale_date) AS cumulative_revenue
        FROM daily_sales
    )
SELECT
    sale_date,
    orders,
    revenue,
    cumulative_revenue,
    ROUND(100.0 * revenue / cumulative_revenue, 2) AS pct_of_cumulative
FROM running_totals
ORDER BY sale_date
```

## CTE vs Subquery

| Feature | CTE | Subquery |
|---------|-----|----------|
| Readability | Better for complex queries | Better for simple cases |
| Reusability | Can reference multiple times | Must repeat |
| Debugging | Easier to test independently | Test entire query |
| Performance | May be optimized differently | Inline execution |

### When to Use CTEs

- Query has multiple logical steps
- Same subquery result needed multiple times
- Query is difficult to read/maintain
- Building reports with staged transformations

### When to Use Subqueries

- Simple, one-off derived value
- Subquery used only once
- Simple IN or EXISTS check

## Best Practices

### 1. Use Descriptive Names

```sql
-- Good: clear purpose
WITH active_premium_customers AS (...)

-- Avoid: unclear
WITH t1 AS (...)
```

### 2. Keep CTEs Focused

Each CTE should do one thing well:

```sql
-- Good: each CTE has one responsibility
WITH
    filter_active AS (SELECT * FROM users.csv WHERE status = 'active'),
    aggregate_orders AS (SELECT user_id, COUNT(*) FROM orders.csv GROUP BY user_id),
    join_data AS (SELECT ... FROM filter_active JOIN aggregate_orders ...)

-- Avoid: mixing concerns in one CTE
WITH
    everything AS (
        SELECT ... FROM users.csv u
        JOIN orders.csv o ...
        WHERE status = 'active'
        GROUP BY ...
    )
```

### 3. Order CTEs Logically

Place CTEs in dependency order (base data first, derived data later):

```sql
WITH
    -- 1. Base data extraction
    raw_data AS (...),
    -- 2. Filtering
    filtered_data AS (SELECT ... FROM raw_data WHERE ...),
    -- 3. Aggregation
    aggregated AS (SELECT ... FROM filtered_data GROUP BY ...),
    -- 4. Final transformations
    final AS (SELECT ... FROM aggregated ...)
SELECT * FROM final
```

### 4. Document Complex CTEs

Add comments for clarity:

```sql
WITH
    -- Calculate 30-day rolling average of sales per region
    rolling_avg AS (
        SELECT
            region,
            sale_date,
            AVG(amount) OVER (
                PARTITION BY region
                ORDER BY sale_date
                ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
            ) AS avg_30d
        FROM sales.csv
    )
SELECT * FROM rolling_avg
```

## Related Documentation

- [SQL Overview](/sql/) - General SQL reference
- [Subqueries](/sql/subqueries) - Inline nested queries
- [JOINs](/sql/joins) - Combining data sources
- [Window Functions](/sql/window-functions) - Advanced analytics
- [UNION](/sql/union) - Combining query results
