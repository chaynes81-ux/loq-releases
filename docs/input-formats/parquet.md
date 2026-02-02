# Parquet

Parse Apache Parquet files with efficient columnar reading.

## Usage

```bash
loq -i:PARQUET "SELECT * FROM data.parquet"
```

## About Parquet

Apache Parquet is a columnar storage format optimized for analytics:

- **Columnar**: Reads only needed columns
- **Compressed**: Snappy, Gzip, LZ4 compression
- **Typed**: Strong schema with types
- **Efficient**: Excellent for large datasets

## Type Mapping

| Parquet Type | loq Type |
|--------------|----------------|
| INT32, INT64 | Integer |
| FLOAT, DOUBLE | Float |
| BOOLEAN | Boolean |
| BYTE_ARRAY (UTF8) | String |
| INT96 (timestamp) | DateTime |
| DATE | DateTime |
| TIMESTAMP | DateTime |

## Examples

### Basic Query

```bash
loq -i:PARQUET "SELECT * FROM data.parquet LIMIT 10"
```

### Select Columns

```bash
# Only reads the requested columns from disk
loq -i:PARQUET "SELECT id, name, amount FROM sales.parquet"
```

### Filter and Aggregate

```bash
loq -i:PARQUET "SELECT category, SUM(amount) AS total
                      FROM sales.parquet
                      WHERE year = 2024
                      GROUP BY category
                      ORDER BY total DESC"
```

### Query S3 Parquet

```bash
loq -i:S3 "SELECT * FROM 's3://bucket/data.parquet' LIMIT 100"
```

## Schema Inspection

View the schema:

```bash
loq -i:PARQUET "SELECT * FROM data.parquet LIMIT 1" -o:DATAGRID
```

## Compression Support

loq reads all standard Parquet compression codecs:

| Codec | Support |
|-------|---------|
| Uncompressed | Yes |
| Snappy | Yes |
| Gzip | Yes |
| LZ4 | Yes |
| Zstd | Yes |
| Brotli | Yes |

Compression is detected automatically.

## Performance Benefits

### Column Pruning

Only requested columns are read from disk:

```bash
# Fast: reads only 2 columns
loq -i:PARQUET "SELECT id, status FROM huge.parquet"

# Slower: reads all columns
loq -i:PARQUET "SELECT * FROM huge.parquet"
```

### Predicate Pushdown

Filters can skip entire row groups:

```bash
# May skip row groups where status != 'active'
loq -i:PARQUET "SELECT * FROM data.parquet WHERE status = 'active'"
```

## Common Patterns

### Data Exploration

```bash
# Sample data
loq -i:PARQUET "SELECT * FROM data.parquet LIMIT 100"

# Column statistics
loq -i:PARQUET "SELECT
                          COUNT(*) AS count,
                          MIN(amount) AS min,
                          MAX(amount) AS max,
                          AVG(amount) AS avg
                      FROM sales.parquet"
```

### Analytics Queries

```bash
# Time series aggregation
loq -i:PARQUET "SELECT
                          SUBSTR(timestamp, 1, 10) AS date,
                          COUNT(*) AS events
                      FROM events.parquet
                      GROUP BY date
                      ORDER BY date"
```

### Join with Other Formats

```bash
loq -i:PARQUET "SELECT p.*, l.category_name
                      FROM products.parquet p
                      JOIN categories.csv l ON p.category_id = l.id"
```

## Writing Parquet

loq can output to Parquet format:

```bash
loq -o:PARQUET --ofile:output.parquet "SELECT * FROM data.csv"
```

### Compression Options

```bash
# Snappy (default, fastest)
loq -o:PARQUET --ofile:output.parquet "SELECT * FROM data.csv"

# Gzip (smaller, slower)
loq -o:PARQUET -oCompression:gzip --ofile:output.parquet "SELECT * FROM data.csv"
```

### Use Cases

- Convert CSV to Parquet for faster queries
- Compress data for storage efficiency
- Create analytics-ready datasets

## Parquet vs CSV

| Feature | Parquet | CSV |
|---------|---------|-----|
| Column selection | Fast (reads only needed) | Slow (reads all) |
| Compression | Built-in | None |
| Types | Strong schema | Inferred |
| File size | Smaller (typically 50-90%) | Larger |
| Human readable | No (binary) | Yes |
| Write speed | Slower | Faster |
| Query large files | Excellent | Slow |

### When to Use Parquet

- Large datasets (millions of rows)
- Analytics workloads (aggregations)
- Repeated queries on same data
- Storage cost matters (S3)

### When to Use CSV

- Small datasets
- One-time queries
- Human inspection needed
- Simple data exchange

## Multiple Parquet Files

### Glob Pattern

```bash
loq -i:PARQUET "SELECT * FROM 'data/*.parquet'"
```

### Partitioned Data

```bash
# Query partitioned dataset
loq -i:PARQUET "SELECT * FROM 'year=2024/month=01/*.parquet'"
```

## Troubleshooting

### Schema Mismatch

If files have different schemas:

```bash
# Select common columns
loq -i:PARQUET "SELECT id, name FROM 'data/*.parquet'"
```

### Large Files

For very large Parquet files:

```bash
# Select specific columns
loq -i:PARQUET "SELECT id, status FROM huge.parquet LIMIT 10000"
```

### Memory Issues

Parquet is already memory-efficient, but for huge files:

```bash
# Use LIMIT
loq -i:PARQUET "SELECT * FROM huge.parquet LIMIT 100000"
```

### Unsupported Types

Some complex Parquet types may not be fully supported:

- Nested structures (maps, arrays)
- Complex decimals

These are converted to strings when possible.

## See Also

- [Input Formats Overview](/input-formats/)
- [S3](/input-formats/s3)
- [CSV](/input-formats/csv)
