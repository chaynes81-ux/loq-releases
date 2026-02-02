# EVTX (Windows Event Log)

Parse Windows Event Log files (.evtx) with full cross-platform support.

## Usage

```bash
loq -i:EVTX "SELECT * FROM System.evtx"
loq -i:EVT "SELECT * FROM Security.evtx"
```

Both `-i:EVTX` and `-i:EVT` work identically.

## Cross-Platform Support

loq parses EVTX files on all platforms (Windows, macOS, Linux) without requiring Windows APIs. Copy .evtx files from Windows systems and analyze them anywhere.

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `EventID` | Integer | Event identifier |
| `Level` | Integer | Severity level (0-5) |
| `TimeCreated` | DateTime | Event timestamp |
| `Computer` | String | Source computer name |
| `Channel` | String | Log channel (Security, System, etc.) |
| `Provider` | String | Event provider name |
| `EventRecordId` | Integer | Unique record ID |
| `ProcessId` | Integer | Process ID |
| `ThreadId` | Integer | Thread ID |
| `Keywords` | String | Event keywords |
| `Task` | Integer | Task category |
| `Opcode` | Integer | Operation code |
| `Message` | String | Event message (if available) |
| `EventData.*` | Various | Event-specific data fields |

### Severity Levels

| Level | Name | Description |
|-------|------|-------------|
| 0 | LogAlways | Always logged |
| 1 | Critical | Critical error |
| 2 | Error | Error condition |
| 3 | Warning | Warning condition |
| 4 | Informational | Informational |
| 5 | Verbose | Debug/trace |

## Examples

### View Recent Events

```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Level, Message
                   FROM System.evtx
                   ORDER BY TimeCreated DESC
                   LIMIT 20"
```

### Filter by Severity

```bash
# Critical and Error events
loq -i:EVTX "SELECT TimeCreated, EventID, Provider, Message
                   FROM System.evtx
                   WHERE Level <= 2
                   ORDER BY TimeCreated DESC"
```

### Filter by Event ID

```bash
# Specific event
loq -i:EVTX "SELECT TimeCreated, Computer, Message
                   FROM Security.evtx
                   WHERE EventID = 4624"
```

### Filter by Provider

```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Message
                   FROM System.evtx
                   WHERE Provider = 'Microsoft-Windows-Kernel-Power'"
```

### Count by Event ID

```bash
loq -i:EVTX "SELECT EventID, COUNT(*) AS count
                   FROM System.evtx
                   GROUP BY EventID
                   ORDER BY count DESC
                   LIMIT 20"
```

### Count by Provider

```bash
loq -i:EVTX "SELECT Provider, COUNT(*) AS count
                   FROM System.evtx
                   GROUP BY Provider
                   ORDER BY count DESC"
```

## Security Event Analysis

### Successful Logins (4624)

```bash
loq -i:EVTX "SELECT TimeCreated, Computer, EventData.TargetUserName, EventData.LogonType
                   FROM Security.evtx
                   WHERE EventID = 4624
                   ORDER BY TimeCreated DESC
                   LIMIT 50"
```

### Failed Logins (4625)

```bash
loq -i:EVTX "SELECT TimeCreated, Computer, EventData.TargetUserName, EventData.FailureReason
                   FROM Security.evtx
                   WHERE EventID = 4625
                   ORDER BY TimeCreated DESC"
```

### Account Lockouts (4740)

```bash
loq -i:EVTX "SELECT TimeCreated, EventData.TargetUserName, EventData.TargetDomainName
                   FROM Security.evtx
                   WHERE EventID = 4740"
```

### User Account Changes

```bash
loq -i:EVTX "SELECT TimeCreated, EventID, EventData.TargetUserName, EventData.SubjectUserName
                   FROM Security.evtx
                   WHERE EventID IN (4720, 4722, 4723, 4724, 4725, 4726)
                   ORDER BY TimeCreated DESC"
```

### Privilege Escalation

