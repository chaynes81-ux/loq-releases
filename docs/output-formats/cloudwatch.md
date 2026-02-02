# CloudWatch Output

Send query results to AWS CloudWatch Logs.

## Usage

```bash
loq -o:CLOUDWATCH --log-group:/app/logs "SELECT * FROM errors.csv"
```

## Requirements

- AWS credentials configured
- CloudWatch Logs permissions
- Log group name specified

## Authentication

Uses standard AWS credential chain:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. Shared credentials file (`~/.aws/credentials`)
3. IAM role (EC2/ECS/Lambda)

```bash
# Using environment variables
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

loq -o:CLOUDWATCH --log-group:/app/logs "SELECT * FROM data.csv"
```

## Options

### Log Group

```bash
--log-group:/my/log/group
```

Created automatically if it doesn't exist.

### Log Stream

```bash
--log-stream:my-stream-name
```

Default: auto-generated with timestamp.

### Region

```bash
export AWS_REGION=us-west-2
```

Or use `AWS_DEFAULT_REGION`.

## Examples

### Send Error Logs

```bash
loq -o:CLOUDWATCH --log-group:/myapp/errors \
          "SELECT timestamp, level, message FROM app.log WHERE level = 'error'"
```

### Send Aggregated Metrics

```bash
loq -o:CLOUDWATCH --log-group:/myapp/metrics \
          "SELECT date, COUNT(*) AS requests, AVG(duration) AS avg_duration
           FROM access.log
           GROUP BY date"
```

### Custom Stream Name

```bash
loq -o:CLOUDWATCH \
          --log-group:/myapp/logs \
          --log-stream:import-2024-01-15 \
          "SELECT * FROM daily_logs.csv"
```

## Log Event Format

Each row is sent as a JSON log event:

```json
{"timestamp":"2024-01-15T14:30:00","level":"error","message":"Connection failed"}
```

With CloudWatch timestamp extracted from:
1. `timestamp` column (if present and valid)
2. `TimeCreated` column (for EVTX)
3. Current time (fallback)

## IAM Permissions

Minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/myapp/*"
      ]
    }
  ]
}
```

## Batch Behavior

Log events are batched for efficiency:
- Maximum batch size: 1MB or 10,000 events
- Automatic sequence token handling
- Retry on throttling

## Use Cases

### Centralized Log Aggregation

```bash
# Collect logs from multiple sources
loq -o:CLOUDWATCH --log-group:/central/web-servers \
          "SELECT * FROM '/var/log/nginx/*.log'"
```

### Error Monitoring

```bash
# Send only errors to CloudWatch
loq -o:CLOUDWATCH --log-group:/alerts/errors \
          "SELECT timestamp, service, error_code, message
           FROM app.log
           WHERE level = 'error'"
```

### Metrics Collection

```bash
# Send hourly summaries
loq -o:CLOUDWATCH --log-group:/metrics/hourly \
          "SELECT
               QUANTIZE(timestamp, 3600) AS hour,
               COUNT(*) AS requests,
               SUM(CASE WHEN status >= 500 THEN 1 ELSE 0 END) AS errors
           FROM access.log
           GROUP BY hour"
```

### Log Migration

```bash
# Migrate historical logs
loq -o:CLOUDWATCH --log-group:/historical/2023 \
          "SELECT * FROM archive/2023/*.log"
```

## Querying CloudWatch Logs

After sending, query with CloudWatch Logs Insights:

```
fields @timestamp, @message
| filter level = 'error'
| sort @timestamp desc
| limit 100
```

Or use AWS CLI:

```bash
aws logs filter-log-events \
    --log-group-name /myapp/logs \
    --filter-pattern "error"
```

## Cost Considerations

CloudWatch Logs pricing:
- **Ingestion**: Per GB ingested
- **Storage**: Per GB-month stored
- **Analysis**: Per GB scanned with Insights

### Reduce Costs

1. **Filter before sending**:
```bash
# Only send errors
loq -o:CLOUDWATCH --log-group:/app/errors \
          "SELECT * FROM logs.csv WHERE level IN ('error', 'critical')"
```

2. **Aggregate data**:
```bash
# Send summaries instead of raw logs
loq -o:CLOUDWATCH --log-group:/app/summary \
          "SELECT date, level, COUNT(*) FROM logs.csv GROUP BY date, level"
```

3. **Use retention policies**:
```bash
aws logs put-retention-policy \
    --log-group-name /myapp/logs \
    --retention-in-days 30
```

## Troubleshooting

### Access Denied

Check IAM permissions:

```bash
aws logs describe-log-groups
```

### Region Mismatch

Ensure region is set:

```bash
export AWS_REGION=us-east-1
```

### Throttling

CloudWatch has rate limits. Large exports may be throttled. The SDK handles retries automatically.

### Invalid Log Events

Events with timestamps more than 14 days old or 2 hours in the future are rejected.

### Verify Logs Arrived

```bash
aws logs tail /myapp/logs --follow
```

## Integration with CloudWatch Alarms

Create alarms based on log metrics:

```bash
# Create metric filter
aws logs put-metric-filter \
    --log-group-name /myapp/logs \
    --filter-name ErrorCount \
    --filter-pattern "{ $.level = \"error\" }" \
    --metric-transformations \
        metricName=ErrorCount,metricNamespace=MyApp,metricValue=1

# Create alarm
aws cloudwatch put-metric-alarm \
    --alarm-name HighErrorRate \
    --metric-name ErrorCount \
    --namespace MyApp \
    --statistic Sum \
    --period 300 \
    --threshold 100 \
    --comparison-operator GreaterThanThreshold
```

## See Also

- [Output Formats Overview](/output-formats/)
- [S3 Input](/input-formats/s3)
- [JSON Output](/output-formats/json)
