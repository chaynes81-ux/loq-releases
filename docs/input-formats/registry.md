# REG / REGISTRY Format

Parse Windows Registry export files (.reg) cross-platform.

## Usage

```bash
loq -i:REG "SELECT * FROM exported.reg"
loq -i:REGISTRY "SELECT * FROM settings.reg"
```

Both `-i:REG` and `-i:REGISTRY` work identically.

## Cross-Platform Support

loq parses exported .reg files on all platforms (Windows, macOS, Linux) without requiring Windows APIs. Export registry keys from Windows systems and analyze them anywhere.

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `KeyPath` | String | Full registry key path (e.g., HKEY_LOCAL_MACHINE\SOFTWARE\...) |
| `ValueName` | String | Name of the registry value, or "(Default)" for default values |
| `ValueType` | String | Registry value type (REG_SZ, REG_DWORD, REG_BINARY, etc.) |
| `Value` | String | The value data (formatted as string) |
| `LastWriteTime` | DateTime | Last modification time (NULL for exported .reg files) |

### Value Types

| ValueType | Description |
|-----------|-------------|
| REG_SZ | String value |
| REG_DWORD | 32-bit integer (displayed as decimal) |
| REG_BINARY | Binary data (displayed as hex) |
| REG_EXPAND_SZ | Expandable string (environment variables) |
| REG_MULTI_SZ | Multi-string value |

## Examples

### List All Registry Values

```bash
loq -i:REG "SELECT KeyPath, ValueName, Value FROM settings.reg"
```

### Find Specific Keys

```bash
# Search for Software keys
loq -i:REG "SELECT * FROM system.reg WHERE KeyPath LIKE '%Software%'"

# Find specific application settings
loq -i:REG "SELECT ValueName, Value 
            FROM export.reg 
            WHERE KeyPath LIKE '%Microsoft\\Windows%'"
```

### Filter by Value Type

```bash
# Find all DWORD values
loq -i:REG "SELECT KeyPath, ValueName, Value 
            FROM export.reg 
            WHERE ValueType = 'REG_DWORD'"

# Find string values only
loq -i:REG "SELECT * FROM export.reg WHERE ValueType = 'REG_SZ'"
```

### Filter by Value Name

```bash
# Find all "Version" values
loq -i:REG "SELECT KeyPath, Value 
            FROM export.reg 
            WHERE ValueName = 'Version'"

# Find default values
loq -i:REG "SELECT KeyPath, Value 
            FROM export.reg 
            WHERE ValueName = '(Default)'"
```

### Search by Value Content

```bash
# Find values containing specific text
loq -i:REG "SELECT KeyPath, ValueName, Value 
            FROM export.reg 
            WHERE Value LIKE '%C:\\Program Files%'"

# Find specific numeric values
loq -i:REG "SELECT KeyPath, ValueName 
            FROM export.reg 
            WHERE ValueType = 'REG_DWORD' AND Value = '1'"
```

## Aggregation and Analysis

### Count Values by Type

```bash
loq -i:REG "SELECT ValueType, COUNT(*) AS count 
            FROM export.reg 
            GROUP BY ValueType 
            ORDER BY count DESC"
```

### Count Values by Key

```bash
loq -i:REG "SELECT KeyPath, COUNT(*) AS value_count 
            FROM export.reg 
            GROUP BY KeyPath 
            ORDER BY value_count DESC 
            LIMIT 20"
```

### Find Most Common Value Names

```bash
loq -i:REG "SELECT ValueName, COUNT(*) AS count 
            FROM export.reg 
            GROUP BY ValueName 
            ORDER BY count DESC 
            LIMIT 20"
```

## Exporting Results

### To CSV

```bash
loq -i:REG -o:CSV --ofile:registry_analysis.csv \
    "SELECT KeyPath, ValueName, ValueType, Value FROM export.reg"
```

### To JSON

```bash
loq -i:REG -o:JSON --ofile:registry_data.json \
    "SELECT KeyPath, ValueName, Value 
     FROM export.reg 
     WHERE KeyPath LIKE '%CurrentVersion%'"
```

