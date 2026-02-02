# NAT / NATIVE Format

High-performance native binary format for data re-ingestion.

## Overview

The NATIVE format is a compact binary format optimized for fast writing and reading. Use it for intermediate storage when processing data in multiple stages.

## Usage

### Output to native format
```bash
loq -o:NAT "SELECT * FROM large_dataset.csv" --ofile:intermediate.nat
```

### Read native format
```bash
loq -i:NAT "SELECT * FROM intermediate.nat WHERE status = 'active'"
```

## Benefits

- **Speed**: Faster than CSV/JSON for large datasets
- **Types preserved**: No type inference on re-read
- **Compact**: Binary encoding reduces file size
- **Schema included**: Column names and types stored in file

## Examples

### Two-stage processing
```bash
# Stage 1: Filter and save
loq -o:NAT "SELECT * FROM huge.csv WHERE region = 'US'" --ofile:us_data.nat

# Stage 2: Aggregate from filtered data
loq -i:NAT "SELECT state, SUM(sales) FROM us_data.nat GROUP BY state"
```

### Pipeline processing
```bash
loq -o:NAT "SELECT * FROM raw/*.log" --ofile:combined.nat
loq -i:NAT -o:JSON "SELECT * FROM combined.nat" > final.json
```

## Notes

- Binary format - not human readable
- Platform-independent
- Use for intermediate processing, not long-term storage
