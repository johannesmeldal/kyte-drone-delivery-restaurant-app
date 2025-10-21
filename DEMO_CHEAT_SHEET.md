# 🎯 Demo Cheat Sheet - Kyte Restaurant App

## 📋 Quick Overview (30 seconds)

**What it is**: A tablet-optimized web app for restaurants to manage drone delivery orders from Kyte backend.

**Tech Stack**: 
- Frontend: React + TypeScript
- Backend: Django REST Framework
- Mock: FastAPI (simulates Kyte backend)
- Deploy: AWS EC2 + Nginx + Gunicorn

**Live**: https://johannes-case.sandbox.aviant.no

---

## 🏗️ Architecture (3-Tier System)

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Frontend │ ←──→ │ Django Backend   │ ←──→ │ Kyte Backend    │
│  (Restaurant)   │ HTTP │ (Business Logic) │ HTTP │ (Mock/Real)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
  Tablet Interface        REST API + Webhooks        Order Management
```

### Communication Flow:
1. **Kyte → Django**: Creates orders via `POST /api/orders/`
2. **React → Django**: Fetches orders, updates status
3. **Django → Kyte**: Webhooks on status changes (accept/reject/delay/done)
4. **Kyte → Django**: Can cancel orders anytime

---

## 📂 Key Components

### **Frontend** (`/frontend/src/`)

| Component | Purpose | Key Concept |
|-----------|---------|-------------|
| `App.tsx` | Root component, manages state | Smart polling for real-time updates |
| `OrderSections.tsx` | Tab navigation (Incoming/Active/Ready/History) | Workflow-based UI |
| `OrderCard.tsx` | Order preview cards | Status-based styling |
| `OrderDetail.tsx` | Full order details + actions | Conditional action buttons |
| `api.ts` | API communication layer | Axios with relative paths |
| `useSmartPolling.ts` | Auto-refresh hook | Exponential backoff (2s → 30s) |

**Key UI Concepts**:
- **Tab-based workflow**: Incoming → Active → Ready → History
- **Smart polling**: Reduces requests when idle, fast when active
- **Responsive**: Works on tablets and desktops

### **Backend** (`/backend/`)

| File | Purpose | Key Concept |
|------|---------|-------------|
| `orders/models.py` | Data model | Order + OrderItem (1-to-many) |
| `orders/views.py` | API endpoints + webhook logic | REST CRUD + outbound webhooks |
| `orders/serializers.py` | JSON serialization | Nested serializers for items |
| `settings_production.py` | Production config | Security settings, allowed hosts |

**Key Backend Concepts**:
- **Order Model**: ID, display_number, status, timestamps, items
- **Status Flow**: pending → accepted → ready → completed
- **Webhooks**: Notify Kyte on every status change (except Kyte-initiated cancels)
- **ETag Support**: Efficient polling with conditional requests

### **Mock Backend** (`/mock_kyte_backend/`)

| File | Purpose |
|------|---------|
| `mock_server.py` | FastAPI server simulating Kyte |

**Features**:
- Generate random orders (`/simulate-order`)
- Receive webhooks from restaurant (`/webhook/order-status`)
- Cancel orders from Kyte side (`/webhook/cancel-order`)

---

## 🔄 Order Status Flow

```
PENDING ──┬─→ ACCEPTED ──┬─→ READY ───→ COMPLETED ✓
          │              │
          │              └─→ CANCELLED ✗
          │
          └─→ REJECTED ✗
```

**Status Meanings**:
- `pending`: New order, awaiting restaurant response
- `accepted`: Restaurant is preparing food
- `delayed`: Still preparing but taking longer
- `ready`: Food ready, waiting for drone pickup
- `completed`: Drone picked up, delivered
- `rejected`: Restaurant can't fulfill
- `cancelled`: Kyte cancelled (customer/system)

---

## 🎨 Main Concepts & Design Decisions

### 1. **Data Model Design**
```python
# Order (parent)
- id: unique order ID from Kyte
- display_number: 3-digit friendly number (100-999)
- customer_name, phone, address
- status: workflow state
- created_at, updated_at, ready_at, completed_at
- special_instructions

