# W3C / IISW3C Output Format

Output query results in W3C Extended Log Format.

## Overview

The W3C output format writes data in W3C Extended Log Format, commonly used by IIS and other web servers. Includes directive headers.

## Usage

```bash
loq -o:W3C "SELECT * FROM data.csv" > output.log
```

## Output Structure

```
#Software: loq
#Version: 1.0
#Date: 2024-01-15 10:30:00
#Fields: field1 field2 field3
value1 value2 value3
value4 value5 value6
```

## Examples

### Convert CSV to W3C format
```bash
loq -o:W3C "SELECT date, time, cs_uri_stem, sc_status FROM access.csv" > converted.log
```

### Export filtered IIS data
```bash
loq -i:W3C -o:W3C "SELECT * FROM u_ex*.log WHERE sc-status >= 400" > errors.log
```

## Notes

- Spaces in values are replaced with `+`
- Missing values are represented as `-`
- Compatible with IIS log analyzers
