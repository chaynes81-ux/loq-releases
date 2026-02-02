# TEMPLATE / TPL Output Format

Custom template-based output with variable substitution.

## Overview

The TEMPLATE format allows custom output formatting using template files with variable placeholders for each row.

## Usage

```bash
loq -o:TEMPLATE --tpl:mytemplate.tpl "SELECT * FROM data.csv"
```

## Template Syntax

Templates use `%fieldname%` placeholders:

```
Name: %name%
Age: %age%
City: %city%
---
```

## Examples

### HTML report template (report.tpl)
```html
<tr>
  <td>%name%</td>
  <td>%age%</td>
  <td>%city%</td>
</tr>
```

```bash
loq -o:TEMPLATE --tpl:report.tpl "SELECT name, age, city FROM users.csv"
```

### Markdown list
```
- **%title%** by %author% (%year%)
```

### Custom log format
```
[%timestamp%] %level%: %message%
```

## Notes

- Template is repeated for each output row
- Field names must match SELECT column names/aliases
- Missing fields output empty string
