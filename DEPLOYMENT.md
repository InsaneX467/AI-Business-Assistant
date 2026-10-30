# Production Deployment & Hosting Guide

This document outlines the architecture, deployment prerequisites, hosting options, and security configurations required to transition the **AI Business Assistant** from a local development environment to a production cloud infrastructure.

---

## 1. Executive Summary & Local Baseline

Currently, the application runs entirely locally on Windows:
- **React Frontend**: Bundled with Vite and served locally at `http://localhost:5173`.
- **Node.js Express Backend**: Runs on `http://localhost:5000` handling API routing, lead management, and security policies.
- **Python FastAPI Service**: Runs on `http://127.0.0.1:8000` executing the fine-tuned `Qwen2.5-1.5B-Instruct` model + LoRA adapter with local GPU acceleration (NVIDIA RTX 4050 / PyTorch CUDA).
- **Database**: Local MongoDB instance (`mongodb://127.0.0.1:27017/ai_business_assistant`).

---

## 2. Infrastructure Architecture & Service Topology

```
                  ┌──────────────────────────────────────────────┐
                  │                 Users / Web                  │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTPS / TLS (Port 443)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           Edge / CDN (Vercel / Cloudflare)   │
                  │              React Single-Page App           │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTPS REST API
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           Backend API (Node.js / Express)    │
                  │        (Render / AWS App Runner / PaaS)      │
                  └───────┬──────────────────────────────┬───────┘
                          │                              │
         Private VPC /    │ HTTP POST (Internal)         │ Mongoose Connection
         Internal Network │                              │
                          ▼                              ▼
    ┌─────────────────────────────┐            ┌───────────────────┐
    │  Python FastAPI AI Service  │            │   MongoDB Atlas   │
    │ (GPU Host: RunPod / Modal)  │            │ (Managed DB Cluster)
    │  Qwen2.5-1.5B + LoRA Engine │            └───────────────────┘
    └─────────────────────────────┘
```

---

## 3. Host & Compute Recommendations

### **A. React Frontend Hosting**
- **Recommended Providers**: Vercel, Netlify, or AWS Amplify.
- **Configuration**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_BASE_URL=https://api.yourdomain.com/api`

### **B. Node.js Express Backend Hosting**
- **Recommended Providers**: Render, Railway, AWS ECS / App Runner, or DigitalOcean App Platform.
- **Requirements**: Node.js 18+ runtime, environment variable secrets configuration, auto-restart capabilities.
- **Environment Variables**:
  - `PORT=5000`
  - `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_assistant`
  - `ADMIN_API_KEY=<strong-generated-secret>`
  - `ALLOWED_ORIGINS=https://yourdomain.com`
  - `LOCAL_AI_SERVICE_URL=http://internal-ai-service:8000/generate`
  - `NODE_ENV=production`

### **C. Python FastAPI LLM Service Hosting**
- **Recommended Providers**: RunPod Serverless, Modal, GCP Compute Engine (with GPU), or AWS EC2 g4dn/g5 instances.
- **Hardware Requirements**:
  - GPU with min 6GB–8GB VRAM (NVIDIA T4, L4, or A10G recommended).
  - PyTorch CUDA runtime environment with Transformers and PEFT pre-installed.
  - Pre-cached base weights (`Qwen2.5-1.5B-Instruct`) and LoRA adapter weights (`models/business-assistant-lora/`).

### **D. Database Hosting**
- **Recommended Provider**: MongoDB Atlas (Managed Cloud Cluster).
- **Requirements**: IP Whitelisting (restricted to Express backend IP range), TLS/SSL connection string, automated daily backups.

---

## 4. Security & Network Hardening for Production

### **1. HTTPS / TLS Termination**
- All public endpoints (`client` and `server`) MUST enforce HTTPS via valid TLS certificates (automatically provisioned by Vercel / Cloudflare / Let's Encrypt).

### **2. Private Network Isolation (VPC)**
- The **Python FastAPI AI Service** must **NEVER** be publicly exposed to the internet.
- It should reside within a private VPC or internal microservice network, accessible strictly by the Node.js Express IP address or internal service discovery DNS.

### **3. Admin Authentication Upgrade**
- The current API key verification (`X-Admin-Api-Key` / `Authorization`) is suitable for internal single-tenant tools.
- For public multi-tenant production, upgrade the Admin Dashboard auth flow to:
  - Server-managed HTTP-only JWT cookies or OAuth2 / OpenID Connect.
  - Role-Based Access Control (RBAC) to manage permissions safely across multiple admin users.

### **4. Strict CORS Policy**
- Ensure `ALLOWED_ORIGINS` in production explicitly names only the trusted frontend domain(s):
  ```env
  ALLOWED_ORIGINS=https://app.yourbusiness.com,https://admin.yourbusiness.com
  ```

### **5. Secrets Management**
- Use cloud platform secret managers (AWS Secrets Manager, GCP Secret Manager, or Vercel Environment Secrets).
- Never commit credentials to version control.

---

## 5. Operations, Monitoring, & Cost Categories

### **Operations & Monitoring**
- **Logging**: Enable structured JSON logging (Winston or Pino for Node.js; structlog for Python) and aggregate logs into services like Datadog, Better Stack, or CloudWatch.
- **Backups**: Configure automated daily snapshots on MongoDB Atlas.
- **Rate Limiting**: Enforce API rate limits at the gateway layer (Cloudflare / NGINX) in addition to application-level rate limiters (`express-rate-limit`).

### **Production Cost Categories (Estimated)**
1. **Frontend Hosting**: Free Tier / Low Fixed Cost ($0–$20/mo on Vercel/Netlify).
2. **Backend API Hosting**: Low Tier CPU Instance ($5–$25/mo on Render/AWS).
3. **Managed Database**: MongoDB Atlas Shared/Dedicated Cluster ($0–$60+/mo).
4. **GPU Compute**: Pay-per-second Serverless GPU or On-Demand Instance ($30–$150+/mo depending on query traffic).
5. **Domain & SSL**: Standard domain registration ($10–$20/yr).

---

## 6. Pre-Deployment Verification Checklist

- [ ] Production MongoDB cluster provisioned with secure connection string.
- [ ] PyTorch + CUDA environment verified on target GPU host.
- [ ] Model weights (`Qwen2.5-1.5B-Instruct`) and LoRA adapter downloaded to target AI host.
- [ ] Node.js backend environment variables populated in production secret manager.
- [ ] CORS policies restricted to production client domain.
- [ ] `npm run build` executed cleanly without bundle errors.
- [ ] API endpoints verified behind HTTPS proxy.
