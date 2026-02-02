# NULL Output Format

Discard output for benchmarking and validation.

## Overview

The NULL output format discards all output, useful for benchmarking query performance without I/O overhead or validating queries without producing files.

## Usage

```bash
loq -o:NULL "SELECT * FROM large_file.csv"
```

## Use Cases

### Benchmark query performance
```bash
# Measure pure query execution time
loq -o:NULL --stats:ON "SELECT * FROM 1gb_file.csv WHERE status = 'error'"
```

### Validate query syntax
```bash
# Check if query runs without errors
loq -o:NULL "SELECT complex, expressions, here FROM data.csv GROUP BY complex"
```

### Test input format parsing
```bash
# Verify file can be parsed without producing output
loq -o:NULL -i:W3C "SELECT * FROM *.log"
```

### Count rows efficiently
```bash
# COUNT(*) with NULL output for pure counting
loq -o:NULL --stats:ON "SELECT COUNT(*) FROM massive.csv"
```

## Notes

- No output is produced
- Use with `--stats:ON` to see execution statistics
- Useful for CI/CD validation pipelines
