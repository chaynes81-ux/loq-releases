# FIXEDWIDTH Format

Parse fixed-width/columnar text files with defined field positions.

## Overview

The FIXEDWIDTH format reads text files where fields occupy fixed character positions, common in legacy systems and mainframe exports.

## Usage

```bash
loq -i:FIXEDWIDTH --iFieldDef "name:0-19,age:20-23,city:24-" "SELECT * FROM data.txt"
```

## Field Definition Syntax

The `--iFieldDef` option defines fields as: `name:start-end` separated by commas.

- `name:0-9` - Characters 0-9 (10 chars)
- `name:10-` - Character 10 to end of line
- `name:5-5` - Single character at position 5

## Examples

### Basic fixed-width parsing
```bash
loq -i:FIXEDWIDTH --iFieldDef "id:0-4,name:5-24,amount:25-34" "SELECT * FROM ledger.txt"
```

### Filter fixed-width data
```bash
loq -i:FIXEDWIDTH --iFieldDef "code:0-3,desc:4-29,qty:30-35" \
  "SELECT * FROM inventory.txt WHERE qty > 100"
```

### Mainframe COBOL output
```bash
loq -i:FIXEDWIDTH --iFieldDef "acct:0-9,name:10-39,balance:40-51" \
  "SELECT acct, name, balance FROM accounts.dat WHERE balance > 1000"
```

## Notes

- Field positions are 0-indexed
- Trailing spaces are trimmed by default
- Use exact positions from your data layout documentation
