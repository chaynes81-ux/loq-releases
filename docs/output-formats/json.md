# JSON Output

Export query results as JSON objects in NDJSON (newline-delimited JSON) format.

## Usage

```bash
loq -o:JSON "SELECT * FROM data.csv"
loq -o:NDJSON "SELECT * FROM data.csv"
```

Both `-o:JSON` and `-o:NDJSON` produce the same output.

## Output Format

Each row is output as a JSON object on its own line (NDJSON format):

```json
{"name":"Alice","age":32,"city":"New York"}
{"name":"Bob","age":28,"city":"San Francisco"}
{"name":"Carol","age":35,"city":"Chicago"}
```

This format is:
- **Streaming-friendly**: Process line by line
- **Memory-efficient**: No need to load entire array
- **Compatible**: Works with `jq`, `grep`, etc.

## Output to File

```bash
# To file
loq -o:JSON --ofile:output.json "SELECT * FROM data.csv"

# To stdout (default)
loq -o:JSON "SELECT * FROM data.csv"
```

## Type Handling

| SQL Type | JSON Type |
|----------|-----------|
| Integer | Number |
| Float | Number |
| Boolean | Boolean |
| String | String |
| NULL | null |
| DateTime | String (ISO 8601) |

### Examples

```json
{"id":42,"price":19.99,"active":true,"name":"Widget","deleted":null}
{"timestamp":"2024-01-15T14:30:00"}
```

## Examples

### Basic Export

```bash
loq -o:JSON "SELECT * FROM users.csv"
```

### Filtered Export

```bash
loq -o:JSON --ofile:errors.json \
          "SELECT timestamp, level, message FROM logs.csv WHERE level = 'error'"
```

### Aggregated Export

```bash
loq -o:JSON "SELECT category, COUNT(*) AS count, SUM(amount) AS total
                   FROM sales.csv
                   GROUP BY category"
```

Output:
```json
{"category":"Electronics","count":150,"total":45000.50}
{"category":"Clothing","count":89,"total":12500.00}
{"category":"Books","count":210,"total":8400.75}
```

### With Column Aliases

```bash
loq -o:JSON "SELECT
                       name AS customerName,
                       email AS contactEmail,
                       total AS orderTotal
                   FROM orders.csv"
```

## Processing with jq

[jq](https://stedolan.github.io/jq/) is a powerful JSON processor.

### Filter

```bash
loq -o:JSON "SELECT * FROM users.csv" | jq 'select(.age > 30)'
```

### Extract Field

```bash
loq -o:JSON "SELECT * FROM users.csv" | jq -r '.name'
```

### Transform

```bash
loq -o:JSON "SELECT * FROM users.csv" | jq '{user: .name, years: .age}'
```

### Collect into Array

```bash
loq -o:JSON "SELECT * FROM users.csv" | jq -s '.'
```

Output:
```json
[
  {"name":"Alice","age":32},
  {"name":"Bob","age":28}
]
```

### Statistics

```bash
loq -o:JSON "SELECT * FROM sales.csv" | jq -s 'map(.amount) | add'
```

## API Integration

### POST to API

```bash
loq -o:JSON "SELECT * FROM data.csv" | \
  curl -X POST -H "Content-Type: application/json" \
       --data-binary @- https://api.example.com/import
```

### Save and Upload

```bash
loq -o:JSON --ofile:data.json "SELECT * FROM data.csv"
curl -X POST -H "Content-Type: application/json" \
     -d @data.json https://api.example.com/import
```

## Streaming Processing

Process large files line by line:

### Python

```python
import json
import subprocess

proc = subprocess.Popen(
    ['loq', '-o:JSON', 'SELECT * FROM huge.csv'],
    stdout=subprocess.PIPE,
    text=True
)

for line in proc.stdout:
    record = json.loads(line)
    # Process record
    print(record['name'])
```

### Node.js

```javascript
const { spawn } = require('child_process');
const readline = require('readline');

const proc = spawn('loq', ['-o:JSON', 'SELECT * FROM huge.csv']);
const rl = readline.createInterface({ input: proc.stdout });

rl.on('line', (line) => {
    const record = JSON.parse(line);
    console.log(record.name);
});
```

### Bash

```bash
loq -o:JSON "SELECT * FROM data.csv" | while read line; do
    name=$(echo "$line" | jq -r '.name')
    echo "Processing: $name"
done
```

## Converting to JSON Array

If you need a JSON array instead of NDJSON:

### Using jq

```bash
loq -o:JSON "SELECT * FROM users.csv" | jq -s '.'
```

### Using Shell

```bash
echo '['
loq -o:JSON "SELECT * FROM users.csv" | sed 's/$/,/' | sed '$ s/,$//'
echo ']'
```

## Nested JSON

loq outputs flat JSON objects. For nested structures, use jq:

```bash
# Create nested structure
loq -o:JSON "SELECT id, name, email, city, country FROM users.csv" | \
  jq '{id, name, contact: {email}, location: {city, country}}'
```

## Best Practices

### Use Meaningful Aliases

```sql
SELECT
    user_id AS userId,
    first_name AS firstName,
    last_name AS lastName
FROM users.csv
```

### Handle NULLs

NULL values are output as JSON null:

```json
{"name":"Alice","email":null}
```

Check for nulls in processing:

```bash
loq -o:JSON "SELECT * FROM users.csv" | jq 'select(.email != null)'
```

### Large Files

NDJSON is efficient for large files:

```bash
# Process 1M rows without loading all into memory
loq -o:JSON "SELECT * FROM huge.csv" | process_stream
```

## Troubleshooting

### Invalid JSON Characters

Special characters are automatically escaped:

```json
{"text":"Line 1\nLine 2","quote":"He said \"hello\""}
```

### Unicode

JSON output uses UTF-8 encoding:

```json
{"name":"日本語","emoji":"😀"}
```

### Numeric Precision

Large integers maintain precision:

```json
{"id":9007199254740993}
```

## See Also

- [Output Formats Overview](/output-formats/)
- [CSV Output](/output-formats/csv)
- [JSON Input](/input-formats/json)
