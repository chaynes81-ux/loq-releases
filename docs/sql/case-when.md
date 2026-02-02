# CASE WHEN

CASE WHEN expressions provide conditional logic in SQL queries, similar to if-else statements in programming languages.

## Syntax

### Simple CASE

Compare a value against multiple options:

```sql
CASE expression
    WHEN value1 THEN result1
    WHEN value2 THEN result2
    ...
    [ELSE default_result]
END
```

### Searched CASE

Evaluate multiple conditions:

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    [ELSE default_result]
END
```

## Simple CASE

Compare an expression against specific values.

### Basic Example

```sql
SELECT
    name,
    status,
    CASE status
        WHEN 'active' THEN 'A'
        WHEN 'inactive' THEN 'I'
        WHEN 'pending' THEN 'P'
        ELSE 'U'
    END AS status_code
FROM users.csv
```

### With Column Alias

```sql
SELECT
    product,
    CASE category
        WHEN 'electronics' THEN 'Tech'
        WHEN 'clothing' THEN 'Apparel'
        WHEN 'food' THEN 'Grocery'
        ELSE 'Other'
    END AS category_name
FROM products.csv
```

### Multiple Values Same Result

```sql
SELECT
    day,
    CASE day
        WHEN 'Saturday' THEN 'Weekend'
        WHEN 'Sunday' THEN 'Weekend'
        ELSE 'Weekday'
    END AS day_type
FROM schedule.csv
```

## Searched CASE

Evaluate conditions (more flexible than simple CASE).

### Basic Example

```sql
SELECT
    name,
    score,
    CASE
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        WHEN score >= 60 THEN 'D'
        ELSE 'F'
    END AS grade
FROM students.csv
```

### Multiple Conditions

```sql
SELECT
    name,
    age,
    income,
    CASE
        WHEN age < 18 THEN 'Minor'
        WHEN age >= 65 THEN 'Senior'
        WHEN income > 100000 THEN 'High Income'
        ELSE 'Standard'
    END AS category
FROM customers.csv
```

### Range Conditions

```sql
SELECT
    product,
    price,
    CASE
        WHEN price < 10 THEN 'Budget'
        WHEN price BETWEEN 10 AND 50 THEN 'Mid-range'
        WHEN price BETWEEN 51 AND 100 THEN 'Premium'
        ELSE 'Luxury'
    END AS tier
FROM products.csv
```

## CASE in Different Clauses

### In SELECT

```sql
SELECT
    name,
    CASE WHEN age >= 18 THEN 'Adult' ELSE 'Minor' END AS age_group
FROM users.csv
```

### In WHERE

```sql
SELECT * FROM orders.csv
WHERE CASE
    WHEN priority = 'high' THEN total > 100
    WHEN priority = 'low' THEN total > 500
    ELSE total > 250
END
```

### In ORDER BY

```sql
SELECT * FROM tasks.csv
ORDER BY CASE priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
    ELSE 5
END
```

### In GROUP BY

```sql
SELECT
    CASE
        WHEN age < 18 THEN 'Under 18'
        WHEN age BETWEEN 18 AND 35 THEN '18-35'
        WHEN age BETWEEN 36 AND 55 THEN '36-55'
        ELSE 'Over 55'
    END AS age_group,
    COUNT(*) AS count
FROM users.csv
GROUP BY CASE
    WHEN age < 18 THEN 'Under 18'
    WHEN age BETWEEN 18 AND 35 THEN '18-35'
    WHEN age BETWEEN 36 AND 55 THEN '36-55'
    ELSE 'Over 55'
END
```

## CASE with Aggregation

### Conditional Counting

```sql
SELECT
    department,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive
FROM employees.csv
GROUP BY department
```

### Conditional Sum

```sql
SELECT
    category,
    SUM(CASE WHEN month = 'Jan' THEN sales ELSE 0 END) AS jan_sales,
    SUM(CASE WHEN month = 'Feb' THEN sales ELSE 0 END) AS feb_sales,
    SUM(CASE WHEN month = 'Mar' THEN sales ELSE 0 END) AS mar_sales
