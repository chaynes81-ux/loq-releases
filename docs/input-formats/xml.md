# XML

Parse XML documents with automatic schema detection and configurable row element selection.

## Usage

```bash
loq -i:XML "SELECT * FROM data.xml"
```

## File Format

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user>
    <name>Alice</name>
    <age>32</age>
    <city>New York</city>
  </user>
  <user>
    <name>Bob</name>
    <age>28</age>
    <city>San Francisco</city>
  </user>
</users>
```

### With Attributes

```xml
<products>
  <product id="1" category="electronics">
    <name>Widget</name>
    <price>9.99</price>
  </product>
  <product id="2" category="clothing">
    <name>T-Shirt</name>
    <price>19.99</price>
  </product>
</products>
```

## Schema Detection

loq automatically:

1. Identifies the row element (e.g., `<user>`, `<product>`)
2. Extracts child element text as columns
3. Extracts attributes as columns with `@` prefix
4. Infers column types from values

### Row Element Detection

loq looks for repeated child elements under the root:

```xml
<root>
  <item>...</item>  <!-- Row element: item -->
  <item>...</item>
  <item>...</item>
</root>
```

### Column Mapping

| XML Element | Column Name | Example Value |
|-------------|-------------|---------------|
| `<name>Alice</name>` | `name` | Alice |
| `<user id="1">` | `@id` | 1 |
| `<address><city>NY</city></address>` | `address.city` | NY |

## Options

### Custom Row Element

Specify which element represents a row:

```bash
loq -i:XML -iRowElement:record "SELECT * FROM data.xml"
```

### Example

```xml
<data>
  <metadata>
    <version>1.0</version>
  </metadata>
  <records>
    <record>
      <name>Alice</name>
    </record>
    <record>
      <name>Bob</name>
    </record>
  </records>
</data>
```

```bash
loq -i:XML -iRowElement:record "SELECT * FROM data.xml"
```

## Examples

### Basic Query

```bash
loq -i:XML "SELECT * FROM users.xml"
```

### Select Specific Columns

```bash
loq -i:XML "SELECT name, age FROM users.xml WHERE age > 30"
```

### Query Attributes

```bash
loq -i:XML "SELECT \"@id\", name, \"@category\" FROM products.xml"
```

::: tip
Attribute columns (prefixed with `@`) should be quoted.
:::

### Nested Elements

For nested structure:

```xml
<users>
  <user>
    <name>Alice</name>
    <address>
      <city>New York</city>
      <zip>10001</zip>
    </address>
  </user>
</users>
```

```bash
loq -i:XML "SELECT name, \"address.city\", \"address.zip\" FROM users.xml"
```

### Aggregation

```bash
loq -i:XML "SELECT \"@category\", COUNT(*), AVG(price)
                  FROM products.xml
                  GROUP BY \"@category\""
```

### Filtering

```bash
loq -i:XML "SELECT * FROM orders.xml
                  WHERE \"@status\" = 'pending'
                  AND total > 100"
```

## Type Inference

Values are automatically typed:

| XML Value | Detected Type |
|-----------|---------------|
| `<age>32</age>` | Integer |
| `<price>9.99</price>` | Float |
| `<active>true</active>` | Boolean |
| `<name>Alice</name>` | String |
| `<note/>` (empty) | Null |

## Common Patterns

### Configuration Files

```xml
<config>
  <database>
    <host>localhost</host>
    <port>5432</port>
    <name>myapp</name>
  </database>
  <cache>
    <enabled>true</enabled>
    <ttl>3600</ttl>
  </cache>
</config>
```

```bash
loq -i:XML "SELECT \"database.host\", \"database.port\"
                  FROM config.xml"
```

### RSS/Atom Feeds

```bash
loq -i:XML -iRowElement:item "SELECT title, link, pubDate
                                    FROM feed.xml
                                    ORDER BY pubDate DESC
                                    LIMIT 10"
```

### SOAP Responses

```bash
loq -i:XML -iRowElement:Result "SELECT * FROM response.xml"
```

### SVG/HTML

```bash
# Extract all elements
loq -i:XML -iRowElement:rect "SELECT \"@x\", \"@y\", \"@width\", \"@height\"
                                    FROM drawing.svg"
```

## Mixed Content

Elements with mixed content (text and child elements) extract text content:

```xml
<message>
  Hello <b>World</b>!
</message>
```

The `message` column contains: `Hello !` (child element text is excluded)

## Namespaces

XML namespaces are handled transparently:

```xml
<root xmlns="http://example.com/ns">
  <item>
    <name>Alice</name>
  </item>
</root>
```

Column names don't include namespace prefixes.

## Performance Tips

### Large XML Files

```bash
# Use LIMIT during exploration
loq -i:XML "SELECT * FROM large.xml LIMIT 100"

# Filter early
loq -i:XML "SELECT * FROM large.xml WHERE status = 'active'"
```

### Streaming

Large XML files are parsed in a streaming manner when possible, reducing memory usage.

## Troubleshooting

### Row Element Not Detected

If rows aren't detected correctly:

```bash
# Specify the row element explicitly
loq -i:XML -iRowElement:item "SELECT * FROM data.xml"
```

### Column Names With Special Characters

Quote column names with `@`, `.`, or special characters:

```sql
SELECT "@id", "user.name" FROM data.xml
```

### Encoding Issues

Ensure XML declares encoding:

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

### Invalid XML

```bash
loq -i:XML "SELECT * FROM data.xml"
# Error: Invalid XML at line 42
```

Validate XML with online tools or `xmllint`:

```bash
xmllint --noout data.xml
```

## See Also

- [Input Formats Overview](/input-formats/)
- [JSON Format](/input-formats/json)
- [XML Output](/output-formats/xml)
