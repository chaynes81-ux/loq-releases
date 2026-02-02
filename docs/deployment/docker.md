# Docker Deployment

Deploy loq using Docker containers.

## Quick Start

### CLI Tool

```bash
# Pull the image
docker pull loq/loq:latest

# Run a query
docker run --rm -v $(pwd)/data:/data loq/loq:latest \
  "SELECT * FROM /data/sample.csv"
```

### REST API Server

```bash
# Pull the server image
docker pull loq/loq-server:latest

# Run the server
docker run -d -p 8080:8080 -v $(pwd)/data:/data loq/loq-server:latest

# Test
curl http://localhost:8080/api/v1/health
```

## Building Images

### CLI Image

```bash
docker build -t loq:latest -f Dockerfile .
```

### Server Image

```bash
docker build -t loq-server:latest -f Dockerfile.server .
```

### Alpine Variants (Smaller)

```bash
# CLI (~100MB vs ~200MB)
docker build -t loq:alpine -f Dockerfile.alpine .

# Server
docker build -t loq-server:alpine -f Dockerfile.server-alpine .
```

## Using Docker Compose

### Production Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  loq-server:
    image: loq/loq-server:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data:ro
    environment:
      - RUST_LOG=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run:

```bash
docker-compose up -d
```

### Development Setup

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'
services:
  loq-server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
      - ./src:/app/src  # For hot reload
    environment:
      - RUST_LOG=debug
```

Run:

```bash
docker-compose -f docker-compose.dev.yml up
```

## CLI Usage

### Basic Query

```bash
docker run --rm \
  -v $(pwd)/data:/data \
  loq:latest \
  "SELECT * FROM /data/sample.csv"
```

### With Format Options

```bash
docker run --rm \
  -v $(pwd)/data:/data \
  loq:latest \
  -i:JSON -o:CSV \
  "SELECT * FROM /data/input.json"
```

### Output to File

```bash
docker run --rm \
  -v $(pwd)/data:/data \
  -v $(pwd)/output:/output \
  loq:latest \
  -o:CSV --ofile:/output/result.csv \
  "SELECT * FROM /data/input.csv"
```

### Multiple Input Files

```bash
docker run --rm \
  -v $(pwd)/logs:/logs:ro \
  loq:latest \
  "SELECT * FROM '/logs/*.csv'"
```

## Server Usage

### Basic Server

```bash
docker run -d \
  --name loq-server \
  -p 8080:8080 \
  -v $(pwd)/data:/data:ro \
  loq-server:latest
```

### With Environment Variables

```bash
docker run -d \
  --name loq-server \
  -p 8080:8080 \
  -v $(pwd)/data:/data:ro \
  -e RUST_LOG=debug \
  -e SERVER_PORT=8080 \
  loq-server:latest
```

### Check Logs

```bash
docker logs loq-server
docker logs -f loq-server  # Follow
```

## Volume Mounts

### Read-Only Data

```bash
-v /host/data:/data:ro
```

### Write Output

```bash
-v /host/output:/output
```

### Multiple Volumes

```bash
docker run --rm \
  -v $(pwd)/input:/input:ro \
  -v $(pwd)/output:/output \
  -v $(pwd)/config:/config:ro \
  loq:latest \
  "SELECT * FROM /input/data.csv"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RUST_LOG` | `info` | Log level (error, warn, info, debug, trace) |
| `SERVER_HOST` | `0.0.0.0` | Server bind address |
| `SERVER_PORT` | `8080` | Server port |

## Resource Limits

### Memory Limit

```bash
docker run --rm --memory=512m loq:latest "SELECT * FROM data.csv"
```

### CPU Limit

```bash
docker run --rm --cpus=1.0 loq:latest "SELECT * FROM data.csv"
```

### Combined

```bash
docker run -d \
  --memory=1g \
  --cpus=2.0 \
  -p 8080:8080 \
  loq-server:latest
```

## Security

### Non-Root User

Images run as non-root user (UID 1000) by default.

### Read-Only Filesystem

```bash
docker run --rm \
  --read-only \
  -v $(pwd)/data:/data:ro \
  -v /tmp:/tmp \
  loq:latest \
  "SELECT * FROM /data/sample.csv"
```

### Network Isolation

```bash
# No network access
docker run --rm --network=none \
  -v $(pwd)/data:/data:ro \
  loq:latest \
  "SELECT * FROM /data/sample.csv"
```

## Multi-Architecture

Build for multiple platforms:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t loq:latest \
  -f Dockerfile \
  --push .
```

## Troubleshooting

### Permission Issues

```bash
# Check file permissions
ls -la data/

# Fix ownership
chown -R 1000:1000 ./data

# Or run as root (not recommended)
docker run --user root ...
```

### Connection Refused

```bash
# Check if server is running
docker ps

# Check logs
docker logs loq-server

# Check port binding
docker port loq-server
```

### Out of Memory

```bash
# Increase memory limit
docker run --memory=2g ...

# Or use streaming/LIMIT
docker run ... "SELECT * FROM huge.csv LIMIT 1000"
```

### File Not Found

```bash
# Verify volume mount
docker run --rm -v $(pwd)/data:/data alpine ls -la /data

# Check path in query (use container path, not host path)
# Host: ./data/file.csv
# Container: /data/file.csv
```

## Image Comparison

| Image | Base | Size | Use Case |
|-------|------|------|----------|
| `loq:latest` | Debian | ~200MB | Production, compatibility |
| `loq:alpine` | Alpine | ~100MB | Resource-constrained |
| `loq-server:latest` | Debian | ~200MB | API server |
| `loq-server:alpine` | Alpine | ~100MB | Minimal API server |

## See Also

- [Kubernetes Deployment](/deployment/kubernetes)
- [REST API](/api/)
- [CLI Reference](/cli/)
