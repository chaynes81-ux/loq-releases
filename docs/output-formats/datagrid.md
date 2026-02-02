# DATAGRID / TABLE / GRID Format

Format query results as ASCII tables for terminal display.

## Overview

The DATAGRID format outputs query results as formatted ASCII tables with borders, perfect for terminal viewing and quick data inspection.

## Usage

```bash
loq -o:DATAGRID "SELECT * FROM data.csv"
```

## Output Example

```
+----------+-----+------------+
| name     | age | city       |
+----------+-----+------------+
| Alice    | 30  | New York   |
| Bob      | 25  | London     |
| Charlie  | 35  | Paris      |
+----------+-----+------------+
3 rows
```

## Format Aliases

- `-o:DATAGRID` - Primary name
- `-o:TABLE` - Alias
- `-o:GRID` - Alias

## Examples

### Display CSV as table
```bash
loq -o:DATAGRID "SELECT name, age FROM users.csv LIMIT 10"
```

### Aggregation results
```bash
loq -o:TABLE "SELECT city, COUNT(*) as count FROM users.csv GROUP BY city"
```

### IIS log analysis
```bash
loq -i:W3C -o:GRID "SELECT TOP 10 cs-uri-stem, COUNT(*) FROM access.log GROUP BY cs-uri-stem ORDER BY COUNT(*) DESC"
```

## Notes

- Column widths auto-adjust to content
- Long values may be truncated for display
- Best for interactive terminal use
- Use CSV/JSON for machine processing
