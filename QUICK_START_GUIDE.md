# Quick Start Guide - Restaurant Dashboard

## 🚀 Starting the Application

### 1. Start Django Backend

```bash
cd backend
python3 manage.py runserver
```

✅ Running on: http://localhost:8000

### 2. Start Mock Kyte Backend

```bash
cd mock_kyte_backend
python3 mock_server.py
```

✅ Running on: http://localhost:8001

### 3. Start React Frontend

```bash
cd frontend
npm start
```

✅ Running on: http://localhost:3000

---

## 📱 Using the Dashboard

### Navigation Bar

```
┌─────────────────────────────────────────────────────────────┐
│  [Incoming (2)]  [Active (3)]  [Ready (1)]  [☰ History]    │
└─────────────────────────────────────────────────────────────┘
```

**Main Tabs (workflow):**

- 📥 **Incoming** - New orders to accept/reject
- 👨‍🍳 **Active** - Orders being prepared
- 📦 **Ready** - Food ready for drone pickup

**History Menu (☰):**

- ✅ Completed - Successfully delivered
- ❌ Cancelled/Rejected - Failed orders

---

## 🔄 Order Status Flow

```
┌──────────┐    Accept     ┌────────┐   Mark Ready   ┌───────┐   Confirm    ┌───────────┐
│ INCOMING │───────────────>│ ACTIVE │──────────────>│ READY │────Pickup───>│ COMPLETED │
│ (pending)│                │(accept)│                │(ready)│              │(completed)│
└──────────┘                └────────┘                └───────┘              └───────────┘
     │                           │                         │
     │Reject                     │Cancel                   │
     ↓                           ↓                         │
┌──────────┐                ┌──────────┐                  │
│ REJECTED │                │CANCELLED │<─────────────────┘
└──────────┘                └──────────┘
```

---

## 📋 Tab-by-Tab Actions

### 📥 INCOMING Tab

**What you see:** New orders waiting for acceptance

**Available actions:**

- ✅ **Accept Order** → Moves to Active tab
- ❌ **Reject Order** → Moves to history

**When to use:**

- New order just arrived
- Review order details
- Check if you can fulfill it

---

### 👨‍🍳 ACTIVE Tab

**What you see:** Orders being prepared in kitchen

**Available actions:**

- ⏱ **Mark as Delayed** → Updates status, keeps in Active
- ❌ **Cancel Preparation** → Moves to history
- 📦 **Mark as Ready** → Moves to Ready tab

**When to use:**

- Food is being cooked
- Need to update delay status
- Food is done and packed

---

### 📦 READY Tab

**What you see:** Food ready, waiting for drone pickup

**Available actions:**

- 📞 **Call Drone** → Request immediate pickup
- ✅ **Confirm Pickup** → Moves to Completed
- ⚠️ **Report Issue** → Submit problem report

**Special features:**

- ⏰ **Auto-alert** after 10 minutes
- "Nudge Kyte" button to remind them
- Shows waiting time

**When to use:**

- Food is packed and ready
- Waiting for drone arrival
- Drone has picked up order

---

### 📚 HISTORY Menu (☰)

**What you see:** Past orders (read-only)

**Two categories:**

- ✅ **Completed** - Delivered successfully
- ❌ **Cancelled/Rejected** - Not delivered

**No actions available** - just for reference

---

## 🎯 Common Workflows

### New Order Arrives

1. Badge shows "Incoming (1)"
2. Click **Incoming** tab
3. Click order card to view details
4. Review items and address
5. Click **Accept Order**
6. Order moves to **Active** tab
7. Start cooking!

### Food is Ready

1. Order is in **Active** tab
2. Click order card
3. Food is cooked and packed
4. Click **Mark as Ready**
5. Order moves to **Ready** tab
6. Wait for drone

### Drone Picks Up

1. Order in **Ready** tab
2. Drone arrives
3. Hand over food package
4. Click order card
5. Click **Confirm Pickup**
6. Order moves to Completed
7. Done! ✅

### Order Taking Too Long

1. Order in **Ready** tab
2. Waiting >10 minutes
3. Auto-banner appears
4. Click **Nudge Kyte**
5. Or click **Call Drone**
6. Kyte gets reminder

### Need to Cancel

1. Order in **Active** tab
2. Can't fulfill order
3. Click **Cancel Preparation**
4. Order moves to history
5. Kyte is notified

---

## 🎨 Visual Indicators

### Badge Colors

- 🔴 **Red badge** - Needs attention (new orders)
- **No badge** - Everything handled

### Tab Colors

- **Gray underline** - Incoming (neutral)
- **Blue underline** - Active (working)
- **Orange underline** - Ready (urgent)

### Alerts

- 🟡 **Yellow banner** - Order waiting >10 min
- Gentle pulse animation

### Status Dots in Header

- 🟢 **Green** - Connected, live updates
- 🟡 **Yellow** - Checking for updates...
- 🔴 **Red** - Connection issue

---

## 💡 Pro Tips

1. **Badge counts are clickable** - Quick jump to that tab
2. **Orders auto-refresh** - No need to manually reload
3. **Side panel auto-closes** - After you take action
4. **Mobile-friendly** - Works on tablets too
5. **Keyboard shortcuts** - Tab key to navigate

---

## 🆘 Troubleshooting

### "No orders showing"

- ✅ Check all three backends are running
- ✅ Try creating test order: `curl -X POST http://localhost:8001/simulate-order`
- ✅ Refresh browser

### "Connection Error" in header

- ✅ Check Django backend: `curl http://localhost:8000/api/orders/`
- ✅ Restart backend if needed

### "Order stuck in wrong tab"

- ✅ Check order status in detail panel
- ✅ Force refresh: `Ctrl/Cmd + Shift + R`
- ✅ Check backend logs

### "Badge count wrong"

- ✅ Auto-corrects on next refresh (2-30 seconds)
- ✅ Force refresh if urgent

---

## 🔧 Testing Scenarios

### Test Full Workflow

```bash
# Create order
curl -X POST http://localhost:8001/simulate-order

# In dashboard:
# 1. See badge on Incoming tab
# 2. Click order, accept it
# 3. See in Active tab
# 4. Mark as ready
# 5. See in Ready tab
# 6. Confirm pickup
# 7. Check history menu
```

### Test Delay Alert

```bash
# Method 1: Wait 10 minutes after marking ready
# Method 2: Modify code to trigger faster (for testing)
```

### Test Call Drone

```bash
# In Ready tab, click "Call Drone"
# Should see browser alert (mock function)
# In production, would trigger Kyte API
```

---

## 📞 Need Help?

**Documentation:**

- `UX_REFACTOR_SUMMARY.md` - Detailed technical docs
- `WEBHOOK_IMPLEMENTATION.md` - API integration
- `SMART_POLLING_IMPLEMENTATION.md` - Auto-refresh system

**Common Questions:**

- Q: Where did "Recent Orders" go?

  - A: Click hamburger menu (☰) → Completed or Cancelled

- Q: What's the "Ready" status?

  - A: New step between "done cooking" and "delivered"

- Q: Can I see all orders at once?

  - A: Not directly - tabs keep it clean. Check each tab + history.

- Q: Order completed without pickup?
  - A: Use "Mark as Ready" first, then "Confirm Pickup" later

---

**Last Updated:** October 21, 2025  
**Version:** 2.0 (Tab-based UI)  
**Status:** ✅ Production Ready
