import React, { useState, useRef } from "react";
import "./App.css";
import OrderSections from "./components/OrderSections";
import OrderDetail from "./components/OrderDetail";
import { updateOrderStatus } from "./services/api";
import { SmartPollingTransport } from "./utils/orderTransport";
import { useSmartPolling } from "./hooks/useSmartPolling";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  ready_at?: string | null;
  completed_at?: string | null;
  special_instructions?: string;
  items: OrderItem[];
}

function App() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Initialize smart polling transport
  const transportRef = useRef(
    new SmartPollingTransport({
      baseInterval: 2000,
      maxInterval: 30000,
      backoffMultiplier: 1.5,
    })
  );

  // Use smart polling hook
  const {
    data: orders,
    isLoading,
    status,
    currentInterval,
    refresh,
  } = useSmartPolling<Order[]>(
    () => transportRef.current.fetchOrders(),
    2000,
    30000
  );

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      await updateOrderStatus(orderId, action);
      // Force immediate refresh after action
      refresh();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kyte Restaurant Dashboard</h1>
        <div className="status-indicator">
          <span
            className={`status-dot ${
              status === "connected"
                ? "online"
                : status === "polling"
                ? "polling"
                : "offline"
            }`}
          ></span>
          {status === "connected" && "✓ Live"}
          {status === "polling" && "Checking for updates..."}
          {status === "error" && "⚠ Connection Issue"}
        </div>
      </header>

      <div className="app-content">
        <div className="orders-section">
          <OrderSections
            orders={orders || []}
            onSelectOrder={setSelectedOrder}
            selectedOrderId={selectedOrder?.id}
          />
        </div>

        {selectedOrder && (
          <div className="order-detail-section">
            <OrderDetail
              order={selectedOrder}
              onAction={handleOrderAction}
              onClose={() => setSelectedOrder(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
