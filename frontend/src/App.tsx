import React, { useState, useEffect } from "react";
import "./App.css";
import OrderSections from "./components/OrderSections";
import OrderDetail from "./components/OrderDetail";
import { getOrders, updateOrderStatus } from "./services/api";

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
  completed_at?: string | null;
  special_instructions?: string;
  items: OrderItem[];
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      await updateOrderStatus(orderId, action);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (loading) {
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
          <span className="status-dot online"></span>
          Connected to Kyte Backend
        </div>
      </header>

      <div className="app-content">
        <div className="orders-section">
          <OrderSections
            orders={orders}
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