# OrderItem (children, many-to-one)
- order: foreign key
- name, quantity, price
- special_instructions
```

**Why?** Normalized design, easy to query, supports order history.

### 2. **Webhook Architecture**
- **Outbound**: Django sends status updates to Kyte automatically
- **Prevents loops**: Uses `cancelled_by` flag to avoid webhook ping-pong
- **Fire-and-forget**: Logs errors but doesn't fail requests

### 3. **Smart Polling Strategy**
- **Adaptive intervals**: 2s (active) → 30s (idle)
- **ETag support**: Reduces bandwidth with conditional GETs
- **Delta updates**: `?since=timestamp` parameter for incremental syncs

**Why?** Balances real-time feel with server efficiency.

### 4. **UX Design**
- **Tab-based workflow**: Mirrors restaurant kitchen flow
- **Visual hierarchy**: Color-coded statuses, badges for counts
- **Touch-optimized**: Large buttons, clear actions
- **Auto-close detail panel**: After actions, returns to list

---

## 🚀 Demo Script (15 min)

### **Part 1: Process & Architecture (5-7 min)**

**Talking Points**:
1. **Problem**: Restaurants need simple interface for drone delivery orders
2. **Solution**: 3-tier web app with bidirectional webhooks
3. **Data model**: Order ↔ OrderItem relationship, status-driven workflow
4. **Key decision**: Smart polling vs WebSockets (chose polling for simplicity + works everywhere)
5. **Deployment**: Production-ready on AWS with Nginx + Gunicorn

### **Part 2: Live Demo (8-10 min)**

**Steps**:
1. **Open dashboard**: https://johannes-case.sandbox.aviant.no
   - Show clean UI, tabs, existing orders

2. **Create new order**: Use Django admin or curl
   ```bash
   curl -X POST https://johannes-case.sandbox.aviant.no/api/orders/ \
     -H "Content-Type: application/json" \
     -d '{"id":"DEMO-123", "customer_name":"John Doe", ...}'
   ```

3. **Show order lifecycle**:
   - Incoming tab → click order → Accept
   - Active tab → click order → Mark as Ready
   - Ready tab → click order → Confirm Pickup
   - Check History menu

4. **Demonstrate webhook**: 
   - Show terminal with `tail -f gunicorn-error.log` (webhook logs)
   - Accept/reject order, watch webhook fire

5. **Show admin panel**: https://johannes-case.sandbox.aviant.no/admin/
   - Login: admin/admin123
   - Show Django admin capabilities

---

## 📁 File Structure (Most Important)

```
kyte-restaurant-app/
├── frontend/src/
│   ├── App.tsx                    # Root component, state management
│   ├── components/
│   │   ├── OrderSections.tsx      # Tab navigation
│   │   ├── OrderCard.tsx          # Order list items
│   │   └── OrderDetail.tsx        # Detail panel with actions
│   ├── hooks/
│   │   └── useSmartPolling.ts     # Smart polling logic
│   ├── services/
│   │   └── api.ts                 # API layer
│   └── utils/
│       └── orderUtils.ts          # Helper functions
│
├── backend/
│   ├── orders/
│   │   ├── models.py              # Order & OrderItem models
│   │   ├── views.py               # API endpoints + webhooks
│   │   └── serializers.py         # JSON serialization
│   └── restaurant_app/
│       ├── settings.py            # Dev settings
│       └── settings_production.py # Prod settings
│
├── mock_kyte_backend/
│   └── mock_server.py             # FastAPI mock server
│
├── server-setup/
│   ├── nginx.conf                 # Nginx configuration
│   └── restaurant-backend.service # Systemd service
│
└── deploy.sh                      # One-command deployment
```

---

## 💡 Questions You Might Get

### **Q: Why not WebSockets?**
**A**: Smart polling is simpler, works everywhere (no special server config), and with ETag + exponential backoff, it's nearly as efficient. Good enough for this use case.

### **Q: How do you handle race conditions?**
**A**: Django's atomic transactions + status validation in views. Kyte cancellations use `cancelled_by` flag to prevent webhook loops.

### **Q: Why display_number instead of order ID?**
**A**: UX decision. Staff can say "Order 234" instead of "Order ORD-1697234-5678". Auto-cycles 100-999.

### **Q: How would you scale this?**
**A**: 
1. Switch to WebSockets (Django Channels)
2. Add Redis for caching/pub-sub
3. PostgreSQL instead of SQLite
4. Horizontal scaling with load balancer (already behind ALB)

### **Q: Security considerations?**
**A**: 
- HTTPS enforced (ALB)
- CSRF protection enabled
- Webhook authentication (would add HMAC signatures in prod)
- Django security middleware active

---

## 🎯 Key Achievements to Highlight

✅ **Complete order lifecycle** management
✅ **Bidirectional webhook** communication
✅ **Production deployment** on AWS
✅ **Tablet-optimized UX** with clear workflow
✅ **Smart polling** for efficiency
✅ **Mock backend** for demonstration
✅ **Clean data model** with proper relationships
✅ **Comprehensive documentation**

---

## 🔗 Quick Links

- **Live App**: https://johannes-case.sandbox.aviant.no
- **Admin Panel**: https://johannes-case.sandbox.aviant.no/admin/ (admin/admin123)
- **API**: https://johannes-case.sandbox.aviant.no/api/orders/
- **Create Test Order**: See curl commands in TESTING_GUIDE.md

---

## ⏱️ Time Allocation (15 min total)

- **0-2 min**: Introduction + problem statement
- **2-5 min**: Architecture overview + data model
- **5-7 min**: Key design decisions (webhooks, polling, UX)
- **7-12 min**: Live demo walkthrough
- **12-15 min**: Code quality discussion + Q&A

---

**Good luck! 🚀**

