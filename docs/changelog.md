# Changelog

All notable changes to loq will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

::: tip GitHub Releases
For the authoritative release history, including downloadable binaries and detailed release notes, see the [GitHub Releases](https://github.com/chaynes81-ux/loq/releases) page.
:::

---

## [Unreleased]

### Added

- _Upcoming features will be documented here_

### Changed

- _Upcoming changes will be documented here_

### Fixed

- _Upcoming fixes will be documented here_

---

## [0.1.0] - 2024-01-15

Initial release of loq, a cross-platform SQL-based log analysis tool and modern replacement for Microsoft Log Parser 2.2.

### Added

#### SQL Support

- Full `SELECT` statement support with column selection and `*` wildcard
- `WHERE` clause with comparison operators (`=`, `!=`, `<`, `>`, `<=`, `>=`)
- Logical operators (`AND`, `OR`, `NOT`) and parenthesized expressions
- `BETWEEN`, `IN`, `LIKE`, `IS NULL`, `IS NOT NULL` predicates
- `DISTINCT` keyword for duplicate removal
- `LIMIT` clause for result limiting
- `GROUP BY` with single and multiple columns
- `HAVING` clause for aggregate filtering
- `ORDER BY` with `ASC`/`DESC` and multiple columns
- `INNER JOIN`, `LEFT JOIN`, and `CROSS JOIN` support
- `UNION` and `UNION ALL` for combining result sets
- Scalar, `IN`, and `EXISTS` subqueries
- `CASE WHEN` expressions (simple and searched forms)
- Window functions:
  - Ranking: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`
  - Aggregates: `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()` with `OVER` clause
  - Navigation: `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`
  - Full `PARTITION BY` and `ORDER BY` support in window specifications

#### SQL Functions

- **String functions**: `UPPER`, `LOWER`, `SUBSTR`, `REPLACE`, `TRIM`, `LTRIM`, `RTRIM`, `STRLEN`, `CONCAT`, `EXTRACT_PREFIX`, `EXTRACT_SUFFIX`
- **Math functions**: `ROUND`, `FLOOR`, `CEIL`, `ABS`, `MOD`, `POWER`, `SQRT`
- **Date/Time functions**: `TO_TIMESTAMP`, `TO_DATE`, `TO_TIME`, `EXTRACT`, `NOW`, `DATE_ADD`, `DATE_DIFF`, `QUANTIZE`
- **Conditional functions**: `COALESCE`, `NULLIF`, `IF`
- **Network functions**: `REVERSEDNS`
- **Aggregate functions**: `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`, `GROUP_CONCAT`, `PROPCOUNT`, `PROPSUM`
- **Row number functions**: `IN_ROW_NUMBER`, `OUT_ROW_NUMBER`, `SEQUENCE`, `HASHSEQ`

#### Input Formats (20+)

- **CSV** - Comma-separated values with automatic type inference
- **TSV** - Tab-separated values
- **JSON / NDJSON** - JSON arrays and newline-delimited JSON with nested field flattening
- **XML** - XML documents with configurable row element and schema detection
- **W3C / IISW3C** - IIS W3C extended log format
- **IIS / IISNATIVE** - IIS native log format (fixed 15-field schema)
- **BIN / IISBIN** - IIS Centralized Binary Logging (.ibl files)
- **HTTPERR** - HTTP.sys error logs
- **URLSCAN** - URLScan security logs
- **NCSA / APACHE / NGINX** - NCSA Common and Apache Combined log format
- **TEXTLINE / TEXT** - Line-by-line parsing with optional regex extraction
- **TEXTWORD / WORD** - Word-by-word parsing with position tracking
- **SYSLOG** - Syslog RFC 3164 (BSD) and RFC 5424 formats
- **EVTX / EVT** - Windows Event Log files (cross-platform)
- **REG / REGISTRY** - Windows Registry .reg files (cross-platform)
- **PCAP / NETMON / CAP** - Network capture files (cross-platform)
- **ETW** - Event Tracing for Windows (Windows only)
- **ADS** - Active Directory queries (Windows only)
- **FS / FILESYSTEM** - File and directory metadata queries
- **S3** - Amazon S3 object storage with glob patterns and compression support
- **Parquet** - Apache Parquet columnar storage format

#### Output Formats (14+)

- **CSV** - Comma-separated values to stdout or file
- **TSV** - Tab-separated values
- **JSON / NDJSON** - JSON objects (NDJSON mode by default)
- **XML** - XML with configurable element or attribute styles
- **DATAGRID / TABLE / GRID** - Formatted ASCII tables for terminal display
- **SQLite / SQL** - SQLite database output
- **PostgreSQL** - PostgreSQL via connection string
- **MySQL** - MySQL via connection parameters
- **SYSLOG** - Syslog via UDP/TCP
- **ODBC** - ODBC/MS Access (Windows only)
- **CHART** - Chart visualization (Bar, Line, Pie) as PNG/SVG
- **CloudWatch** - AWS CloudWatch Logs integration
- **Template** - Custom output using template syntax

#### REST API Server

- HTTP server for executing SQL queries over REST API
- JSON request/response format
- Query execution statistics (rows scanned, returned, execution time)
- Health check endpoint
- CORS support for web applications
- Structured logging with tracing

#### CLI Compatibility

- Full CLI syntax compatibility with Microsoft Log Parser 2.2
- `-i:FORMAT` and `-o:FORMAT` option syntax
- Support for all original command-line options
- Drop-in replacement for existing Log Parser scripts

#### Performance

- Built in Rust for memory safety and performance
- 64KB I/O buffers for optimized file reading
- Pre-allocated vectors to eliminate reallocations
- Fast-path type parsing with length-based matching
- Single-pass type inference for CSV files
- 2-5x throughput improvement over baseline implementations

#### Cross-Platform Support

- Windows (x64, ARM64)
- macOS (Intel, Apple Silicon)
- Linux (x64, ARM64)

#### Containerization

- Official Docker image with multi-stage builds
- Kubernetes deployment manifests
- Helm chart support
- Volume mounting for local file access

### Security

- Input validation for SQL queries to prevent injection attacks
- Sandboxed file access within specified directories
- No network access from query execution context by default

---

## Version History Format

Each version entry follows this structure:

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Features that will be removed in upcoming releases
- **Removed** - Features removed in this release
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

---

[Unreleased]: https://github.com/chaynes81-ux/loq/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/chaynes81-ux/loq/releases/tag/v0.1.0
