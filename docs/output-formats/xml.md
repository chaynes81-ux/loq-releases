# XML Output

Export query results as XML documents.

## Usage

```bash
loq -o:XML "SELECT * FROM data.csv"
```

## Output Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<results>
  <row>
    <name>Alice</name>
    <age>32</age>
    <city>New York</city>
  </row>
  <row>
    <name>Bob</name>
    <age>28</age>
    <city>San Francisco</city>
  </row>
</results>
```

## Output to File

```bash
# To file
loq -o:XML --ofile:output.xml "SELECT * FROM data.csv"

# To stdout (default)
loq -o:XML "SELECT * FROM data.csv"
```

## Options

### Element Style (Default)

Values as element content:

```bash
loq -o:XML "SELECT * FROM data.csv"
```

Output:
```xml
<row>
  <name>Alice</name>
  <age>32</age>
</row>
```

### Attribute Style

Values as attributes:

```bash
loq -o:XML -oStyle:attribute "SELECT * FROM data.csv"
```

Output:
```xml
<row name="Alice" age="32" city="New York"/>
```

### Custom Root Element

```bash
loq -o:XML -oRootElement:users "SELECT * FROM users.csv"
```

Output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<users>
  <row>...</row>
</users>
```

### Custom Row Element

```bash
loq -o:XML -oRowElement:user "SELECT * FROM users.csv"
```

Output:
```xml
<results>
  <user>
    <name>Alice</name>
  </user>
</results>
```

### Combined Options

```bash
loq -o:XML -oRootElement:customers -oRowElement:customer \
          "SELECT * FROM customers.csv"
```

Output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<customers>
  <customer>
    <name>Alice</name>
    <email>alice@example.com</email>
  </customer>
</customers>
```

## Type Handling

All values are converted to strings in XML:

| SQL Type | XML Output |
|----------|------------|
| Integer | `<age>32</age>` |
| Float | `<price>19.99</price>` |
| Boolean | `<active>true</active>` |
| String | `<name>Alice</name>` |
| NULL | `<email/>` (empty element) |
| DateTime | `<timestamp>2024-01-15T14:30:00</timestamp>` |

## Special Characters

XML special characters are automatically escaped:

| Character | Escaped |
|-----------|---------|
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

```xml
<description>&lt;b&gt;Bold&lt;/b&gt; &amp; italic</description>
```

## Examples

### Basic Export

```bash
loq -o:XML --ofile:users.xml "SELECT * FROM users.csv"
```

### Filtered Export

```bash
loq -o:XML --ofile:errors.xml \
          "SELECT timestamp, level, message FROM logs.csv WHERE level = 'error'"
```

### With Custom Elements

```bash
loq -o:XML -oRootElement:report -oRowElement:entry \
          --ofile:report.xml \
          "SELECT date, category, amount FROM sales.csv"
```

Output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <entry>
    <date>2024-01-15</date>
    <category>Electronics</category>
    <amount>1500.00</amount>
  </entry>
</report>
```

### Attribute Style for Compact Output

```bash
loq -o:XML -oStyle:attribute --ofile:data.xml \
          "SELECT id, name, status FROM items.csv"
```

Output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<results>
  <row id="1" name="Widget" status="active"/>
  <row id="2" name="Gadget" status="inactive"/>
</results>
```

## Processing XML

### Using xmllint

```bash
# Pretty print
loq -o:XML "SELECT * FROM data.csv" | xmllint --format -

# XPath query
loq -o:XML "SELECT * FROM data.csv" | xmllint --xpath "//row[age>30]/name/text()" -
```

### Using xq (yq for XML)

```bash
# Filter rows
loq -o:XML "SELECT * FROM data.csv" | xq '.results.row[] | select(.age > 30)'
```

### XSLT Transformation

```bash
loq -o:XML --ofile:data.xml "SELECT * FROM data.csv"
xsltproc transform.xsl data.xml > output.html
```

## Integration

### Web Services

```bash
# POST XML to API
loq -o:XML "SELECT * FROM data.csv" | \
  curl -X POST -H "Content-Type: application/xml" \
       --data-binary @- https://api.example.com/import
```

### Database Import

```bash
# Generate XML for SQL Server bulk import
loq -o:XML -oRootElement:data -oRowElement:row \
          --ofile:import.xml "SELECT * FROM source.csv"
```

## Best Practices

### Use Meaningful Element Names

```bash
loq -o:XML -oRootElement:customers -oRowElement:customer \
          "SELECT id, name, email FROM customers.csv"
```

### Column Aliases for Clean XML

```sql
SELECT
    user_id AS userId,
    first_name AS firstName,
    last_name AS lastName
FROM users.csv
```

Results in:
```xml
<row>
  <userId>1</userId>
  <firstName>Alice</firstName>
  <lastName>Smith</lastName>
</row>
```

### Handle NULLs

NULL values create empty elements:

```xml
<row>
  <name>Bob</name>
  <email/>
</row>
```

### Validate Output

```bash
loq -o:XML --ofile:output.xml "SELECT * FROM data.csv"
xmllint --noout output.xml && echo "Valid XML"
```

## Troubleshooting

### Invalid Element Names

Column names with spaces or special characters are sanitized:

```sql
SELECT "First Name", "Last Name" FROM users.csv
-- Becomes: <First_Name>, <Last_Name>
```

### Large Files

For very large exports:

```bash
# Stream directly to file
loq -o:XML --ofile:large.xml "SELECT * FROM huge.csv"
```

### Encoding Issues

XML output is UTF-8 encoded by default:

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

## See Also

- [Output Formats Overview](/output-formats/)
- [JSON Output](/output-formats/json)
- [XML Input](/input-formats/xml)
