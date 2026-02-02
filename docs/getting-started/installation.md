# Installation

loq can be installed on Windows, macOS, and Linux using several methods.

## Pre-built Binaries

Download pre-built binaries from the [GitHub Releases](https://github.com/chaynes81-ux/loq/releases) page.

### macOS

```bash
# Download and extract
curl -LO https://github.com/chaynes81-ux/loq/releases/latest/download/loq-darwin-arm64.tar.gz
tar xzf loq-darwin-arm64.tar.gz

# Move to PATH
sudo mv loq /usr/local/bin/

# Verify installation
loq --version
```

For Intel Macs, use `loq-darwin-x86_64.tar.gz` instead.

### Linux

```bash
# Download and extract
curl -LO https://github.com/chaynes81-ux/loq/releases/latest/download/loq-linux-x86_64.tar.gz
tar xzf loq-linux-x86_64.tar.gz

# Move to PATH
sudo mv loq /usr/local/bin/

# Verify installation
loq --version
```

### Windows

```powershell
# Download from GitHub releases
Invoke-WebRequest -Uri https://github.com/chaynes81-ux/loq/releases/latest/download/loq-windows-x86_64.zip -OutFile loq.zip

# Extract
Expand-Archive loq.zip -DestinationPath C:\loq

# Add to PATH (run as Administrator)
$env:Path += ";C:\loq"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)

# Verify installation
loq --version
```

## Build from Source

Building from source requires [Rust](https://rustup.rs/) 1.70 or later.

### Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Build loq

```bash
# Clone the repository
git clone https://github.com/chaynes81-ux/loq.git
cd loq

# Build release version
cargo build --release

# The binary is at target/release/loq
./target/release/loq --version
```

### Install with Cargo

```bash
# Install directly from crates.io (when published)
cargo install loq

# Or install from the repository
cargo install --git https://github.com/chaynes81-ux/loq.git
```

## Docker

loq is available as a Docker image for containerized environments.

### Pull the Image

```bash
docker pull loq/loq:latest
```

### Run a Query

```bash
# Mount your data directory
docker run --rm -v $(pwd)/data:/data loq/loq:latest \
  "SELECT * FROM /data/sample.csv"
```

### Using Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  loq:
    image: loq/loq:latest
    volumes:
      - ./data:/data:ro
    command: ["SELECT * FROM /data/logs.csv"]
```

Run with:

```bash
docker-compose run --rm loq
```

## REST API Server

loq includes a REST API server for programmatic access.

### Docker

```bash
# Run the server
docker run -d -p 8080:8080 -v $(pwd)/data:/data loq/loq-server:latest

# Test the endpoint
curl http://localhost:8080/api/v1/health
```

### From Source

```bash
# Build and run the server
cargo run -p loq-server

# The server listens on http://0.0.0.0:8080
```

See the [REST API documentation](/api/) for details.

## Kubernetes

For Kubernetes deployment, see the [Kubernetes guide](/deployment/kubernetes).

## Verify Installation

After installation, verify loq is working:

```bash
# Check version
loq --version

# Run a simple query
echo "name,age\nAlice,30\nBob,25" > test.csv
loq "SELECT * FROM test.csv"
```

Expected output:

```
name,age
Alice,30
Bob,25
```

## Platform-Specific Notes

### macOS

On macOS, you may need to allow the binary to run:

```bash
# If you see "cannot be opened because the developer cannot be verified"
xattr -d com.apple.quarantine /usr/local/bin/loq
```

### Windows

Some input formats (ETW, ADS) are Windows-only. On other platforms, these formats will return a clear error message.

### Linux

For EVTX parsing on Linux, no additional dependencies are required - the cross-platform EVTX parser is included.

## Troubleshooting

### Command not found

Ensure the binary is in your PATH:

```bash
# Check if loq is in PATH
which loq

# If not, add to PATH (Linux/macOS)
export PATH="$PATH:/path/to/loq"
```

### Permission denied

Make the binary executable:

```bash
chmod +x /path/to/loq
```

### Build errors

Ensure you have the latest Rust toolchain:

```bash
rustup update stable
```

## Staying Updated

Get notified when new versions of loq are released.

### GitHub Watch (Recommended)

The easiest way to get notified of new releases:

1. Go to the [loq GitHub repository](https://github.com/chaynes81-ux/loq)
2. Click the **Watch** button (top right)
3. Select **Custom** → check **Releases** → click **Apply**

You'll receive an email whenever a new version is released.

### RSS Feed

Subscribe to releases via RSS/Atom feed:

```
https://github.com/chaynes81-ux/loq/releases.atom
```

Add this URL to your favorite RSS reader (Feedly, Inoreader, etc.) to see new releases in your feed.

### Check Your Version

To see which version you have installed:

```bash
loq --version
```

Compare with the [latest release](https://github.com/chaynes81-ux/loq/releases/latest) to see if you're up to date.

### Updating

How to update depends on your installation method:

::: code-group
```bash [Homebrew]
brew upgrade loq
```

```bash [Cargo]
cargo install loq --force
```

```bash [Docker]
docker pull loq/loq:latest
```

```bash [Manual]
# Download the latest release and replace the binary
curl -LO https://github.com/chaynes81-ux/loq/releases/latest/download/loq-darwin-arm64.tar.gz
tar xzf loq-darwin-arm64.tar.gz
sudo mv loq /usr/local/bin/
```
:::

## Next Steps

- [Quick Start](/getting-started/quick-start) - Learn the basics with hands-on examples
- [CLI Reference](/cli/) - Full command-line options
- [Input Formats](/input-formats/) - Supported input formats
