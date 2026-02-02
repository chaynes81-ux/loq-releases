# Filesystem

Query file and directory metadata using SQL.

## Usage

```bash
loq -i:FS "SELECT * FROM '/path/to/directory'"
loq -i:FILESYSTEM "SELECT * FROM '.'"
```

Both `-i:FS` and `-i:FILESYSTEM` work identically.

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `Name` | String | File or directory name |
| `Path` | String | Full absolute path |
| `Size` | Integer | Size in bytes |
| `Extension` | String | File extension (without dot) |
| `IsDirectory` | Boolean | True if directory |
| `IsReadOnly` | Boolean | True if read-only |
| `IsHidden` | Boolean | True if hidden |
| `Created` | DateTime | Creation timestamp |
| `LastModified` | DateTime | Last modification timestamp |
| `LastAccessed` | DateTime | Last access timestamp |

## Examples

### List Files in Directory

```bash
loq -i:FS "SELECT Name, Size, LastModified FROM '.'"
```

### Filter by Extension

```bash
loq -i:FS "SELECT Name, Size FROM '.'
                 WHERE Extension = 'log'"
```

### Find Large Files

```bash
loq -i:FS "SELECT Name, Size FROM '/home'
                 WHERE Size > 1000000
                 ORDER BY Size DESC
                 LIMIT 20"
```

### Find Recent Files

```bash
loq -i:FS "SELECT Name, LastModified FROM '.'
                 ORDER BY LastModified DESC
                 LIMIT 20"
```

### Directories Only

```bash
loq -i:FS "SELECT Name, Path FROM '.'
                 WHERE IsDirectory = true"
```

### Files Only

```bash
loq -i:FS "SELECT Name, Size FROM '.'
                 WHERE IsDirectory = false"
```

## Recursive Traversal

### Single Level Deep

```bash
loq -i:FS -recurse:1 "SELECT * FROM '.'"
```

### Multiple Levels

```bash
loq -i:FS -recurse:3 "SELECT * FROM '/var/log'"
```

### Unlimited Depth

```bash
loq -i:FS -recurse:-1 "SELECT * FROM '.'"
```

::: warning
Be careful with unlimited recursion on large directory trees.
:::

## Wildcards and Patterns

### Glob Patterns

```bash
# All .log files
loq -i:FS "SELECT * FROM '*.log'"

# All files starting with 'app'
loq -i:FS "SELECT * FROM 'app*'"

# All .txt files in logs directory
loq -i:FS "SELECT * FROM 'logs/*.txt'"
```

### With Recursion

```bash
# Find all Python files recursively
loq -i:FS -recurse:5 "SELECT Name, Path FROM '.'
                            WHERE Extension = 'py'"
```

## Common Patterns

### Disk Usage by Extension

```bash
loq -i:FS -recurse:3 "SELECT Extension, COUNT(*) AS count, SUM(Size) AS total_bytes
                            FROM '.'
                            WHERE IsDirectory = false
                            GROUP BY Extension
                            ORDER BY total_bytes DESC
                            LIMIT 20"
```

### Find Old Files

```bash
# Files not modified in 30 days
loq -i:FS -recurse:2 "SELECT Name, Path, LastModified
                            FROM '.'
                            WHERE IsDirectory = false
                            ORDER BY LastModified ASC
                            LIMIT 50"
```

### Find Empty Files

```bash
loq -i:FS -recurse:2 "SELECT Name, Path FROM '.'
                            WHERE Size = 0
                              AND IsDirectory = false"
```

### Find Hidden Files

```bash
loq -i:FS -recurse:2 "SELECT Name, Path FROM '.'
                            WHERE IsHidden = true"
```

### File Count by Directory

```bash
loq -i:FS -recurse:1 "SELECT Path, COUNT(*) AS count
                            FROM '.'
                            WHERE IsDirectory = true
                            GROUP BY Path"
```

### Duplicate File Names

```bash
loq -i:FS -recurse:3 "SELECT Name, COUNT(*) AS count
                            FROM '.'
                            WHERE IsDirectory = false
                            GROUP BY Name
                            HAVING COUNT(*) > 1
                            ORDER BY count DESC"
```

### Total Directory Size

```bash
loq -i:FS -recurse:-1 "SELECT SUM(Size) AS total_bytes
                             FROM '/var/log'
                             WHERE IsDirectory = false"
```

### Files Modified Today

```bash
loq -i:FS -recurse:2 "SELECT Name, Path, LastModified
                            FROM '.'
                            WHERE SUBSTR(LastModified, 1, 10) = SUBSTR(NOW(), 1, 10)"
```

## Format Size for Display

```bash
loq -i:FS "SELECT Name,
                        CASE
                          WHEN Size > 1073741824 THEN CONCAT(ROUND(Size / 1073741824, 2), ' GB')
                          WHEN Size > 1048576 THEN CONCAT(ROUND(Size / 1048576, 2), ' MB')
                          WHEN Size > 1024 THEN CONCAT(ROUND(Size / 1024, 2), ' KB')
                          ELSE CONCAT(Size, ' B')
                        END AS size_formatted
                 FROM '.'
                 ORDER BY Size DESC
                 LIMIT 20"
```

## Platform Considerations

### Path Separators

Use forward slashes on all platforms:

```bash
# Works on Windows, macOS, Linux
loq -i:FS "SELECT * FROM '/var/log'"
loq -i:FS "SELECT * FROM 'C:/Users'"
```

### Hidden Files

- **Unix**: Files starting with `.` (e.g., `.bashrc`)
- **Windows**: Files with hidden attribute

### Permissions

Files you don't have permission to read will be skipped.

## Combining with Other Operations

### Export File List

```bash
loq -i:FS -o:CSV --ofile:files.csv \
          "SELECT Name, Path, Size, LastModified FROM '.' -recurse:2"
```

### Generate Report

```bash
loq -i:FS -o:DATAGRID -recurse:2 \
          "SELECT Extension, COUNT(*) AS files, SUM(Size) AS bytes
           FROM '.'
           WHERE IsDirectory = false
           GROUP BY Extension
           ORDER BY bytes DESC"
```

## Troubleshooting

### Permission Denied

Some files may be skipped due to permissions. The query continues with accessible files.

### Too Many Files

Use LIMIT or more specific paths for large directory trees:

```bash
# Limit results
loq -i:FS -recurse:5 "SELECT * FROM '/' LIMIT 1000"

# Be more specific
loq -i:FS "SELECT * FROM '/var/log/app'"
```

### Path Not Found

Verify the path exists:

```bash
ls -la /path/to/directory
```

## See Also

- [Input Formats Overview](/input-formats/)
- [S3](/input-formats/s3)
- [CSV Output](/output-formats/csv)
