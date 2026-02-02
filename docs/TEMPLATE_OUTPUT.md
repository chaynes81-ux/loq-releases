# Template Output Format

The Template output format allows you to define custom output templates with variable substitution, compatible with Microsoft Log Parser 2.2 template syntax.

## Usage

```bash
# Basic template output
loq -o:TEMPLATE --tpl:template.txt "SELECT * FROM data.csv"

# Alternative syntax
loq -o:TPL --tpl:template.txt "SELECT name, age, score FROM data.csv WHERE age > 25"
```

## Template Syntax

### Variable Substitution

Templates use `%FIELDNAME%` syntax for variable substitution:

```
Name: %name%
Age: %age%
Score: %score%
```

**Case-Insensitive**: Field names are matched case-insensitively, so `%NAME%`, `%name%`, and `%Name%` all work.

### Loop Markers

Use `%LOOP%` and `%ENDLOOP%` to define the row template section:

```html
<html>
<body>
<table>
<tr><th>Name</th><th>Score</th></tr>
%LOOP%
<tr><td>%name%</td><td>%score%</td></tr>
%ENDLOOP%
</table>
</body>
</html>
```

- Content before `%LOOP%` is the header (written once at start)
- Content between `%LOOP%` and `%ENDLOOP%` is repeated for each row
- Content after `%ENDLOOP%` is the footer (written once at end)

### Special Variables

- `%ROWNUM%` - Current row number (1-based)
- `%TOTALROWS%` - Total number of rows (only available in footer)

Example:

```
%LOOP%%ROWNUM%. %name% - %score%
%ENDLOOP%Total: %TOTALROWS% records
```

Output:
```
1. Alice - 95
2. Bob - 87
3. Charlie - 92
Total: 3 records
```

## Examples

### Simple List

Template (`list.txt`):
```
%LOOP%- %name% (%age%)
%ENDLOOP%
```

Command:
```bash
loq -o:TPL --tpl:list.txt "SELECT name, age FROM users.csv"
```

Output:
```
- Alice (30)
- Bob (25)
- Charlie (35)
```

### HTML Table

Template (`table.html`):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Query Results</title>
    <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; }
    </style>
</head>
<body>
    <h1>Query Results</h1>
    <table>
        <tr><th>#</th><th>Name</th><th>Age</th><th>Score</th></tr>
%LOOP%        <tr><td>%ROWNUM%</td><td>%name%</td><td>%age%</td><td>%score%</td></tr>
%ENDLOOP%    </table>
    <p>Total records: %TOTALROWS%</p>
</body>
</html>
```

Command:
```bash
loq -o:TPL --tpl:table.html "SELECT name, age, score FROM data.csv ORDER BY score DESC" > output.html
```

### Markdown Table

Template (`markdown.md`):
```
# Query Results

| # | Name | Age | Score |
|---|------|-----|-------|
%LOOP%| %ROWNUM% | %name% | %age% | %score% |
%ENDLOOP%

**Total Records:** %TOTALROWS%
```

## Field Value Formatting

- **NULL values**: Rendered as empty string
- **Booleans**: Rendered as "true" or "false"
- **Integers**: Rendered as decimal numbers
- **Floats**: Rendered with default precision
- **Strings**: Rendered as-is
- **DateTime**: Rendered as "YYYY-MM-DD HH:MM:SS"

## Tips

1. **Indentation**: Maintain proper indentation in your templates for readable output
2. **Escaping**: No special escaping needed - all characters pass through as-is
3. **Testing**: Start with a simple template and iterate
4. **HTML**: Remember to escape HTML special characters in data if needed
5. **Performance**: Template substitution is efficient, suitable for large result sets

## Compatibility

This implementation is compatible with Microsoft Log Parser 2.2 template format, supporting:
- `%FIELDNAME%` variable substitution (case-insensitive)
- `%LOOP%` and `%ENDLOOP%` markers
- `%ROWNUM%` special variable
- `%TOTALROWS%` special variable (in footer)
