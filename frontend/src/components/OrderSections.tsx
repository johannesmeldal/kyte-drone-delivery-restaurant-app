import React, { useState } from "react";
import OrderCard from "./OrderCard";
import "./OrderSections.css";

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

interface OrderSectionsProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: string;
}

type SortBy = "completed_at" | "created_at";
type FilterBy = "completed" | "cancelled";

const OrderSections: React.FC<OrderSectionsProps> = ({
  orders,
  onSelectOrder,
  selectedOrderId,
}) => {
  const [recentOrdersSort, setRecentOrdersSort] =
    useState<SortBy>("completed_at");
  const [recentOrdersFilter, setRecentOrdersFilter] =
    useState<FilterBy>("completed");

  // Incoming Orders: pending status
  const incomingOrders = orders.filter((order) => order.status === "pending");

  // Active Orders: accepted or delayed status
  const activeOrders = orders.filter(
    (order) => order.status === "accepted" || order.status === "delayed"
  );

  // Recent Orders: completed, rejected, or cancelled
  const allRecentOrders = orders.filter(
    (order) =>
      order.status === "completed" ||
      order.status === "rejected" ||
      order.status === "cancelled"
  );

  // Filter recent orders based on selected filter
  const filteredRecentOrders = allRecentOrders.filter((order) => {
    if (recentOrdersFilter === "completed") {
      return order.status === "completed";
    } else {
      // cancelled filter shows both rejected and cancelled
      return order.status === "rejected" || order.status === "cancelled";
    }
  });

  // Sort recent orders based on selected sort option
  const sortedRecentOrders = [...filteredRecentOrders].sort((a, b) => {
    if (recentOrdersSort === "completed_at") {
      // Sort by completed_at (most recent first)
      const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return timeB - timeA;
    } else {
      // Sort by created_at (most recent first)
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    }
  });

  const toggleSort = () => {
    setRecentOrdersSort((prev) =>
      prev === "completed_at" ? "created_at" : "completed_at"
    );
  };

  const toggleFilter = () => {
    setRecentOrdersFilter((prev) =>
      prev === "completed" ? "cancelled" : "completed"
    );
  };

  return (
    <div className="order-sections">
      {/* Incoming Orders Section */}
      <div className="order-section">
        <div className="section-header">
          <h2>Incoming Orders</h2>
          <span className="section-count">{incomingOrders.length}</span>
        </div>
        <div className="section-content">
          {incomingOrders.length === 0 ? (
            <div className="empty-state">No incoming orders</div>
          ) : (
            incomingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                onClick={() => onSelectOrder(order)}
              />
            ))
          )}
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="order-section">
        <div className="section-header">
          <h2>Active Orders</h2>
          <span className="section-count">{activeOrders.length}</span>
        </div>
        <div className="section-content">
          {activeOrders.length === 0 ? (
            <div className="empty-state">No active orders</div>
          ) : (
            activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                onClick={() => onSelectOrder(order)}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="order-section recent-orders">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <div className="section-controls">
            <button className="filter-toggle" onClick={toggleFilter}>
              {recentOrdersFilter === "completed"
                ? "✓ Completed"
                : "✕ Cancelled/Rejected"}
            </button>
            <button className="sort-toggle" onClick={toggleSort}>
              Sort:{" "}
              {recentOrdersSort === "completed_at"
                ? "Completion"
                : "Order Time"}
            </button>
            <span className="section-count">{filteredRecentOrders.length}</span>
          </div>
        </div>
        <div className="section-content">
          {sortedRecentOrders.length === 0 ? (
            <div className="empty-state">
              No{" "}
              {recentOrdersFilter === "completed" ? "completed" : "cancelled"}{" "}
              orders
            </div>
          ) : (
            sortedRecentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                onClick={() => onSelectOrder(order)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSections;