### To Database

```bash
loq -i:REG -o:SQLITE --ofile:registry.db \
    "SELECT * FROM export.reg"
```

## Practical Use Cases

### Find Installed Software

```bash
loq -i:REG "SELECT EXTRACT_SUFFIX(KeyPath, '\\\\') AS Software, Value AS DisplayName
            FROM export.reg
            WHERE KeyPath LIKE '%Uninstall%' 
              AND ValueName = 'DisplayName'
            ORDER BY Software"
```

### Security Analysis

```bash
# Find auto-start programs
loq -i:REG "SELECT KeyPath, ValueName, Value
            FROM export.reg
            WHERE KeyPath LIKE '%Run%'
              AND KeyPath NOT LIKE '%RunOnce%'"

# Find non-standard startup locations
loq -i:REG "SELECT DISTINCT KeyPath
            FROM export.reg
            WHERE KeyPath LIKE '%Run%'"
```

### Configuration Audit

```bash
# Find all paths in registry
loq -i:REG "SELECT KeyPath, ValueName, Value
            FROM export.reg
            WHERE Value LIKE '%C:\\%' OR Value LIKE '%D:\\%'"

# Find registry keys with many values (complex configurations)
loq -i:REG "SELECT KeyPath, COUNT(*) AS value_count
            FROM export.reg
            GROUP BY KeyPath
            HAVING value_count > 10
            ORDER BY value_count DESC"
```

## Exporting Registry Keys from Windows

To create .reg files for analysis:

### Using Registry Editor (regedit.exe)

1. Open Registry Editor (Win+R → regedit)
2. Navigate to the key you want to export
3. Right-click → Export
4. Save as .reg file

### Using Command Line

```cmd
rem Export specific key
reg export "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion" output.reg

rem Export entire hive
reg export HKLM hklm.reg

rem Export user settings
reg export HKCU hkcu.reg
```

### PowerShell

```powershell
# Export to .reg file
reg export "HKLM\SOFTWARE\Microsoft" export.reg

# Or use PowerShell cmdlets
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\*" | Export-Csv software.csv
```

## Multiple Registry Files

```bash
# Query all .reg files in directory
loq -i:REG "SELECT * FROM '*.reg'"

# Combine multiple exports
loq -i:REG "SELECT KeyPath, ValueName, Value 
            FROM 'export1.reg' 
            UNION ALL 
            SELECT KeyPath, ValueName, Value 
            FROM 'export2.reg'"
```

## Notes

- **Cross-platform**: Works on any OS - just reads the .reg file format
- **Read-only**: Parses exported files; does not modify live registry
- **Text encoding**: Handles UTF-16 encoded strings in registry data
- **Default values**: Registry default values are shown as "(Default)" in ValueName
- **LastWriteTime**: Only populated for live registry queries (Windows only)
- **File format**: Supports Windows Registry Editor Version 5.00 format

## Limitations

- **No live registry access on non-Windows**: Use exported .reg files instead
- **LastWriteTime always NULL**: .reg exports don't include modification timestamps
- **Binary data**: Complex binary values are shown as hex strings
- **Multi-line values**: Registry values spanning multiple lines are concatenated

## Troubleshooting

### Large .reg Files

For large registry exports:

```bash
# Use LIMIT during exploration
loq -i:REG "SELECT * FROM large_export.reg LIMIT 100"

# Filter early to reduce processing
loq -i:REG "SELECT * FROM large_export.reg WHERE KeyPath LIKE '%Microsoft%'"
```

### Encoding Issues

If special characters appear corrupted:

- Ensure the .reg file was exported with UTF-16 encoding
- Re-export from Windows using regedit (uses correct encoding by default)

### Parsing Errors

If parsing fails:

- Verify the file is a valid .reg export (starts with "Windows Registry Editor")
- Check for manual edits that may have corrupted the format
- Re-export the registry key from Windows

## See Also

- [Input Formats Overview](/input-formats/)
- [EVTX (Windows Event Log)](/input-formats/evtx)
- [Filesystem](/input-formats/filesystem)
