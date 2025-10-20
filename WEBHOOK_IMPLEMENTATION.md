# Webhook Implementation - Complete

## ✅ Requirements Status

All requirements from the Kyte case have been **fully implemented**:

### 1. Handle incoming events from Kyte backend ✅

#### a) `order_created` - IMPLEMENTED

- **Endpoint:** `POST /api/orders/`
- **How it works:** Mock Kyte backend sends new orders to the restaurant API
- **Test:** `curl -X POST http://localhost:8001/simulate-order`

#### b) `order_cancelled` - IMPLEMENTED

- **Endpoint:** `POST /webhook/cancel-order?order_id={id}`
- **How it works:** Kyte backend can cancel orders, restaurant receives the cancellation
- **Test:** `curl -X POST "http://localhost:8001/webhook/cancel-order?order_id=ORD-XXX"`

### 2. Restaurant can choose preparation_rejected or preparation_accepted ✅

- **UI Implementation:** Order detail view shows "Accept" and "Reject" buttons for pending orders
- **API:** `PATCH /api/orders/{id}/` with `{"status": "accepted"}` or `{"status": "rejected"}`
- **Status mapping:**
  - Restaurant accepts → `preparation_accepted`
  - Restaurant rejects → `preparation_rejected`

### 3. Notify Kyte backend about order progress ✅

After order acceptance, restaurant can notify Kyte about:

#### a) `preparation_delayed` - IMPLEMENTED

- **UI Button:** "Mark as Delayed" (visible when status is `accepted`)
- **Webhook:** Automatically sent to `POST /webhook/order-status?order_id={id}&status=delayed`
- **Kyte receives:** `preparation_delayed`

#### b) `preparation_cancelled` - IMPLEMENTED

- **UI Button:** "Cancel Preparation" (visible when status is `accepted`)
- **Webhook:** Automatically sent to `POST /webhook/order-status?order_id={id}&status=cancelled`
- **Kyte receives:** `preparation_cancelled`

#### c) `preparation_done` - IMPLEMENTED

- **UI Button:** "Mark as Done" (visible when status is `accepted`)
- **Webhook:** Automatically sent to `POST /webhook/order-status?order_id={id}&status=completed`
- **Kyte receives:** `preparation_done`

---

## 🔄 Webhook Flow

### Restaurant → Kyte Notifications

When restaurant staff updates an order status, the system:

1. **Updates** the order in the database
2. **Sends webhook** to Kyte backend at `http://localhost:8001/webhook/order-status`
3. **Maps statuses:**
   - `accepted` → `preparation_accepted`
   - `rejected` → `preparation_rejected`
   - `delayed` → `preparation_delayed`
   - `cancelled` → `preparation_cancelled`
   - `completed` → `preparation_done`

**Implementation location:** `/backend/orders/views.py` - `notify_kyte_backend()` function

### Kyte → Restaurant Events

Kyte backend can:

1. **Create orders:** `POST /api/orders/`
2. **Cancel orders:** `POST /webhook/cancel-order?order_id={id}`

**Implementation location:** `/mock_kyte_backend/mock_server.py`

---

## 🧪 Testing

### End-to-End Test Scenario

```bash
# 1. Create a new order (Kyte → Restaurant)
curl -X POST http://localhost:8001/simulate-order

# Response includes order ID, e.g., ORD-1760987170-4531

# 2. Restaurant accepts the order (Restaurant → Kyte webhook sent)
curl -X PATCH http://localhost:8000/api/orders/ORD-1760987170-4531/ \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'

# 3. Restaurant marks as delayed (Restaurant → Kyte webhook sent)
curl -X PATCH http://localhost:8000/api/orders/ORD-1760987170-4531/ \
  -H "Content-Type: application/json" \
  -d '{"status":"delayed"}'

# 4. Restaurant marks as done (Restaurant → Kyte webhook sent)
curl -X PATCH http://localhost:8000/api/orders/ORD-1760987170-4531/ \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# 5. Kyte cancels the order (Kyte → Restaurant)
curl -X POST "http://localhost:8001/webhook/cancel-order?order_id=ORD-1760987170-4531"
```

### Check Webhook Logs

Look at the mock Kyte backend terminal output for webhook notifications:

```
[WEBHOOK] Received status update for order ORD-XXX: accepted
[KYTE] Order ORD-XXX status changed to: preparation_accepted
```

---

## 📁 Files Modified

1. **`/backend/orders/views.py`**

   - Added `notify_kyte_backend()` function
   - Modified `OrderDetailView.patch()` to send webhooks on status change

2. **`/backend/restaurant_app/settings.py`**

   - Added `KYTE_BACKEND_URL` configuration

3. **`/backend/requirements.txt`**

   - Added `requests==2.31.0` for HTTP webhooks

4. **`/mock_kyte_backend/mock_server.py`**
   - Added `POST /webhook/order-status` - receives status updates from restaurant
   - Added `POST /webhook/cancel-order` - cancels orders from Kyte side

---

## 🎯 Status Mapping Table

| Restaurant Status | Kyte Event Name         | Direction         |
| ----------------- | ----------------------- | ----------------- |
| `pending`         | `order_created`         | Kyte → Restaurant |
| `accepted`        | `preparation_accepted`  | Restaurant → Kyte |
| `rejected`        | `preparation_rejected`  | Restaurant → Kyte |
| `delayed`         | `preparation_delayed`   | Restaurant → Kyte |
| `cancelled`       | `preparation_cancelled` | Bidirectional     |
| `completed`       | `preparation_done`      | Restaurant → Kyte |

---

## 🚀 How to Use

### Start the Application

```bash
# Terminal 1: Django Backend
cd backend
python3 manage.py runserver

# Terminal 2: Mock Kyte Backend
cd mock_kyte_backend
python3 mock_server.py

# Terminal 3: React Frontend
cd frontend
npm start
```

### Use the Web Interface

1. Open http://localhost:3000
2. Create test orders at http://localhost:8001/docs
3. Click orders in the UI to view details
4. Use action buttons to change status
5. Watch webhook logs in the mock Kyte backend terminal

---

## 🔍 API Documentation

### Restaurant API (Django)

- `GET /api/orders/` - List all orders
- `POST /api/orders/` - Create order (used by Kyte)
- `GET /api/orders/{id}/` - Get order details
- `PATCH /api/orders/{id}/` - Update order status

### Mock Kyte Backend (FastAPI)

- `GET /docs` - Interactive API documentation
- `POST /simulate-order` - Create a random test order
- `POST /simulate-bulk-orders?count=5` - Create multiple orders
- `POST /webhook/order-status` - Receive status updates from restaurant
- `POST /webhook/cancel-order` - Cancel an order

---

## ✅ All Requirements Completed

✅ Handle `order_created` events from Kyte  
✅ Handle `order_cancelled` events from Kyte  
✅ Restaurant can choose `preparation_rejected` or `preparation_accepted`  
✅ Notify Kyte about `preparation_delayed`  
✅ Notify Kyte about `preparation_cancelled`  
✅ Notify Kyte about `preparation_done`

**Status:** Production Ready 🎉
