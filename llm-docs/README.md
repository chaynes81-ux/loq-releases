# LLM Documentation

Optimized documentation for Large Language Models (LLMs) using Log Parser.

## Purpose

These documents provide concise, structured references optimized for LLM consumption and query generation. They contain:

- Dense, factual information without narrative prose
- Consistent formatting for easy parsing
- Comprehensive coverage in minimal space
- Practical examples for common use cases

## Files

### input-formats.md

Complete reference for all 20+ input formats with:
- Format index with aliases and platform support
- Detailed schema information for each format
- CLI flags and options
- Common column names and types
- Practical query examples
- Quick selection guide by use case

**Use this for**: Generating correct queries, understanding available columns, selecting appropriate formats.

## Design Principles

1. **Scan-friendly**: Quick index at top, detailed sections below
2. **Example-driven**: Every format includes working examples
3. **Complete**: All 20+ formats documented
4. **Practical**: Focus on real-world usage patterns
5. **Reference-style**: Optimized for lookup, not learning

## Target Audience

- LLM systems generating Log Parser queries
- Automated query construction tools
- Code generation assistants
- API/CLI integrations

## Maintenance

Keep synchronized with:
- `/docs/input-formats/*.md` - Human-readable documentation
- `/formats/src/*.rs` - Implementation source code
- `/CLAUDE.md` - Project overview

When adding new formats or changing schemas, update this directory first.
