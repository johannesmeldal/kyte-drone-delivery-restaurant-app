# Testing Guide - Kyte Restaurant App

## Quick Start Testing

### 1. Start All Services

```bash
# Option A: Use the start script
./start.sh

# Option B: Manual start (3 separate terminals)
# Terminal 1
cd backend && python3 manage.py runserver

# Terminal 2
cd mock_kyte_backend && python3 mock_server.py

# Terminal 3
cd frontend && npm start
```

### 2. Access Points

- **Restaurant Dashboard (UI):** http://localhost:3000
- **Django API:** http://localhost:8000/api/orders/
- **Mock Kyte Backend API Docs:** http://localhost:8001/docs

---

## Testing Scenarios

### Scenario 1: Create and Accept Order

```bash
# Step 1: Create a test order
curl -X POST http://localhost:8001/simulate-order

# You'll receive a response with order ID like: ORD-1760987170-4531
# Copy the order_id from the response

# Step 2: Check it appears in the UI
# Open http://localhost:3000 - the order should be visible

# Step 3: Accept the order (triggers webhook to Kyte)
curl -X PATCH http://localhost:8000/api/orders/ORD-1760987170-4531/ \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'

# Step 4: Check webhook log
# In the mock_kyte_backend terminal, you should see:
# [WEBHOOK] Received status update for order ORD-XXX: accepted
# [KYTE] Order ORD-XXX status changed to: preparation_accepted
```

### Scenario 2: Complete Order Workflow

```bash
# Create order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:8001/simulate-order)
ORDER_ID=$(echo $ORDER_RESPONSE | grep -o 'ORD-[0-9]*-[0-9]*' | head -1)

echo "Created order: $ORDER_ID"

# Restaurant accepts
curl -X PATCH http://localhost:8000/api/orders/$ORDER_ID/ \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'

# Restaurant marks as done
curl -X PATCH http://localhost:8000/api/orders/$ORDER_ID/ \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

echo "Order $ORDER_ID completed!"
```

### Scenario 3: Order Delayed

```bash
# Create and accept order first
curl -X POST http://localhost:8001/simulate-order

# Mark as delayed (triggers webhook)
curl -X PATCH http://localhost:8000/api/orders/ORD-XXX/ \
  -H "Content-Type: application/json" \
  -d '{"status":"delayed"}'

# Check webhook: should show "preparation_delayed"
```

### Scenario 4: Restaurant Rejects Order

```bash
# Create order
curl -X POST http://localhost:8001/simulate-order

# Reject it
curl -X PATCH http://localhost:8000/api/orders/ORD-XXX/ \
  -H "Content-Type: application/json" \
  -d '{"status":"rejected"}'

# Check webhook: should show "preparation_rejected"
```

### Scenario 5: Kyte Cancels Order

```bash
# Create order
curl -X POST http://localhost:8001/simulate-order

# Kyte cancels the order
curl -X POST "http://localhost:8001/webhook/cancel-order?order_id=ORD-XXX"

# Verify cancellation
curl http://localhost:8000/api/orders/ORD-XXX/

# Status should be "cancelled"
```

### Scenario 6: Bulk Order Creation

```bash
# Create 10 orders at once
curl -X POST "http://localhost:8001/simulate-bulk-orders?count=10"

# Check UI - should show all 10 orders
# Open http://localhost:3000
```

---

## UI Testing

### Test Flow in Browser

1. **Open Dashboard**

   - Go to http://localhost:3000
   - Should see "Kyte Restaurant Dashboard"

2. **Create Test Order**

   - Open http://localhost:8001/docs in new tab
   - Find `POST /simulate-order`
   - Click "Try it out" → "Execute"

3. **View Order in Dashboard**

   - Go back to http://localhost:3000
   - Order should appear (auto-refreshes every 5 seconds)

4. **Accept Order**

   - Click on the order card
   - Click "Accept Order" button
   - Order status should update
   - Check mock backend terminal for webhook log

5. **Mark as Done**
   - Click "Mark as Done" button
   - Status should change to completed
   - Check webhook log again

---

## Webhook Verification

### Check Webhook is Working

**In the mock Kyte backend terminal, you should see logs like:**

```
[WEBHOOK] Received status update for order ORD-1760987170-4531: accepted
[KYTE] Order ORD-1760987170-4531 status changed to: preparation_accepted
```

### Webhook Endpoints

**Restaurant → Kyte:**

```bash
POST http://localhost:8001/webhook/order-status?order_id={id}&status={status}
```

**Kyte → Restaurant:**

```bash
POST http://localhost:8001/webhook/cancel-order?order_id={id}
```

---

## Status Transitions

### Valid Status Changes

```
pending → accepted ✅
pending → rejected ✅

accepted → delayed ✅
accepted → cancelled ✅
accepted → completed ✅

Any status → cancelled (when Kyte cancels) ✅
```

---

## Troubleshooting

### Orders Not Appearing in UI

```bash
# Check if backend is running
curl http://localhost:8000/api/orders/

# Check if frontend can reach backend
# Open browser console at http://localhost:3000
# Look for CORS or network errors
```

### Webhook Not Working

```bash
# Check if mock Kyte backend is running
curl http://localhost:8001/

# Should return: {"message":"Mock Kyte Backend is running"}

# Test webhook directly
curl -X POST "http://localhost:8001/webhook/order-status?order_id=TEST-123&status=accepted"

# Should return success message
```

### Can't Create Orders

```bash
# Check Django migrations
cd backend
python3 manage.py migrate

# Check if database exists
ls -la db.sqlite3
```

---

## API Testing with curl

### Get All Orders

```bash
curl http://localhost:8000/api/orders/
```

### Get Specific Order

```bash
curl http://localhost:8000/api/orders/ORD-XXX/
```

### Update Order Status

```bash
curl -X PATCH http://localhost:8000/api/orders/ORD-XXX/ \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'
```

### Create Order Manually

```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-001",
    "customer_name": "Test Customer",
    "customer_phone": "+1-555-0000",
    "delivery_address": "123 Test St",
    "total_amount": 25.99,
    "status": "pending",
    "items": [
      {
        "name": "Test Item",
        "quantity": 2,
        "price": 12.99,
        "special_instructions": ""
      }
    ]
  }'
```

---

## Performance Testing

### Create 100 Orders

```bash
for i in {1..100}; do
  curl -X POST http://localhost:8001/simulate-order > /dev/null 2>&1
  echo "Created order $i"
done
```

### Check Order Count

```bash
curl -s http://localhost:8000/api/orders/ | grep -o '"id"' | wc -l
```

---

## Expected Behavior Checklist

- ✅ Orders appear in UI within 5 seconds
- ✅ Clicking order shows detail view
- ✅ Status buttons change based on current status
- ✅ Webhook logs appear in mock backend terminal
- ✅ Status updates reflect in UI
- ✅ Kyte cancellation works
- ✅ No errors in browser console
- ✅ No errors in backend terminals

---

## Clean Database for Fresh Testing

```bash
cd backend
rm db.sqlite3
python3 manage.py migrate
```

This will give you a fresh database with no orders.
