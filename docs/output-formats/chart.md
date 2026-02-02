# Chart Output

Generate visual charts (PNG or SVG) from query results.

## Usage

```bash
loq -o:CHART -chartType:Bar --ofile:chart.png "SELECT category, COUNT(*) FROM data.csv GROUP BY category"
```

## Requirements

- `--ofile`: Output file path (required)
- File extension determines format: `.png` or `.svg`

## Chart Types

### Bar Chart

Vertical bar chart for comparing categories.

```bash
loq -o:CHART -chartType:Bar --ofile:chart.png \
          "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"
```

Best for:
- Comparing discrete categories
- Showing counts, totals, or averages
- 2-20 categories

### Line Chart

Line chart for trends and time series.

```bash
loq -o:CHART -chartType:Line --ofile:trend.png \
          "SELECT date, COUNT(*) FROM logs.csv GROUP BY date ORDER BY date"
```

Best for:
- Time series data
- Trends over ordered sequences
- Continuous data

### Pie Chart

Pie chart for proportions.

```bash
loq -o:CHART -chartType:Pie --ofile:distribution.png \
          "SELECT category, SUM(amount) FROM sales.csv GROUP BY category"
```

Best for:
- Part-to-whole relationships
- Percentage breakdowns
- 3-8 categories (more becomes unreadable)

## Options

### Chart Type

```bash
-chartType:Bar    # Vertical bar chart (default)
-chartType:Line   # Line chart
-chartType:Pie    # Pie chart
```

### Chart Title

```bash
-chartTitle:"My Chart Title"
```

```bash
loq -o:CHART -chartType:Bar -chartTitle:"HTTP Status Codes" \
          --ofile:status.png \
          "SELECT status, COUNT(*) FROM access.log GROUP BY status"
```

### Output Format

Determined by file extension:

```bash
--ofile:chart.png   # PNG (raster)
--ofile:chart.svg   # SVG (vector)
```

## Data Requirements

### Column Requirements

Charts require at least 2 columns:
1. **First column**: Labels/categories (X-axis or slice labels)
2. **Second column**: Numeric values (Y-axis or slice sizes)

```sql
-- Correct: 2 columns
SELECT category, COUNT(*) FROM data.csv GROUP BY category

-- Incorrect: 1 column
SELECT COUNT(*) FROM data.csv
```

### Numeric Values

The second column must be numeric:

```sql
-- Good
SELECT name, age FROM users.csv

-- Bad (second column is string)
SELECT name, city FROM users.csv
```

## Examples

### HTTP Status Code Distribution

```bash
loq -o:CHART -chartType:Bar \
          -chartTitle:"HTTP Status Codes" \
          --ofile:status_codes.png \
          "SELECT sc-status, COUNT(*) FROM access.log GROUP BY sc-status"
```

### Requests Over Time

```bash
loq -o:CHART -chartType:Line \
          -chartTitle:"Hourly Request Volume" \
          --ofile:hourly_requests.png \
          "SELECT SUBSTR(time, 1, 2) AS hour, COUNT(*)
           FROM access.log
           GROUP BY hour
           ORDER BY hour"
```

### Traffic by User Agent

```bash
loq -o:CHART -chartType:Pie \
          -chartTitle:"Traffic by Browser" \
          --ofile:browsers.svg \
          "SELECT cs(User-Agent), COUNT(*) AS requests
           FROM access.log
           GROUP BY cs(User-Agent)
           ORDER BY requests DESC
           LIMIT 5"
```

### Error Trend

```bash
loq -o:CHART -chartType:Line \
          -chartTitle:"Daily Error Count" \
          --ofile:error_trend.png \
          "SELECT date, COUNT(*)
           FROM logs.csv
           WHERE level = 'error'
           GROUP BY date
           ORDER BY date"
```

### Top Endpoints by Response Time

```bash
loq -o:CHART -chartType:Bar \
          -chartTitle:"Slowest Endpoints (Avg Response Time)" \
          --ofile:slow_endpoints.png \
          "SELECT cs-uri-stem, AVG(time-taken)
           FROM access.log
           GROUP BY cs-uri-stem
           ORDER BY AVG(time-taken) DESC
           LIMIT 10"
```

