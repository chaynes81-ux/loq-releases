# Benchmarking

loq includes a comprehensive benchmark suite for measuring and comparing performance.

## Quick Start

### Generate Test Data

```bash
cargo run --release -p loq-benches --bin generate_data
```

This creates test files in `benches/data/`:
- CSV files (100, 10K, 100K rows)
- JSON files
- W3C log files
- XML files

### Run All Benchmarks

```bash
cargo bench -p loq-benches
```

### View Results

```bash
open target/criterion/report/index.html
```

## Benchmark Suites

### Parsing Benchmarks

Test input format parsing performance:

```bash
cargo bench -p loq-benches --bench parsing
```

Includes:
- CSV parsing (100, 10K, 100K rows)
- CSV type inference
- JSON/NDJSON parsing
- W3C log parsing
- XML parsing

### Execution Benchmarks

Test query execution performance:

```bash
cargo bench -p loq-benches --bench execution
```

Includes:
- SELECT * queries
- WHERE clause filtering
- Aggregate functions (COUNT, SUM, AVG, MAX, MIN)
- GROUP BY (single/multiple columns)
- ORDER BY sorting
- DISTINCT deduplication

### End-to-End Benchmarks

Test complete query pipeline:

```bash
cargo bench -p loq-benches --bench end_to_end
```

Includes:
- SQL parsing
- Complete query execution
- Complex queries (WHERE + GROUP BY + HAVING + ORDER BY)

## Running Specific Benchmarks

### By Suite

```bash
cargo bench -p loq-benches --bench parsing
cargo bench -p loq-benches --bench execution
cargo bench -p loq-benches --bench end_to_end
```

### By Name Pattern

```bash
# All CSV benchmarks
cargo bench -p loq-benches -- csv

# All GROUP BY benchmarks
cargo bench -p loq-benches -- group_by

# Specific benchmark
cargo bench -p loq-benches -- "parse_csv_10k"
```

## Comparing Results

### Baseline Comparison

```bash
# Save baseline
cargo bench -p loq-benches -- --save-baseline main

# Make changes, then compare
cargo bench -p loq-benches -- --baseline main
```

### Output Formats

```bash
# Verbose output
cargo bench -p loq-benches -- --verbose

# JSON output
cargo bench -p loq-benches -- --format json

# No plots (faster)
cargo bench -p loq-benches -- --noplot
```

## Writing Custom Benchmarks

### Using Criterion

```rust
use criterion::{criterion_group, criterion_main, Criterion, BenchmarkId};

fn my_benchmark(c: &mut Criterion) {
    c.bench_function("my_operation", |b| {
        b.iter(|| {
            // Code to benchmark
            my_function()
        })
    });
}

fn parameterized_benchmark(c: &mut Criterion) {
    let sizes = [100, 1000, 10000];

    for size in sizes {
        c.bench_with_input(
            BenchmarkId::new("operation", size),
            &size,
            |b, &size| {
                let data = generate_data(size);
                b.iter(|| process(&data))
            }
        );
    }
}

criterion_group!(benches, my_benchmark, parameterized_benchmark);
criterion_main!(benches);
```

### Benchmark File Structure

```rust
// benches/my_bench.rs
use criterion::{criterion_group, criterion_main, Criterion};
use loq_core::{parse_query, execute};

fn bench_my_feature(c: &mut Criterion) {
    // Setup
    let data = load_test_data();

    c.bench_function("my_feature", |b| {
        b.iter(|| {
            // Benchmarked operation
            execute(&data)
        })
    });
}

criterion_group!(benches, bench_my_feature);
criterion_main!(benches);
```

Add to `Cargo.toml`:

```toml
[[bench]]
name = "my_bench"
harness = false
```

## Interpreting Results

### Criterion Output

```
parse_csv_10k           time:   [1.2345 ms 1.2456 ms 1.2567 ms]
                        change: [-5.1234% -4.5678% -3.9012%] (p = 0.00 < 0.05)
                        Performance has improved.
```

- `time`: [lower bound, estimate, upper bound]
- `change`: comparison to baseline
- `p`: statistical significance

### HTML Report

The HTML report at `target/criterion/report/index.html` shows:

- Performance over time
- Distribution plots
- Comparison to baseline
- Outlier analysis

## Performance Testing Best Practices

### 1. Use Release Builds

```bash
# Always benchmark with optimizations
cargo bench -p loq-benches
# NOT: cargo bench --debug
```

### 2. Minimize System Noise

```bash
# Close other applications
# Disable CPU frequency scaling if possible
# Run multiple iterations (Criterion does this automatically)
```

### 3. Use Representative Data

- Test with realistic file sizes
- Include edge cases (empty files, huge files)
- Test with actual production data formats

### 4. Isolate What You're Testing

```rust
// Bad: includes data generation in benchmark
c.bench_function("bad", |b| {
    b.iter(|| {
        let data = generate_large_data();  // This is measured!
        process(&data)
    })
});

// Good: generate data outside iteration
c.bench_function("good", |b| {
    let data = generate_large_data();  // Setup, not measured
    b.iter(|| process(&data))
});
```

### 5. Use Black Box

Prevent compiler from optimizing away results:

```rust
use criterion::black_box;

c.bench_function("example", |b| {
    b.iter(|| {
        black_box(compute_result())
    })
});
```

## Profiling

### CPU Profiling with Flamegraph

```bash
# Install
cargo install flamegraph

# Generate flamegraph
cargo flamegraph --bench parsing -- --bench "parse_csv_100k"
```

### Memory Profiling

```bash
# Using Valgrind (Linux)
valgrind --tool=massif target/release/loq "SELECT * FROM data.csv"
ms_print massif.out.*

# Using heaptrack (Linux)
heaptrack target/release/loq "SELECT * FROM data.csv"
heaptrack_gui heaptrack.loq.*.gz
```

### perf (Linux)

```bash
# Record
perf record -g target/release/loq "SELECT * FROM huge.csv"

# Report
perf report
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Benchmarks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-action@stable

      - name: Generate test data
        run: cargo run --release -p loq-benches --bin generate_data

      - name: Run benchmarks
        run: cargo bench -p loq-benches -- --noplot

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: target/criterion/
```

## Benchmark Results Archive

Store benchmark results for tracking performance over time:

```bash
# Save results with timestamp
mkdir -p benchmark_history
cp -r target/criterion benchmark_history/$(date +%Y%m%d_%H%M%S)

# Compare with historical baseline
cargo bench -p loq-benches -- --baseline historical
```

## See Also

- [Performance Guide](/performance/)
- [CLI Reference](/cli/)
- [Input Formats](/input-formats/)