FROM monthly_sales.csv
GROUP BY category
```

### Percentage Calculation

```sql
SELECT
    department,
    ROUND(
        100.0 * SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS female_pct
FROM employees.csv
GROUP BY department
```

## Nested CASE

CASE expressions can be nested:

```sql
SELECT
    name,
    CASE region
        WHEN 'North' THEN
            CASE WHEN sales > 1000 THEN 'North Star' ELSE 'North' END
        WHEN 'South' THEN
            CASE WHEN sales > 1000 THEN 'South Star' ELSE 'South' END
        ELSE 'Other'
    END AS category
FROM sales_reps.csv
```

## CASE with NULL

Handle NULL values:

```sql
SELECT
    name,
    CASE
        WHEN email IS NULL THEN 'No Email'
        WHEN email LIKE '%@company.com' THEN 'Internal'
        ELSE 'External'
    END AS email_type
FROM contacts.csv
```

### COALESCE Alternative

For simple NULL replacement, use COALESCE:

```sql
-- Using CASE
SELECT CASE WHEN name IS NULL THEN 'Unknown' ELSE name END FROM users.csv

-- Using COALESCE (simpler)
SELECT COALESCE(name, 'Unknown') FROM users.csv
```

## Common Patterns

### Status Mapping

```sql
SELECT
    order_id,
    CASE status
        WHEN 1 THEN 'Pending'
        WHEN 2 THEN 'Processing'
        WHEN 3 THEN 'Shipped'
        WHEN 4 THEN 'Delivered'
        WHEN 5 THEN 'Cancelled'
        ELSE 'Unknown'
    END AS status_name
FROM orders.csv
```

### Grade Calculation

```sql
SELECT
    student,
    score,
    CASE
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        WHEN score >= 60 THEN 'D'
        ELSE 'F'
    END AS grade,
    CASE
        WHEN score >= 60 THEN 'Pass'
        ELSE 'Fail'
    END AS result
FROM exams.csv
```

### Date Categorization

```sql
SELECT
    order_id,
    order_date,
    CASE
        WHEN EXTRACT('dow', order_date) IN (0, 6) THEN 'Weekend'
        ELSE 'Weekday'
    END AS day_type,
    CASE EXTRACT('month', order_date)
        WHEN 1 THEN 'Q1'
        WHEN 2 THEN 'Q1'
        WHEN 3 THEN 'Q1'
        WHEN 4 THEN 'Q2'
        WHEN 5 THEN 'Q2'
        WHEN 6 THEN 'Q2'
        WHEN 7 THEN 'Q3'
        WHEN 8 THEN 'Q3'
        WHEN 9 THEN 'Q3'
        ELSE 'Q4'
    END AS quarter
FROM orders.csv
```

### Pivot Table

Transform rows to columns:

```sql
SELECT
    product,
    MAX(CASE WHEN region = 'North' THEN sales END) AS north,
    MAX(CASE WHEN region = 'South' THEN sales END) AS south,
    MAX(CASE WHEN region = 'East' THEN sales END) AS east,
    MAX(CASE WHEN region = 'West' THEN sales END) AS west
FROM regional_sales.csv
GROUP BY product
```

### Risk Scoring

```sql
SELECT
    customer_id,
    CASE
        WHEN late_payments > 3 AND credit_score < 600 THEN 'High Risk'
        WHEN late_payments > 1 OR credit_score < 650 THEN 'Medium Risk'
        ELSE 'Low Risk'
    END AS risk_level
FROM customers.csv
```

## Best Practices

### 1. Always Include ELSE

Prevent unexpected NULLs:

```sql
-- Good: explicit default
CASE status WHEN 'A' THEN 'Active' ELSE 'Unknown' END

-- Risky: may return NULL
CASE status WHEN 'A' THEN 'Active' END
```

### 2. Order Conditions Carefully

First matching condition wins:

```sql
-- Correct order (most specific first)
CASE
    WHEN score = 100 THEN 'Perfect'
    WHEN score >= 90 THEN 'A'
    WHEN score >= 80 THEN 'B'
    ELSE 'C or below'
END

-- Wrong order (90-99 never matched)
CASE
    WHEN score >= 80 THEN 'B'  -- Matches 90-99 too!
    WHEN score >= 90 THEN 'A'  -- Never reached
    ELSE 'Other'
END
```

### 3. Use Simple CASE When Possible

```sql
-- Simple CASE (cleaner)
CASE status WHEN 'A' THEN 'Active' WHEN 'I' THEN 'Inactive' END

-- Searched CASE (more verbose)
CASE WHEN status = 'A' THEN 'Active' WHEN status = 'I' THEN 'Inactive' END
```

### 4. Extract Complex Logic

For readability, consider breaking complex CASE into multiple columns:

```sql
SELECT
    name,
    CASE WHEN age >= 18 THEN 'Adult' ELSE 'Minor' END AS age_category,
    CASE WHEN income > 50000 THEN 'Above Avg' ELSE 'Below Avg' END AS income_category
FROM users.csv
```

## Related Documentation

- [SQL Overview](/sql/) - General SQL reference
- [Conditional Functions](/functions/conditional) - IF, COALESCE, NULLIF
- [Aggregation](/sql/aggregation) - Using CASE with GROUP BY
