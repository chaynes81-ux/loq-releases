# TEXTWORD / WORD

Word-by-word text file parsing with position tracking.

## Overview

The TEXTWORD format parses text files word by word, providing detailed position information for each token. This is useful for analyzing unstructured text data, performing word frequency analysis, and tracking word positions in documents.

## Usage

```bash
# Basic word parsing
loq -i:TEXTWORD "SELECT * FROM document.txt"
loq -i:WORD "SELECT * FROM book.txt"
```

## Schema

The TEXTWORD format provides the following columns for each word:

| Field | Type | Description |
|-------|------|-------------|
| Word | STRING | The word/token text |
| Line | INTEGER | Line number where the word appears (1-based) |
| WordIndex | INTEGER | Word position within the line (1-based) |
| Position | INTEGER | Character offset in the file (0-based) |

## Features

- **Word-Level Parsing**: Each word becomes a separate row
- **Position Tracking**: Precise character-level position information
- **Line Context**: Track which line each word appears on
- **Word Index**: Know the position of each word within its line
- **Whitespace Handling**: Multiple spaces/tabs treated as single delimiter
- **Empty Line Handling**: Empty or whitespace-only lines are skipped

## Word Boundaries

Words are delimited by any whitespace character:
- Space (` `)
- Tab (`\t`)
- Newline (`\n`)
- Carriage return (`\r`)

Multiple consecutive whitespace characters are treated as a single delimiter. Punctuation attached to words is included as part of the word (e.g., "hello," becomes the word "hello,").

## Options

| Option | Description |
|--------|-------------|
| `-i:TEXTWORD` | Select TEXTWORD format |
| `-i:WORD` | Alias for TEXTWORD |

## Examples

### Basic Word Extraction

```bash
# Extract all words from a file
loq -i:TEXTWORD "SELECT Word FROM document.txt"

# View first 100 words
loq -i:WORD "SELECT Word FROM book.txt LIMIT 100"

# Get all unique words
loq -i:TEXTWORD "SELECT DISTINCT Word FROM text.txt ORDER BY Word"
```

### Word Frequency Analysis

```bash
# Count word frequency (case-insensitive)
loq -i:TEXTWORD "SELECT 
    LOWER(Word) AS word, 
    COUNT(*) AS frequency 
FROM book.txt 
GROUP BY LOWER(Word) 
ORDER BY frequency DESC 
LIMIT 20"

# Find most common words on specific lines
loq -i:WORD "SELECT 
    LOWER(Word) AS word,
    COUNT(*) AS count
FROM document.txt
WHERE Line BETWEEN 10 AND 50
GROUP BY LOWER(Word)
ORDER BY count DESC"
```

### Position-Based Queries

```bash
# Find words at specific positions
loq -i:TEXTWORD "SELECT Word, Line FROM text.txt WHERE WordIndex = 1"

# Find the first word on each line
loq -i:WORD "SELECT Line, Word FROM document.txt WHERE WordIndex = 1"

# Find words near the start of the file
loq -i:TEXTWORD "SELECT * FROM text.txt WHERE Position < 1000"
```

### Pattern Matching

```bash
# Find words starting with specific prefix
loq -i:WORD "SELECT * FROM text.txt WHERE Word LIKE 'error%'"

# Find words ending with specific suffix
loq -i:TEXTWORD "SELECT Word, Line FROM log.txt WHERE Word LIKE '%ing'"

# Find words containing specific pattern
loq -i:WORD "SELECT DISTINCT Word FROM text.txt WHERE Word LIKE '%test%'"
```

### Line-Based Analysis

```bash
# Count words per line
loq -i:TEXTWORD "SELECT 
    Line, 
    COUNT(*) AS word_count 
FROM document.txt 
GROUP BY Line 
ORDER BY word_count DESC"

# Find lines with specific word count
loq -i:WORD "SELECT 
    Line, 
    COUNT(*) AS words 
FROM text.txt 
GROUP BY Line 
HAVING words > 10"

# Get average words per line
loq -i:TEXTWORD "SELECT AVG(word_count) AS avg_words_per_line
FROM (
    SELECT Line, COUNT(*) AS word_count 
    FROM document.txt 
    GROUP BY Line
)"
```

### Text Statistics

```bash
# Total word count
loq -i:TEXTWORD "SELECT COUNT(*) AS total_words FROM book.txt"

# Count unique words
loq -i:WORD "SELECT COUNT(DISTINCT Word) AS unique_words FROM text.txt"

# Average word length
loq -i:TEXTWORD "SELECT AVG(STRLEN(Word)) AS avg_length FROM document.txt"

# Find longest words
loq -i:WORD "SELECT 
    Word, 
    STRLEN(Word) AS length 
FROM text.txt 
ORDER BY length DESC 
LIMIT 10"
```

### Output Formats

```bash
# Export word frequency to JSON
loq -i:TEXTWORD -o:JSON "SELECT 
    LOWER(Word) AS word, 
    COUNT(*) AS count 
FROM book.txt 
GROUP BY LOWER(Word)"

# Format as table
loq -i:WORD -o:DATAGRID "SELECT * FROM text.txt LIMIT 20"

# Save to SQLite
loq -i:TEXTWORD -o:SQLITE --ofile:words.db "SELECT * FROM document.txt"

# Export to CSV
loq -i:WORD -o:CSV "SELECT Word, Line, WordIndex FROM text.txt"
```

