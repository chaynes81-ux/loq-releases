# Character Encoding (Codepage) Options

This page documents the character encoding options for reading and writing files in different encodings.

## Overview

By default, loq assumes files are encoded in UTF-8. However, many legacy systems produce files in other encodings such as Windows-1252 (common in Western European Windows systems) or UTF-16 (common for Windows-generated text files with Unicode content).

The codepage options allow you to:

- **Read files** in non-UTF-8 encodings using `-iCodepage`
- **Write files** in non-UTF-8 encodings using `-oCodepage`

::: tip When to Use Codepage Options
- Reading CSV/TSV files exported from older Windows applications
- Processing files containing accented characters (e.g., cafe vs cafe)
- Working with files from international systems
- Outputting files for legacy systems that require specific encodings
:::

## Supported Encodings

| Encoding | Aliases | Code Page | Description |
|----------|---------|-----------|-------------|
| UTF-8 | `UTF8`, `65001` | 65001 | Unicode 8-bit (default) |
| UTF-16LE | `UTF-16`, `UTF16LE`, `1200` | 1200 | Unicode 16-bit Little Endian |
| UTF-16BE | `UTF16BE`, `1201` | 1201 | Unicode 16-bit Big Endian |
| Windows-1252 | `CP1252`, `1252` | 1252 | Western European (Windows) |
| ISO-8859-1 | `Latin1`, `28591` | 28591 | Latin-1 (Western European) |

::: info Encoding Names Are Case-Insensitive
`UTF-8`, `utf-8`, `UTF8`, and `utf8` are all equivalent.
:::

## Input Codepage (-iCodepage)

Specifies the character encoding for reading input files.

### Syntax

```bash
loq -iCodepage:ENCODING "SELECT * FROM file.csv"
```

### Examples

Read a Windows-1252 encoded CSV file:

```bash
loq -i:CSV -iCodepage:Windows-1252 "SELECT * FROM legacy_data.csv"
```

Read a UTF-16LE encoded file (common for Windows exports):

```bash
loq -i:CSV -iCodepage:UTF-16LE "SELECT * FROM windows_export.csv"
```

Read using numeric code page identifier:

```bash
loq -i:CSV -iCodepage:1252 "SELECT * FROM european_data.csv"
```

### Supported Input Formats

Codepage support is currently available for:

- **CSV** - Comma-separated values
- **TSV** - Tab-separated values

Other input formats (JSON, XML, W3C, etc.) use UTF-8 encoding.

## Output Codepage (-oCodepage)

Specifies the character encoding for writing output files.

### Syntax

```bash
loq -oCodepage:ENCODING -o:FORMAT --ofile:PATH "SELECT * FROM file.csv"
```

### Examples

Write output in UTF-16LE encoding (useful for Excel on Windows):

```bash
loq -o:CSV -oCodepage:UTF-16LE --ofile:output.csv "SELECT * FROM data.csv"
```

Write output in Windows-1252 for legacy systems:

```bash
loq -o:CSV -oCodepage:Windows-1252 --ofile:legacy_output.csv "SELECT * FROM data.csv"
```

Write UTF-16 with BOM for maximum Windows compatibility:

```bash
loq -o:CSV -oCodepage:UTF-16 --ofile:windows_compatible.csv "SELECT * FROM data.csv"
```

## Common Use Cases

### Reading Legacy Windows Files

Many enterprise systems export data in Windows-1252 encoding. Characters like the Euro sign, curly quotes, and certain accented characters will appear corrupted if read as UTF-8:

```bash
# Incorrect: reading Windows-1252 as UTF-8 shows garbled characters
loq "SELECT * FROM sales_report.csv"

# Correct: specify the actual encoding
loq -iCodepage:Windows-1252 "SELECT * FROM sales_report.csv"
```

### Excel Compatibility

Microsoft Excel often creates UTF-16LE files when saving as "Unicode Text":

```bash
# Read Excel Unicode export
loq -i:TSV -iCodepage:UTF-16LE "SELECT * FROM excel_export.txt"
```

To create files that Excel reads correctly with international characters:

```bash
# Write UTF-16LE CSV for Excel
loq -o:CSV -oCodepage:UTF-16LE --ofile:for_excel.csv "SELECT * FROM data.csv"
```

