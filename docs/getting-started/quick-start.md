# Quick Start

This guide walks you through common loq operations with hands-on examples.

## Basic Query Syntax

The basic command structure is:

```bash
loq [options] "SQL_QUERY"
```

The SQL query follows standard syntax:

```sql
SELECT columns FROM 'file' WHERE condition ORDER BY column LIMIT n
```

## Your First Query

Create a sample CSV file:

```bash
cat > users.csv << 'EOF'
name,age,city,salary
Alice,32,New York,75000
Bob,28,San Francisco,85000
Carol,35,Chicago,70000
David,42,New York,95000
Eve,29,San Francisco,80000
EOF
```

Query all data:

```bash
loq "SELECT * FROM users.csv"
```

Output:
```
name,age,city,salary
Alice,32,New York,75000
Bob,28,San Francisco,85000
Carol,35,Chicago,70000
David,42,New York,95000
Eve,29,San Francisco,80000
```

## Selecting Columns

Select specific columns:

```bash
loq "SELECT name, city FROM users.csv"
```

Output:
```
name,city
Alice,New York
Bob,San Francisco
Carol,Chicago
David,New York
Eve,San Francisco
```

## Filtering with WHERE

Filter rows by condition:

```bash
loq "SELECT name, salary FROM users.csv WHERE salary > 75000"
```

Output:
```
name,salary
Bob,85000
David,95000
Eve,80000
```

Multiple conditions:

```bash
loq "SELECT * FROM users.csv WHERE city = 'New York' AND age > 30"
```

## Sorting with ORDER BY

Sort results:

```bash
loq "SELECT name, salary FROM users.csv ORDER BY salary DESC"
```

Output:
```
name,salary
David,95000
Bob,85000
Eve,80000
Alice,75000
Carol,70000
```

## Limiting Results

Get top N results:

```bash
loq "SELECT name, salary FROM users.csv ORDER BY salary DESC LIMIT 3"
```

## Aggregation

### COUNT

```bash
loq "SELECT COUNT(*) as total FROM users.csv"
```

### GROUP BY

```bash
loq "SELECT city, COUNT(*) as count, AVG(salary) as avg_salary
           FROM users.csv
           GROUP BY city"
```

Output:
```
city,count,avg_salary
Chicago,1,70000
New York,2,85000
San Francisco,2,82500
```

### HAVING

Filter aggregated results:

```bash
loq "SELECT city, COUNT(*) as count
           FROM users.csv
           GROUP BY city
           HAVING COUNT(*) > 1"
```

## Using Functions

### String Functions

```bash
loq "SELECT UPPER(name) as NAME, LOWER(city) as city FROM users.csv"
```

### Math Functions

```bash
loq "SELECT name, ROUND(salary / 1000, 1) as salary_k FROM users.csv"
```

### Conditional Functions

```bash
loq "SELECT name,
                  IF(salary > 80000, 'High', 'Normal') as level
           FROM users.csv"
```

## Different Input Formats

### JSON

```bash
cat > data.json << 'EOF'
{"name": "Alice", "score": 95}
{"name": "Bob", "score": 87}
{"name": "Carol", "score": 92}
EOF

loq -i:JSON "SELECT name, score FROM data.json WHERE score > 90"
```

### Web Server Logs (W3C)

```bash
loq -i:W3C "SELECT date, cs-uri-stem, sc-status
                  FROM access.log
                  WHERE sc-status >= 400"
```

### Windows Event Logs

```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Message
                   FROM System.evtx
                   WHERE Level <= 2
                   ORDER BY TimeCreated DESC
                   LIMIT 10"
```

### Filesystem

```bash
loq -i:FS "SELECT Name, Size, LastModified
                 FROM '/var/log'
                 WHERE Extension = 'log'
                 ORDER BY Size DESC
                 LIMIT 10"
```

## Output Formats

### JSON Output

```bash
loq -o:JSON "SELECT * FROM users.csv LIMIT 2"
```

Output:
```json
{"name":"Alice","age":32,"city":"New York","salary":75000}
{"name":"Bob","age":28,"city":"San Francisco","salary":85000}
```

### Table Output (DATAGRID)

```bash
loq -o:DATAGRID "SELECT name, city, salary FROM users.csv"
```

Output:
```
+-------+---------------+--------+
| name  | city          | salary |
+-------+---------------+--------+
| Alice | New York      | 75000  |
| Bob   | San Francisco | 85000  |
| Carol | Chicago       | 70000  |
| David | New York      | 95000  |
| Eve   | San Francisco | 80000  |
+-------+---------------+--------+
```

### SQLite Output

```bash
loq -o:SQLITE --ofile:output.db "SELECT * FROM users.csv"
```

### Chart Output

```bash
loq -o:CHART -chartType:Bar -chartTitle:"Salary by City" \
          --ofile:salary.png \
          "SELECT city, AVG(salary) FROM users.csv GROUP BY city"
```

## JOINs

Create related tables:

```bash
cat > departments.csv << 'EOF'
dept_id,dept_name
1,Engineering
2,Marketing
3,Sales
EOF

cat > employees.csv << 'EOF'
name,dept_id,salary
Alice,1,75000
Bob,1,85000
Carol,2,70000
David,3,95000
EOF
```

Join them:

```bash
loq "SELECT e.name, d.dept_name, e.salary
           FROM employees.csv e
           INNER JOIN departments.csv d ON e.dept_id = d.dept_id"
```

Output:
```
name,dept_name,salary
Alice,Engineering,75000
Bob,Engineering,85000
Carol,Marketing,70000
David,Sales,95000
```

## Window Functions

```bash
loq "SELECT name, salary,
                  RANK() OVER (ORDER BY salary DESC) as rank
           FROM users.csv"
```

Output:
```
name,salary,rank
David,95000,1
Bob,85000,2
Eve,80000,3
Alice,75000,4
Carol,70000,5
```

## Common Patterns

### Count by Category

```bash
loq "SELECT status, COUNT(*) FROM logs.csv GROUP BY status ORDER BY COUNT(*) DESC"
```

### Find Duplicates

```bash
loq "SELECT email, COUNT(*) as count
           FROM users.csv
           GROUP BY email
           HAVING COUNT(*) > 1"
```

### Recent Records

```bash
loq "SELECT * FROM logs.csv ORDER BY timestamp DESC LIMIT 100"
```

### Top N by Group

```bash
loq "SELECT name, city, salary,
                  ROW_NUMBER() OVER (PARTITION BY city ORDER BY salary DESC) as rank
           FROM users.csv"
```

## Next Steps

- [SQL Reference](/sql/) - Full SQL syntax documentation
- [Functions](/functions/) - All built-in functions
- [Input Formats](/input-formats/) - Detailed format documentation
- [CLI Reference](/cli/) - All command-line options