## Use Cases

### Text Analysis

```bash
# Find all occurrences of a specific word
loq -i:TEXTWORD "SELECT Line, WordIndex, Position 
FROM document.txt 
WHERE LOWER(Word) = 'important'"

# Build a word concordance
loq -i:WORD "SELECT 
    Word,
    Line,
    WordIndex
FROM book.txt
WHERE LOWER(Word) IN ('love', 'hate', 'fear', 'hope')
ORDER BY Word, Line"
```

### Log File Analysis

```bash
# Find error keywords in logs
loq -i:TEXTWORD "SELECT DISTINCT Line, Word 
FROM app.log 
WHERE Word IN ('ERROR', 'FATAL', 'CRITICAL')"

# Count error types
loq -i:WORD "SELECT 
    Word AS error_type,
    COUNT(*) AS occurrences
FROM error.log
WHERE Word LIKE 'ERR_%'
GROUP BY Word
ORDER BY occurrences DESC"
```

### Content Search

```bash
# Find lines containing specific words
loq -i:TEXTWORD "SELECT DISTINCT Line 
FROM document.txt 
WHERE LOWER(Word) = 'search term'"

# Find adjacent words (using window functions)
loq -i:WORD "SELECT 
    Word AS current_word,
    LEAD(Word) OVER (ORDER BY Position) AS next_word,
    Line
FROM text.txt
WHERE LOWER(Word) = 'the'"
```

### Vocabulary Analysis

```bash
# List all words alphabetically
loq -i:TEXTWORD "SELECT DISTINCT LOWER(Word) AS word 
FROM book.txt 
ORDER BY word"

# Find rare words (appearing only once)
loq -i:WORD "SELECT Word 
FROM text.txt 
GROUP BY LOWER(Word) 
HAVING COUNT(*) = 1"

# Calculate vocabulary richness (unique words / total words)
loq -i:TEXTWORD "SELECT 
    COUNT(DISTINCT LOWER(Word)) * 1.0 / COUNT(*) AS richness
FROM document.txt"
```

## Performance Notes

- **Streaming**: Files are processed line by line, not loaded entirely into memory
- **Large Files**: Efficiently handles multi-gigabyte text files
- **Position Tracking**: Character position tracking has minimal overhead
- **Memory Usage**: Only the current line is held in memory

### Performance Tips

```bash
# Good: Filter early to reduce data
loq -i:TEXTWORD "SELECT Word FROM huge.txt WHERE Word LIKE 'ERROR%'"

# Good: Use LIMIT during exploration
loq -i:WORD "SELECT * FROM large.txt LIMIT 1000"

# Good: Case-insensitive grouping for frequency analysis
loq -i:TEXTWORD "SELECT LOWER(Word), COUNT(*) 
FROM text.txt 
GROUP BY LOWER(Word)"

# Better: Use specific filters to reduce processing
loq -i:WORD "SELECT Word FROM text.txt WHERE Line < 100"
```

## Comparison with Other Formats

### When to Use TEXTWORD

- Word frequency analysis
- Building concordances or indexes
- Finding specific words with position information
- Analyzing unstructured text documents
- Creating word-based statistics

### When to Use Other Formats

| Format | Use Instead Of TEXTWORD When... |
|--------|--------------------------------|
| TEXTLINE | Need line-level parsing without word splitting |
| CSV | Data is structured with delimiters |
| JSON | Data is in JSON format |
| W3C/NCSA | Processing web server logs |
| SYSLOG | Processing system logs |

## Notes

- **Punctuation**: Punctuation attached to words is included (e.g., "hello," is one word)
- **Empty Lines**: Lines containing only whitespace are skipped
- **Line Endings**: Both Unix (`\n`) and Windows (`\r\n`) line endings are supported
- **Unicode**: Full Unicode support for word characters
- **Word Index**: Resets to 1 for each new line
- **Position**: Character position is cumulative across the entire file

## Library Usage

For programmatic access, use the `TextWordInput` type:

```rust
use logparser_formats::TextWordInput;
use logparser_core::InputFormat;

// Open a text file
let mut input = TextWordInput::open("document.txt").unwrap();

// Schema: [Word, Line, WordIndex, Position]
let schema = input.schema();

// Read words
while let Some(row) = input.next_row().unwrap() {
    let word = row.get(0);        // Word text
    let line = row.get(1);        // Line number
    let word_idx = row.get(2);    // Word index in line
    let position = row.get(3);    // Character position
    
    println!("{:?} at line {} position {}", word, line, position);
}
```

## See Also

- [Input Formats Overview](/input-formats/)
- [TEXTLINE Format](/input-formats/textline) - Line-oriented parsing
- [CSV Format](/input-formats/csv) - Structured CSV parsing
- [JSON Format](/input-formats/json) - JSON document parsing
- [String Functions](/functions/string) - Text manipulation functions