```bash
loq -i:EVTX "SELECT TimeCreated, EventData.SubjectUserName, EventData.PrivilegeList
                   FROM Security.evtx
                   WHERE EventID = 4672
                   ORDER BY TimeCreated DESC
                   LIMIT 50"
```

## System Event Analysis

### System Startup/Shutdown

```bash
loq -i:EVTX "SELECT TimeCreated, EventID, Message
                   FROM System.evtx
                   WHERE EventID IN (6005, 6006, 6008, 6009, 6013)
                   ORDER BY TimeCreated DESC"
```

### Service Status Changes

```bash
loq -i:EVTX "SELECT TimeCreated, EventData.param1 AS ServiceName, EventData.param2 AS Status
                   FROM System.evtx
                   WHERE EventID = 7036
                   ORDER BY TimeCreated DESC
                   LIMIT 50"
```

### Disk Errors

```bash
loq -i:EVTX "SELECT TimeCreated, EventData.DeviceId, Message
                   FROM System.evtx
                   WHERE Provider = 'disk'
                     AND Level <= 3"
```

## Application Event Analysis

### Application Errors

```bash
loq -i:EVTX "SELECT TimeCreated, EventData.AppName, EventData.FaultingModuleName
                   FROM Application.evtx
                   WHERE Provider = 'Application Error'"
```

### .NET Runtime Errors

```bash
loq -i:EVTX "SELECT TimeCreated, Message
                   FROM Application.evtx
                   WHERE Provider = '.NET Runtime'
                     AND Level <= 2"
```

## EventData Fields

EventData fields are event-specific. Access them with dot notation:

```sql
SELECT EventData.TargetUserName FROM Security.evtx WHERE EventID = 4624
SELECT EventData.ServiceName FROM System.evtx WHERE EventID = 7036
```

### Common Security EventData Fields

| Event ID | Common Fields |
|----------|---------------|
| 4624 (Logon) | TargetUserName, LogonType, IpAddress |
| 4625 (Failed) | TargetUserName, FailureReason, IpAddress |
| 4648 (Explicit) | TargetUserName, TargetServerName |
| 4672 (Privilege) | SubjectUserName, PrivilegeList |
| 4720 (Created) | TargetUserName, SubjectUserName |

## Multiple Log Files

```bash
# All .evtx files in directory
loq -i:EVTX "SELECT * FROM '*.evtx'"

# Recursive search
loq -i:EVTX -recurse:2 "SELECT * FROM 'logs/*.evtx'"
```

## Time-Based Analysis

### Events per Day

```bash
loq -i:EVTX "SELECT SUBSTR(TimeCreated, 1, 10) AS date, COUNT(*) AS count
                   FROM System.evtx
                   GROUP BY date
                   ORDER BY date"
```

### Events per Hour

```bash
loq -i:EVTX "SELECT SUBSTR(TimeCreated, 12, 2) AS hour, COUNT(*) AS count
                   FROM System.evtx
                   GROUP BY hour
                   ORDER BY hour"
```

## Exporting

### To CSV

```bash
loq -i:EVTX -o:CSV --ofile:events.csv \
          "SELECT TimeCreated, EventID, Level, Message FROM System.evtx"
```

### To JSON

```bash
loq -i:EVTX -o:JSON --ofile:events.json \
          "SELECT TimeCreated, EventID, Level, Message FROM System.evtx"
```

## Troubleshooting

### Missing EventData Fields

Not all events have the same EventData fields:

```sql
-- Use COALESCE for optional fields
SELECT TimeCreated,
       COALESCE(EventData.TargetUserName, 'N/A') AS User
FROM Security.evtx
```

### Large Log Files

For large .evtx files:

```bash
# Use LIMIT during exploration
loq -i:EVTX "SELECT * FROM System.evtx LIMIT 100"

# Filter early
loq -i:EVTX "SELECT * FROM System.evtx WHERE Level <= 2"
```

### Corrupted Files

If parsing fails, the file may be corrupted. Try copying fresh from Windows.

## See Also

- [Input Formats Overview](/input-formats/)
- [Syslog](/input-formats/syslog)
- [Filesystem](/input-formats/filesystem)
