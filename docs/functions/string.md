# String Functions

String functions manipulate and transform text data.

## UPPER / UCASE

Convert string to uppercase.

```sql
UPPER(string)
UCASE(string)  -- alias
```

**Example:**
```sql
SELECT UPPER(name) FROM users.csv
-- 'alice' → 'ALICE'
```

## LOWER / LCASE

Convert string to lowercase.

```sql
LOWER(string)
LCASE(string)  -- alias
```

**Example:**
```sql
SELECT LOWER(email) FROM users.csv
-- 'Alice@Example.COM' → 'alice@example.com'
```

## LENGTH / LEN / STRLEN

Get the length of a string.

```sql
LENGTH(string)
LEN(string)     -- alias
STRLEN(string)  -- alias
```

**Example:**
```sql
SELECT name, LENGTH(name) AS name_length FROM users.csv
-- 'Alice' → 5

SELECT * FROM users.csv WHERE LENGTH(name) > 10
```

## SUBSTR / SUBSTRING

Extract a substring.

```sql
SUBSTR(string, start, length)
SUBSTRING(string, start, length)  -- alias
```

- `start`: 1-based position (first character is 1)
- `length`: Number of characters to extract

**Examples:**
```sql
-- First 3 characters
SELECT SUBSTR(name, 1, 3) FROM users.csv
-- 'Alice' → 'Ali'

-- Characters 2-4
SELECT SUBSTR(name, 2, 3) FROM users.csv
-- 'Alice' → 'lic'

-- From position 3 to end (omit length or use large value)
SELECT SUBSTR(name, 3, 100) FROM users.csv
-- 'Alice' → 'ice'
```

## CONCAT

Concatenate multiple strings.

```sql
CONCAT(string1, string2, ...)
```

**Examples:**
```sql
-- Join two columns
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users.csv
-- 'Alice', 'Smith' → 'Alice Smith'

-- Multiple values
SELECT CONCAT(city, ', ', state, ' ', zip) AS address FROM addresses.csv

-- With other functions
SELECT CONCAT(UPPER(title), ': ', description) FROM articles.csv
```

## TRIM

Remove leading and trailing whitespace.

```sql
TRIM(string)
```

**Example:**
```sql
SELECT TRIM(name) FROM users.csv
-- '  Alice  ' → 'Alice'
```

## LTRIM

Remove leading whitespace.

```sql
LTRIM(string)
```

**Example:**
```sql
SELECT LTRIM(name) FROM users.csv
-- '  Alice' → 'Alice'
```

## RTRIM

Remove trailing whitespace.

```sql
RTRIM(string)
```

**Example:**
```sql
SELECT RTRIM(name) FROM users.csv
-- 'Alice  ' → 'Alice'
```

## REPLACE

Replace all occurrences of a substring.

```sql
REPLACE(string, search, replacement)
```

**Examples:**
```sql
-- Simple replacement
SELECT REPLACE(text, 'foo', 'bar') FROM data.csv
-- 'foo baz foo' → 'bar baz bar'

-- Remove characters (replace with empty string)
SELECT REPLACE(phone, '-', '') FROM contacts.csv
-- '555-123-4567' → '5551234567'

-- Chain replacements
SELECT REPLACE(REPLACE(text, '\n', ' '), '\t', ' ') FROM data.csv
```

## EXTRACT_PREFIX

Extract the prefix of a string before a delimiter.

```sql
EXTRACT_PREFIX(string, delimiter)
```

**Examples:**
```sql
-- Get username from email
SELECT EXTRACT_PREFIX(email, '@') AS username FROM users.csv
-- 'alice@example.com' → 'alice'

-- Get domain from URL
SELECT EXTRACT_PREFIX(url, '/') AS protocol FROM urls.csv
-- 'https://example.com/path' → 'https:'
```

## EXTRACT_SUFFIX

Extract the suffix of a string after a delimiter.

```sql
EXTRACT_SUFFIX(string, delimiter)
```

**Examples:**
```sql
-- Get domain from email
SELECT EXTRACT_SUFFIX(email, '@') AS domain FROM users.csv
-- 'alice@example.com' → 'example.com'

-- Get file extension
SELECT EXTRACT_SUFFIX(filename, '.') AS extension FROM files.csv
-- 'document.pdf' → 'pdf'
```

## Common Patterns

### Clean and Normalize Data

```sql
SELECT
    UPPER(TRIM(name)) AS normalized_name,
    LOWER(TRIM(email)) AS normalized_email
FROM users.csv
```

### Parse Structured Strings

```sql
-- Parse email addresses
SELECT
    EXTRACT_PREFIX(email, '@') AS username,
    EXTRACT_SUFFIX(email, '@') AS domain
FROM users.csv

-- Parse file paths
SELECT
    EXTRACT_SUFFIX(path, '/') AS filename,
    REPLACE(path, CONCAT('/', EXTRACT_SUFFIX(path, '/')), '') AS directory
FROM files.csv
```

### Format Output

```sql
SELECT
    CONCAT(
        UPPER(SUBSTR(first_name, 1, 1)),
        LOWER(SUBSTR(first_name, 2, 100)),
        ' ',
        UPPER(SUBSTR(last_name, 1, 1)),
        LOWER(SUBSTR(last_name, 2, 100))
    ) AS proper_name
FROM users.csv
```

### Filter by Pattern

```sql
-- Names starting with 'A'
SELECT * FROM users.csv WHERE UPPER(SUBSTR(name, 1, 1)) = 'A'

-- Long descriptions
SELECT * FROM products.csv WHERE LENGTH(description) > 100

-- Contains substring (using LIKE is usually better)
SELECT * FROM logs.csv WHERE message LIKE '%error%'
```

### Data Validation

```sql
-- Check email format
SELECT * FROM users.csv
WHERE email LIKE '%@%.%'
  AND LENGTH(EXTRACT_PREFIX(email, '@')) > 0
  AND LENGTH(EXTRACT_SUFFIX(email, '@')) > 3
```

### String Transformations

```sql
-- Remove special characters
SELECT REPLACE(REPLACE(REPLACE(phone, '-', ''), '(', ''), ')', '') AS clean_phone
FROM contacts.csv

-- Mask sensitive data
SELECT CONCAT(SUBSTR(ssn, 1, 3), '-XX-XXXX') AS masked_ssn FROM employees.csv

-- Truncate long text
SELECT
    CASE
        WHEN LENGTH(description) > 50
        THEN CONCAT(SUBSTR(description, 1, 47), '...')
        ELSE description
    END AS short_desc
FROM products.csv
```

## NULL Handling

String functions return NULL when given NULL input:

```sql
UPPER(NULL)     -- NULL
CONCAT('a', NULL)  -- NULL (in standard SQL mode)
LENGTH(NULL)    -- NULL
```

Use COALESCE to handle NULLs:

```sql
SELECT UPPER(COALESCE(name, 'Unknown')) FROM users.csv
```

## Type Conversion

Non-string values are converted to strings:

```sql
CONCAT('Value: ', 42)     -- 'Value: 42'
CONCAT('Price: $', 19.99) -- 'Price: $19.99'
LENGTH(12345)             -- 5
```

## See Also

- [Functions Overview](/functions/) - All function categories
- [Conditional Functions](/functions/conditional) - COALESCE for NULL handling
- [SQL Basics](/sql/basics) - LIKE for pattern matching
