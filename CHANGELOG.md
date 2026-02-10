# Changelog

All notable changes to the loq Claude Code plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-10

### Added
- Initial release of loq Claude Code plugin
- `/loq` command for quick SQL query building and debugging
- `loq-specialist` agent for complex migrations and integrations
- Comprehensive command documentation with:
  - Query building workflow
  - Common query patterns (web server analysis, log filtering, data transformation)
  - MS Log Parser 2.2 migration guide
  - Error handling and troubleshooting
  - Testing guidance
- Specialized agent capabilities:
  - MS Log Parser 2.2 to loq migration (CLI and COM API)
  - VBScript/VB.NET to C# migration
  - .NET integration (Loq.Classic and modern Loq API)
  - FFI integration for Python, Go, Ruby
  - Complex SQL query development (JOINs, CTEs, window functions, UNION)
  - Input/output format expertise (30+ input, 15+ output formats)
  - Query debugging and performance optimization
- Plugin manifest with complete metadata
- Self-hosted marketplace configuration
- Official marketplace submission metadata
- Documentation references to `llm-docs/` directory:
  - REFERENCE.md (feature overview)
  - sql.md (SQL syntax)
  - functions.md (60+ functions)
  - input-formats.md (30+ formats)
  - output-formats.md (15+ formats)
  - cli.md (CLI options)
  - dotnet.md (.NET bindings)
  - ffi.md (C/FFI integration)
- Plugin README with installation and usage instructions
- Asset placeholders for icon and screenshots

### Features
- SQL query building for log analysis
- Support for 30+ input formats (CSV, JSON, W3C, IIS, Syslog, EVTX, PCAP, S3)
- Support for 15+ output formats (CSV, JSON, SQLite, PostgreSQL, Charts)
- Full SQL support (SELECT, JOIN, UNION, CTEs, window functions)
- MS Log Parser 2.2 compatibility and migration support
- Multi-language integration (C#, Python, Go, Ruby)
- Cross-platform support (Windows, macOS, Linux)

## [Unreleased]

### Planned
- Interactive query builder mode
- Query optimization suggestions
- Performance profiling integration
- Extended examples library
- Video tutorials and walkthroughs
- Community-contributed query templates
- Integration with popular logging frameworks
- Real-time query monitoring
- Query history and favorites

---

## Version Numbering

- **MAJOR** version for incompatible API changes or major feature additions
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/chaynes81-ux/loq-releases/issues
- Email: chaynes81@gmail.com

[1.0.0]: https://github.com/chaynes81-ux/loq-releases/releases/tag/v1.0.0