### Converting Between Encodings

Use loq to convert files from one encoding to another:

```bash
# Convert Windows-1252 to UTF-8
loq -iCodepage:Windows-1252 -oCodepage:UTF-8 --ofile:modern.csv \
    "SELECT * FROM legacy.csv"

# Convert UTF-8 to UTF-16LE
loq -oCodepage:UTF-16LE --ofile:unicode.csv \
    "SELECT * FROM utf8_data.csv"
```

### Processing International Data

For files with accented characters or special symbols:

```bash
# French data with accents (e, a, u, etc.)
loq -iCodepage:Windows-1252 \
    "SELECT nom, prenom, departement FROM clients.csv WHERE pays = 'France'"

# German data with umlauts (a, o, u, ss)
loq -iCodepage:Windows-1252 \
    "SELECT name, strasse, stadt FROM kunden.csv"
```

## Technical Details

### BOM Handling

**Byte Order Mark (BOM)** is a special character at the beginning of a file that indicates its encoding:

| Encoding | BOM Bytes |
|----------|-----------|
| UTF-8 | `EF BB BF` |
| UTF-16LE | `FF FE` |
| UTF-16BE | `FE FF` |

- **Reading:** UTF-16 BOMs are automatically detected and handled
- **Writing:** UTF-16 output includes the appropriate BOM for compatibility

### Internal Processing

All internal string processing uses UTF-8:

1. **Input:** Files are decoded from their source encoding to UTF-8
2. **Processing:** All SQL operations work on UTF-8 strings
3. **Output:** Results are encoded from UTF-8 to the target encoding

This architecture ensures consistent behavior regardless of input/output encodings.

### Performance

Character encoding conversion adds minimal overhead:

| Encoding | Overhead |
|----------|----------|
| UTF-8 | None (native) |
| UTF-16 | ~5-10% |
| Windows-1252 | ~3-5% |
| ISO-8859-1 | ~3-5% |

## Error Handling

### Unsupported Encoding

If you specify an unsupported encoding:

```
error: Unsupported codepage 'XYZ'. Supported: UTF-8, UTF-16LE, UTF-16BE, Windows-1252, ISO-8859-1
```

### Invalid Data

If a file contains invalid data for the specified encoding:

```
error: Failed to parse CSV file 'data.csv': Encoding error at byte offset 1234
```

This typically means the file is in a different encoding than specified. Try other common encodings like UTF-8, Windows-1252, or UTF-16LE.

## MS Log Parser 2.2 Compatibility

The `-iCodepage` and `-oCodepage` options maintain compatibility with Microsoft Log Parser 2.2:

| Feature | Log Parser 2.2 | loq |
|---------|----------------|-----|
| `-iCodepage:CP` | Supported | Supported |
| `-oCodepage:CP` | Supported | Supported |
| Numeric code pages | Supported | Supported |
| Named encodings | Limited | Extended |

### Differences

- **Extended names:** loq supports additional encoding aliases (e.g., `Latin1`, `CP1252`)
- **Case insensitivity:** loq accepts any case for encoding names
- **UTF-16 handling:** loq automatically handles BOM detection for UTF-16 files

## Testing Encoding Support

### Verify Input Encoding

Create a test file with known encoding:

```bash
# Create a Windows-1252 file with special characters
echo "name,description" | iconv -f UTF-8 -t WINDOWS-1252 > test.csv
echo "Cafe,Cafe Francais" | iconv -f UTF-8 -t WINDOWS-1252 >> test.csv

# Read with correct encoding
loq -iCodepage:Windows-1252 "SELECT * FROM test.csv"
```

### Verify Output Encoding

```bash
# Write UTF-16LE output
loq -oCodepage:UTF-16LE --ofile:output.csv "SELECT 'Hello World' as greeting"

# Verify the encoding with file command
file output.csv
# Should show: UTF-16 Unicode text
```

## See Also

- [CLI Options Reference](/cli/options) - Complete CLI options
- [CSV Input Format](/input-formats/csv) - CSV-specific options
- [TSV Input Format](/input-formats/tsv) - TSV-specific options
