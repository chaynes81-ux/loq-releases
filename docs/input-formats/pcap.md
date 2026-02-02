# PCAP / NETMON / CAP Format

Parse network packet capture files cross-platform.

## Overview

The PCAP format reads network capture files in pcap/pcapng format, commonly created by Wireshark, tcpdump, and other network analysis tools.

## Usage

```bash
loq -i:PCAP "SELECT * FROM capture.pcap"
```

## Schema

| Field | Type | Description |
|-------|------|-------------|
| Timestamp | DATETIME | Packet capture timestamp |
| SourceIP | STRING | Source IP address |
| DestIP | STRING | Destination IP address |
| SourcePort | INTEGER | Source port number |
| DestPort | INTEGER | Destination port number |
| Protocol | STRING | Protocol (TCP, UDP, ICMP, etc.) |
| Length | INTEGER | Packet length in bytes |
| Data | STRING | Packet payload (hex) |

## Examples

### List all packets
```bash
loq -i:PCAP "SELECT Timestamp, SourceIP, DestIP, Protocol FROM traffic.pcap"
```

### Filter by IP address
```bash
loq -i:PCAP "SELECT * FROM capture.pcap WHERE SourceIP = '192.168.1.100'"
```

### Analyze traffic by protocol
```bash
loq -i:PCAP "SELECT Protocol, COUNT(*), SUM(Length) FROM dump.pcap GROUP BY Protocol"
```

### Find traffic on specific port
```bash
loq -i:PCAP "SELECT * FROM network.pcap WHERE DestPort = 443"
```

## Supported Formats

- `.pcap` - Standard pcap format
- `.pcapng` - Next-generation pcap format
- `.cap` - Network capture files

## Notes

- Cross-platform support (Windows, macOS, Linux)
- Large capture files may require significant memory
- Use LIMIT to sample large captures
