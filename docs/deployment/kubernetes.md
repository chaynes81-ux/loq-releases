# Kubernetes Deployment

Deploy loq to Kubernetes clusters.

## Quick Start

```bash
# Deploy all resources
kubectl apply -f k8s/

# Check status
kubectl get all -n loq

# Access via port-forward
kubectl port-forward -n loq svc/loq-server 8080:8080
```

## Architecture

The deployment includes:

- **Namespace**: Isolated environment
- **Deployment**: 3 replicas with rolling updates
- **Service**: ClusterIP for internal access
- **ConfigMap**: Configuration values
- **PVC**: Persistent storage for data files
- **Ingress**: External HTTP(S) access (optional)
- **HPA**: Horizontal Pod Autoscaler (optional)

## Manifests

### Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: loq
```

### ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: loq-config
  namespace: loq
data:
  RUST_LOG: "info"
  SERVER_PORT: "8080"
```

### Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: loq-server
  namespace: loq
spec:
  replicas: 3
  selector:
    matchLabels:
      app: loq-server
  template:
    metadata:
      labels:
        app: loq-server
    spec:
      containers:
      - name: loq-server
        image: loq/loq-server:latest
        ports:
        - containerPort: 8080
          name: http
        envFrom:
        - configMapRef:
            name: loq-config
        volumeMounts:
        - name: data
          mountPath: /data
          readOnly: true
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 1000m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: loq-data-pvc
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
```

### Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: loq-server
  namespace: loq
spec:
  selector:
    app: loq-server
  ports:
  - port: 8080
    targetPort: http
    name: http
  type: ClusterIP
```

### PersistentVolumeClaim

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: loq-data-pvc
  namespace: loq
spec:
  accessModes:
  - ReadOnlyMany
  resources:
    requests:
      storage: 10Gi
```

### Ingress (Optional)

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: loq-ingress
  namespace: loq
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: loq.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: loq-server
            port:
              number: 8080
  tls:
  - hosts:
    - loq.example.com
    secretName: loq-tls
```

### HorizontalPodAutoscaler (Optional)

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: loq-server-hpa
  namespace: loq
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: loq-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Create ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

### 3. Create PVC

```bash
kubectl apply -f k8s/pvc.yaml
```

### 4. Deploy Application

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 5. (Optional) Setup Ingress

```bash
kubectl apply -f k8s/ingress.yaml
```

### 6. (Optional) Enable Autoscaling

```bash
kubectl apply -f k8s/hpa.yaml
```

## Accessing the Service

### Port Forward (Development)

```bash
kubectl port-forward -n loq svc/loq-server 8080:8080

# Test
curl http://localhost:8080/api/v1/health
```

### Internal Access

From within the cluster:

```
http://loq-server.loq.svc.cluster.local:8080
```

### External Access (Ingress)

```
https://loq.example.com
```

## Managing Data

### Copy Data to PVC

```bash
# Create a pod with the PVC mounted
kubectl run data-loader --image=alpine --restart=Never -n loq \
  --overrides='{"spec":{"containers":[{"name":"data-loader","image":"alpine","command":["sleep","3600"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"loq-data-pvc"}}]}}'

# Copy files
kubectl cp ./local-data/ loq/data-loader:/data/

# Delete the loader pod
kubectl delete pod data-loader -n loq
```

### Using NFS

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: loq-nfs-pv
spec:
  capacity:
    storage: 100Gi
  accessModes:
  - ReadOnlyMany
  nfs:
    server: nfs-server.example.com
    path: /exports/loq-data
```

## Monitoring

### View Logs

```bash
# All pods
kubectl logs -n loq -l app=loq-server

# Follow logs
kubectl logs -n loq -l app=loq-server -f

# Specific pod
kubectl logs -n loq loq-server-xxxxx
```

### Check Status

```bash
kubectl get pods -n loq
kubectl get hpa -n loq
kubectl get events -n loq
```

### Prometheus Metrics

Add annotations for scraping:

```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment -n loq loq-server --replicas=5
```

### Autoscaling

HPA automatically scales based on CPU/memory usage.

```bash
# View HPA status
kubectl get hpa -n loq

# Watch scaling events
kubectl get hpa -n loq -w
```

## Updating

### Rolling Update

```bash
# Update image
kubectl set image deployment/loq-server \
  -n loq \
  loq-server=loq/loq-server:v1.1.0

# Check rollout status
kubectl rollout status deployment/loq-server -n loq
```

### Rollback

```bash
# View history
kubectl rollout history deployment/loq-server -n loq

# Rollback
kubectl rollout undo deployment/loq-server -n loq
```

## Security

### Network Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: loq-network-policy
  namespace: loq
spec:
  podSelector:
    matchLabels:
      app: loq-server
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
```

### TLS Secret

```bash
kubectl create secret tls loq-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem \
  -n loq
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Or delete namespace
kubectl delete namespace loq
```

## See Also

- [Docker Deployment](/deployment/docker)
- [REST API](/api/)
- [CLI Reference](/cli/)
