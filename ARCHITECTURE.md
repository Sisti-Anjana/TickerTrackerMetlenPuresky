. Backend validates request
4. Backend saves to Supabase
5. Supabase returns success
6. Backend sends response to Frontend
7. React updates UI
```

---

## 📦 Container Details

### Frontend Container
```
┌─────────────────────────────────────┐
│  Frontend Container (Port 8080)     │
├─────────────────────────────────────┤
│  Nginx Web Server                   │
│  ├── Serves static files            │
│  ├── Routes SPA requests            │
│  ├── Caches assets                  │
│  └── Security headers               │
│                                     │
│  React Application                  │
│  ├── TypeScript                     │
│  ├── React Router                   │
│  ├── API calls to backend           │
│  └── UI Components                  │
└─────────────────────────────────────┘
```

### Backend Container
```
┌─────────────────────────────────────┐
│  Backend Container (Port 8080)      │
├─────────────────────────────────────┤
│  Node.js + Express                  │
│  ├── Authentication (JWT)           │
│  ├── API Routes                     │
│  │   ├── /api/auth/*                │
│  │   ├── /api/tickets/*             │
│  │   ├── /api/users/*               │
│  │   └── /api/reports/*             │
│  ├── Middleware (CORS, Auth)        │
│  ├── Supabase Client                │
│  └── Environment Variables          │
└─────────────────────────────────────┘
```

---

## 🌍 Deployment Regions

### Recommended Regions
- **us-central1** (Iowa) - Default, good global coverage
- **asia-south1** (Mumbai) - Best for India
- **europe-west1** (Belgium) - Best for Europe
- **us-east1** (South Carolina) - Best for US East Coast

### Multi-Region Setup (Advanced)
```
Users in India → asia-south1 instance
Users in US    → us-central1 instance
Users in EU    → europe-west1 instance
```

---

## 📊 Scaling Behavior

### Low Traffic (0-10 requests/min)
```
Frontend: 0-1 instances (sleeps when idle)
Backend:  0-1 instances (sleeps when idle)
Cost:     ~$0-5/month
```

### Medium Traffic (10-100 requests/min)
```
Frontend: 1-3 instances
Backend:  1-5 instances
Cost:     ~$10-20/month
```

### High Traffic (100+ requests/min)
```
Frontend: 3-10 instances
Backend:  5-10 instances
Cost:     ~$30-100/month
```

### Traffic Spike
```
Before: 2 instances
Spike:  Auto-scales to 10 instances in seconds
After:  Scales back down to 2 instances
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Google Cloud IAM              │
│  - User authentication                  │
│  - Service account permissions          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 2: Network Security              │
│  - HTTPS only (automatic SSL)           │
│  - DDoS protection (built-in)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 3: Application Security          │
│  - CORS configuration                   │
│  - JWT authentication                   │
│  - Input validation                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 4: Database Security             │
│  - Supabase RLS policies                │
│  - Connection encryption                │
│  - Role-based access                    │
└─────────────────────────────────────────┘
```

---

## 💾 Data Flow

### Read Operation (View Tickets)
```
Browser → Frontend Container → Backend Container → Supabase → Response
  (UI)        (Nginx)            (Express API)      (Query)    (JSON)
```

### Write Operation (Create Ticket)
```
Browser → Frontend → Backend → Supabase → Success
   ↓                                         ↓
Update UI ←────────────────────────────────┘
```

---

## 🔄 Deployment Flow

### Initial Deployment
```
1. Your Code (Local)
   ↓
2. Docker Build (Cloud Build)
   ↓
3. Container Registry
   ↓
4. Cloud Run Service
   ↓
5. Live URL
```

### Updates (CI/CD)
```
1. Push to GitHub
   ↓
2. GitHub Actions Triggered
   ↓
3. Build New Container
   ↓
4. Deploy to Cloud Run
   ↓
5. Automatic Traffic Shift
   ↓
6. Old Container Kept (Rollback)
```

---

## 📈 Monitoring Points

```
Frontend Metrics:
├── Page Load Time
├── API Response Time
├── Error Rate
├── Active Users
└── Resource Usage

Backend Metrics:
├── Request Count
├── Response Time
├── Error Rate
├── CPU Usage
├── Memory Usage
└── Database Queries

Database Metrics:
├── Query Performance
├── Connection Pool
├── Storage Usage
└── Active Connections
```

---

## 🌐 Network Topology

```
                    Internet
                       │
                       ▼
              Google Edge Network
                       │
         ┌─────────────┴─────────────┐
         │    Load Balancer          │
         └──────────┬────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    Frontend Region       Backend Region
         │                     │
    us-central1          us-central1
         │                     │
    Auto-scale 0-10      Auto-scale 0-10
```

---

## 🔧 Environment Variables Flow

```
Development (Local):
.env file → Application

Production (Cloud Run):
Google Secret Manager → Cloud Run → Application
                       (Encrypted)
```

---

## 💰 Cost Breakdown

```
Monthly Cost Structure:
├── Frontend Container
│   ├── CPU Time:        $2-5
│   ├── Memory:          $1-3
│   └── Requests:        $0 (free tier)
│
├── Backend Container
│   ├── CPU Time:        $3-8
│   ├── Memory:          $2-5
│   └── Requests:        $0 (free tier)
│
├── Networking
│   ├── Egress:          $0-2
│   └── Load Balancer:   $0 (included)
│
└── Database (Supabase)
    └── Separate billing
```

---

## 🎯 High Availability

```
Single Region Setup:
- Multiple instances automatically
- Load balanced
- Health checks
- Auto-restart on failure

Multi-Region Setup (Advanced):
- Deploy to multiple regions
- Global load balancing
- Automatic failover
- 99.99% uptime
```

---

## 📝 Summary

**What You Get:**
✅ Serverless containers (no server management)
✅ Automatic HTTPS and SSL
✅ Auto-scaling (0 to 100 instances)
✅ Load balancing (built-in)
✅ DDoS protection
✅ Global CDN
✅ Zero-downtime deployments
✅ Automatic health checks
✅ Real-time monitoring
✅ Pay only for what you use

**Best For:**
✅ Startups and small businesses
✅ MVPs and prototypes  
✅ Production applications
✅ APIs and web services
✅ Applications with variable traffic

---

This architecture provides enterprise-grade reliability at startup-friendly prices! 🚀
