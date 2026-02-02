# REST API

loq includes a REST API server for executing queries over HTTP.

## Quick Start

### Start the Server

```bash
cargo run -p loq-server
```

The server listens on `http://0.0.0.0:8080` by default.

### Execute a Query

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM test_data/sample.csv LIMIT 5"}'
```

## Endpoints

### POST /api/v1/query

Execute a SQL query.

**Request:**

```json
{
  "sql": "SELECT * FROM data.csv WHERE age > 30 LIMIT 10",
  "input_format": "CSV"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sql` | string | Yes | SQL query to execute |
| `input_format` | string | No | Input format (default: CSV) |

**Response (Success):**

```json
{
  "columns": ["name", "age", "city"],
  "rows": [
    ["Alice", 35, "New York"],
    ["Bob", 42, "London"]
  ],
  "stats": {
    "rows_scanned": 100,
    "rows_returned": 2,
    "execution_time_ms": 15
  }
}
```

**Response (Error):**

```json
{
  "error": "Syntax error near 'FORM'",
  "error_type": "parse_error"
}
```

| Error Type | Description |
|------------|-------------|
| `parse_error` | SQL syntax error |
| `execution_error` | Query execution failure |
| `invalid_input` | Invalid input file or parameters |
| `internal_error` | Server internal error |

### GET /api/v1/health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

## Examples

### Basic Query

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM users.csv"}'
```

### Filtered Query

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT name, age FROM users.csv WHERE age > 30 ORDER BY age DESC"}'
```

### Aggregation Query

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT city, COUNT(*), AVG(age) FROM users.csv GROUP BY city"}'
```

### With JOINs

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT u.name, o.total FROM users.csv u JOIN orders.csv o ON u.id = o.user_id"}'
```

## Client Examples

### Python

```python
import requests

def query(sql):
    response = requests.post(
        "http://localhost:8080/api/v1/query",
        json={"sql": sql}
    )
    response.raise_for_status()
    return response.json()

# Execute query
result = query("SELECT * FROM users.csv LIMIT 10")

# Access results
print(f"Columns: {result['columns']}")
print(f"Rows returned: {result['stats']['rows_returned']}")

for row in result['rows']:
    print(row)
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function query(sql) {
    const response = await axios.post('http://localhost:8080/api/v1/query', {
        sql: sql
    });
    return response.data;
}

// Execute query
const result = await query('SELECT * FROM users.csv LIMIT 10');

console.log('Columns:', result.columns);
console.log('Rows:', result.rows.length);
```

### Bash/curl

```bash
#!/bin/bash

# Function to execute query
query() {
    curl -s -X POST http://localhost:8080/api/v1/query \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$1\"}"
}

# Execute and parse with jq
query "SELECT * FROM users.csv LIMIT 5" | jq '.rows[]'
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type QueryRequest struct {
    SQL string `json:"sql"`
}

type QueryResponse struct {
    Columns []string        `json:"columns"`
    Rows    [][]interface{} `json:"rows"`
    Stats   struct {
        RowsScanned     int `json:"rows_scanned"`
        RowsReturned    int `json:"rows_returned"`
        ExecutionTimeMs int `json:"execution_time_ms"`
    } `json:"stats"`
}

func query(sql string) (*QueryResponse, error) {
    body, _ := json.Marshal(QueryRequest{SQL: sql})

    resp, err := http.Post(
        "http://localhost:8080/api/v1/query",
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result QueryResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_HOST` | `0.0.0.0` | Server bind address |
| `SERVER_PORT` | `8080` | Server port |
| `RUST_LOG` | `info` | Log level |

### Running with Custom Port

```bash
SERVER_PORT=3000 cargo run -p loq-server
```

### Debug Logging

```bash
RUST_LOG=debug cargo run -p loq-server
```

## CORS Support

The server includes permissive CORS headers for web applications:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Docker

### Build Server Image

```bash
docker build -t loq-server:latest -f Dockerfile.server .
```

### Run Server

```bash
docker run -d -p 8080:8080 -v $(pwd)/data:/data loq-server:latest
```

### Query with Mounted Data

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM /data/users.csv"}'
```

## Limitations

Current limitations:
- Only CSV input format is supported
- Results are collected in memory (not streamed)
- No authentication/authorization
- No query timeouts
- No result size limits

For production use, consider:
- Adding authentication
- Implementing rate limiting
- Setting query timeouts
- Limiting result sizes

## Error Handling

### Common Errors

**File Not Found:**
```json
{
  "error": "File not found: /path/to/missing.csv",
  "error_type": "invalid_input"
}
```

**SQL Syntax Error:**
```json
{
  "error": "Expected FROM, found 'FORM'",
  "error_type": "parse_error"
}
```

**Execution Error:**
```json
{
  "error": "Column 'unknown_column' not found",
  "error_type": "execution_error"
}
```

## See Also

- [Installation](/getting-started/installation)
- [Docker Deployment](/deployment/docker)
- [Kubernetes Deployment](/deployment/kubernetes)
