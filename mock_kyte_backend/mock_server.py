from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import random
import time
from datetime import datetime
from typing import List, Dict, Any

app = FastAPI(title="Mock Kyte Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Restaurant API endpoint
RESTAURANT_API_URL = "http://localhost:8000/api"

# Sample menu items for generating orders
MENU_ITEMS = [
    {"name": "Margherita Pizza", "price": 12.99},
    {"name": "Pepperoni Pizza", "price": 14.99},
    {"name": "Caesar Salad", "price": 8.99},
    {"name": "Chicken Wings", "price": 10.99},
    {"name": "Pasta Carbonara", "price": 13.99},
    {"name": "Burger Deluxe", "price": 11.99},
    {"name": "Fish & Chips", "price": 9.99},
    {"name": "Chicken Curry", "price": 12.99},
]

# Sample customer data
CUSTOMERS = [
    {"name": "John Smith", "phone": "+1-555-0123", "address": "123 Oak Street, Garden District"},
    {"name": "Sarah Johnson", "phone": "+1-555-0456", "address": "456 Pine Avenue, Riverside"},
    {"name": "Mike Wilson", "phone": "+1-555-0789", "address": "789 Elm Drive, Hillside"},
    {"name": "Emma Davis", "phone": "+1-555-0321", "address": "321 Maple Lane, Downtown"},
    {"name": "David Brown", "phone": "+1-555-0654", "address": "654 Cedar Road, Uptown"},
]

def generate_order_id():
    return f"ORD-{int(time.time())}-{random.randint(1000, 9999)}"

def generate_random_order():
    customer = random.choice(CUSTOMERS)
    num_items = random.randint(1, 4)
    items = random.sample(MENU_ITEMS, num_items)
    
    order_items = []
    total_amount = 0
    
    for item in items:
        quantity = random.randint(1, 3)
        order_items.append({
            "name": item["name"],
            "quantity": quantity,
            "price": item["price"],
            "special_instructions": random.choice([
                "Extra spicy",
                "No onions",
                "Well done",
                "Medium rare",
                ""
            ]) if random.random() > 0.7 else ""
        })
        total_amount += item["price"] * quantity
    
    return {
        "id": generate_order_id(),
        "customer_name": customer["name"],
        "customer_phone": customer["phone"],
        "delivery_address": customer["address"],
        "total_amount": round(total_amount, 2),
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "special_instructions": random.choice([
            "Please ring the doorbell",
            "Leave at front door",
            "Call when arrived",
            ""
        ]) if random.random() > 0.8 else "",
        "items": order_items
    }

@app.get("/")
async def root():
    return {"message": "Mock Kyte Backend is running"}

@app.post("/simulate-order")
async def simulate_order():
    """Simulate a new order from a customer"""
    try:
        order_data = generate_random_order()
        
        # Send order to restaurant API
        response = requests.post(
            f"{RESTAURANT_API_URL}/orders/",
            json=order_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            return {
                "message": "Order simulated successfully",
                "order": order_data
            }
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to create order: {response.text}"
            )
            
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Restaurant API is not available. Make sure Django server is running."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orders")
async def get_orders():
    """Get all orders from restaurant API"""
    try:
        response = requests.get(f"{RESTAURANT_API_URL}/orders/")
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch orders")
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Restaurant API is not available"
        )

@app.post("/simulate-bulk-orders")
async def simulate_bulk_orders(count: int = 5):
    """Simulate multiple orders at once"""
    orders = []
    for _ in range(count):
        order_data = generate_random_order()
        try:
            response = requests.post(
                f"{RESTAURANT_API_URL}/orders/",
                json=order_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 201:
                orders.append(order_data)
        except:
            continue
    
    return {
        "message": f"Simulated {len(orders)} orders",
        "orders": orders
    }

@app.post("/webhook/order-status")
async def receive_order_status(order_id: str, status: str):
    """Receive order status updates from restaurant"""
    print(f"[WEBHOOK] Received status update for order {order_id}: {status}")
    
    # Log the status change
    status_map = {
        'accepted': 'preparation_accepted',
        'rejected': 'preparation_rejected',
        'delayed': 'preparation_delayed',
        'cancelled': 'preparation_cancelled',
        'completed': 'preparation_done'
    }
    
    kyte_status = status_map.get(status, status)
    
    print(f"[KYTE] Order {order_id} status changed to: {kyte_status}")
    
    return {
        "message": "Status update received",
        "order_id": order_id,
        "kyte_status": kyte_status,
        "received_at": datetime.now().isoformat()
    }

@app.post("/webhook/cancel-order")
async def cancel_order(order_id: str):
    """Cancel an order from Kyte side"""
    try:
        response = requests.patch(
            f"{RESTAURANT_API_URL}/orders/{order_id}/",
            json={"status": "cancelled", "cancelled_by": "kyte"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return {
                "message": "Order cancelled successfully",
                "order_id": order_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to cancel order: {response.text}"
            )
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Restaurant API is not available"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