### Bandwidth by Path

```bash
loq -o:CHART -chartType:Pie \
          -chartTitle:"Bandwidth Usage by Path" \
          --ofile:bandwidth.png \
          "SELECT cs-uri-stem, SUM(sc-bytes) AS bytes
           FROM access.log
           GROUP BY cs-uri-stem
           ORDER BY bytes DESC
           LIMIT 8"
```

## PNG vs SVG

| Feature | PNG | SVG |
|---------|-----|-----|
| Format | Raster (pixels) | Vector (paths) |
| Scaling | Pixelated when enlarged | Crisp at any size |
| File size | Larger for complex charts | Smaller usually |
| Best for | Web, documents | Print, presentations |
| Editable | No | Yes (in vector editors) |

### When to Use PNG

- Embedding in documents
- Web display at fixed size
- Quick previews

### When to Use SVG

- Presentations (scales to screen)
- Print materials
- Further editing needed
- Responsive web design

## Best Practices

### Use LIMIT for Readability

Too many categories make charts unreadable:

```bash
# Good: Top 10
SELECT category, COUNT(*) FROM data.csv GROUP BY category ORDER BY COUNT(*) DESC LIMIT 10

# Bad: All categories (might be hundreds)
SELECT category, COUNT(*) FROM data.csv GROUP BY category
```

### Order Data Appropriately

**Bar charts**: Order by value for impact

```sql
ORDER BY COUNT(*) DESC
```

**Line charts**: Order by X-axis value

```sql
ORDER BY date ASC
```

### Use Meaningful Titles

```bash
-chartTitle:"Daily Active Users (January 2024)"
```

### Choose Right Chart Type

| Data Type | Recommended Chart |
|-----------|-------------------|
| Categories (unordered) | Bar |
| Time series | Line |
| Proportions | Pie |
| Rankings | Bar (horizontal ideal) |
| Trends | Line |
| Comparisons | Bar |

## Troubleshooting

### "CHART format requires at least 2 columns"

Ensure query returns 2+ columns:

```sql
-- Fix: add value column
SELECT status, COUNT(*) FROM logs.csv GROUP BY status
```

### "Cannot convert to number"

Second column must be numeric:

```sql
-- Fix: use aggregate or numeric column
SELECT category, SUM(amount) FROM sales.csv GROUP BY category
```

### Chart Too Crowded

Use LIMIT to reduce categories:

```sql
SELECT category, COUNT(*) FROM data.csv
GROUP BY category
ORDER BY COUNT(*) DESC
LIMIT 10
```

### Empty Chart

Verify query returns data:

```bash
# Check data first
loq -o:CSV "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"
```

## Combining with Reports

### Generate Multiple Charts

```bash
# Status code distribution
loq -o:CHART -chartType:Bar --ofile:charts/status.png \
          "SELECT sc-status, COUNT(*) FROM access.log GROUP BY sc-status"

# Hourly traffic
loq -o:CHART -chartType:Line --ofile:charts/hourly.png \
          "SELECT SUBSTR(time,1,2) AS hour, COUNT(*) FROM access.log GROUP BY hour ORDER BY hour"

# Top URLs
loq -o:CHART -chartType:Bar --ofile:charts/top_urls.png \
          "SELECT cs-uri-stem, COUNT(*) FROM access.log GROUP BY cs-uri-stem ORDER BY COUNT(*) DESC LIMIT 10"
```

### Export Data and Chart

```bash
# Export data
loq -o:CSV --ofile:data.csv "SELECT status, COUNT(*) FROM logs.csv GROUP BY status"

# Create chart
loq -o:CHART -chartType:Bar --ofile:chart.png "SELECT * FROM data.csv"
```

## See Also

- [Output Formats Overview](/output-formats/)
- [Aggregation](/sql/aggregation)
- [CSV Output](/output-formats/csv)
