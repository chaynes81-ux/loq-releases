# API Endpoints

Detailed reference for all REST API endpoints.

## Query Endpoint

### POST /api/v1/query

Execute a SQL query against data files.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "sql": "SELECT * FROM data.csv WHERE age > 30 LIMIT 10",
  "input_format": "CSV"
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sql` | string | Yes | - | SQL query to execute |
| `input_format` | string | No | `CSV` | Input format for files referenced in query |

#### Response

**Success (200 OK):**

```json
{
  "columns": ["name", "age", "city"],
  "rows": [
    ["Alice", 35, "New York"],
    ["Bob", 42, "London"],
    ["Carol", 38, "Paris"]
  ],
  "stats": {
    "rows_scanned": 1000,
    "rows_returned": 3,
    "execution_time_ms": 45
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `columns` | string[] | Column names in result order |
| `rows` | array[][] | Result rows as arrays of values |
| `stats.rows_scanned` | number | Total rows read from input |
| `stats.rows_returned` | number | Rows in result set |
| `stats.execution_time_ms` | number | Query execution time in milliseconds |

**Error (400 Bad Request):**

```json
{
  "error": "Syntax error: Expected FROM keyword",
  "error_type": "parse_error"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Error message |
| `error_type` | string | Error category |

**Error Types:**

| Type | HTTP Status | Description |
|------|-------------|-------------|
| `parse_error` | 400 | SQL syntax error |
| `execution_error` | 400 | Query execution failure |
| `invalid_input` | 400 | Invalid file or input parameters |
| `internal_error` | 500 | Server internal error |

#### Examples

**Simple Query:**
```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT name, email FROM users.csv"
  }'
```

**With Filter:**
```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM users.csv WHERE status = '\''active'\'' AND age > 25"
  }'
```

**Aggregation:**
```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT department, COUNT(*) as count, AVG(salary) as avg_salary FROM employees.csv GROUP BY department ORDER BY count DESC"
  }'
```

**JOIN:**
```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT u.name, o.order_id, o.total FROM users.csv u INNER JOIN orders.csv o ON u.id = o.user_id"
  }'
```

---

## Health Endpoint

### GET /api/v1/health

Check server health status.

#### Request

No parameters required.

```bash
curl http://localhost:8080/api/v1/health
```

#### Response

**Success (200 OK):**

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always "ok" if server is healthy |
| `version` | string | Server version |

#### Use Cases

- Load balancer health checks
- Monitoring systems
- Readiness probes (Kubernetes)

---

## Common Patterns

### Pagination

Use LIMIT and OFFSET for pagination:

```bash
# Page 1 (first 100 rows)
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM data.csv LIMIT 100"}'

# Page 2 (rows 101-200)
# Note: OFFSET is not currently supported, use application-level pagination
```

### Error Handling

Always check for error responses:

```python
response = requests.post(url, json={"sql": query})
data = response.json()

if "error" in data:
    print(f"Error ({data['error_type']}): {data['error']}")
else:
    process_results(data['rows'])
```

### Result Processing

```python
result = query("SELECT name, age FROM users.csv")

# Access by index
for row in result['rows']:
    name = row[0]
    age = row[1]
    print(f"{name}: {age}")

# Create dict for each row
for row in result['rows']:
    record = dict(zip(result['columns'], row))
    print(record)  # {'name': 'Alice', 'age': 35}
```

### Batch Queries

Execute multiple queries:

```python
queries = [
    "SELECT COUNT(*) FROM users.csv",
    "SELECT COUNT(*) FROM orders.csv",
    "SELECT COUNT(*) FROM products.csv"
]

results = []
for sql in queries:
    response = requests.post(url, json={"sql": sql})
    results.append(response.json())
```

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Query executed successfully |
| 400 | Bad Request | Invalid SQL, file not found, etc. |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

The server does not currently implement rate limiting. For production use, consider adding a reverse proxy with rate limiting:

```nginx
# Nginx example
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:8080;
}
```

---

## CORS Headers

Response headers for CORS support:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

For production, consider restricting `Access-Control-Allow-Origin` to specific domains.

---

## See Also

- [API Overview](/api/)
- [SQL Reference](/sql/)
- [Input Formats](/input-formats/)
