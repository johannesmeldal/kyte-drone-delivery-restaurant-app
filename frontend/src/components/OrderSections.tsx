import React, { useState } from "react";
import OrderCard from "./OrderCard";
import TabNavigation from "./TabNavigation";
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
  ready_at?: string | null;
  completed_at?: string | null;
  special_instructions?: string;
  items: OrderItem[];
}

interface OrderSectionsProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: string;
}

const OrderSections: React.FC<OrderSectionsProps> = ({
  orders,
  onSelectOrder,
  selectedOrderId,
}) => {
  const [activeTab, setActiveTab] = useState<string>("incoming");
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(false);

  // Filter orders by status
  const incomingOrders = orders.filter((order) => order.status === "pending");
  const activeOrders = orders.filter(
    (order) => order.status === "accepted" || order.status === "delayed"
  );
  const readyOrders = orders.filter((order) => order.status === "ready");
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );
  const cancelledOrders = orders.filter(
    (order) => order.status === "rejected" || order.status === "cancelled"
  );

  // Get counts for badges
  const counts = {
    incoming: incomingOrders.length,
    active: activeOrders.length,
    ready: readyOrders.length,
  };

  // Determine which orders to display based on active tab
  const getDisplayedOrders = () => {
    switch (activeTab) {
      case "incoming":
        return incomingOrders;
      case "active":
        return activeOrders;
      case "ready":
        return readyOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return [];
    }
  };

  const displayedOrders = getDisplayedOrders();

  // Get tab title and color
  const getTabInfo = () => {
    switch (activeTab) {
      case "incoming":
        return { title: "Incoming Orders", color: "gray" };
      case "active":
        return { title: "Active Orders", color: "blue" };
      case "ready":
        return { title: "Ready for Pickup", color: "orange" };
      case "completed":
        return { title: "Completed Orders", color: "green" };
      case "cancelled":
        return { title: "Cancelled/Rejected", color: "red" };
      default:
        return { title: "", color: "gray" };
    }
  };

  const tabInfo = getTabInfo();

  // Check if order has been ready for more than 10 minutes
  const getWaitingTime = (order: Order) => {
    if (!order.ready_at) return 0;
    const readyTime = new Date(order.ready_at).getTime();
    const now = new Date().getTime();
    return Math.floor((now - readyTime) / 1000 / 60); // minutes
  };

  return (
    <div className="order-sections-container">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        showSecondaryMenu={showSecondaryMenu}
        onToggleSecondaryMenu={() => setShowSecondaryMenu(!showSecondaryMenu)}
      />

      <div className={`tab-content tab-${tabInfo.color}`}>
        <div className="tab-header">
          <h2>{tabInfo.title}</h2>
          <span className="order-count">{displayedOrders.length}</span>
        </div>

        <div className="orders-list">
          {displayedOrders.length === 0 ? (
            <div className="empty-state">
              {activeTab === "incoming" && "No new orders"}
              {activeTab === "active" && "No orders in progress"}
              {activeTab === "ready" && "No orders ready for pickup"}
              {activeTab === "completed" && "No completed orders"}
              {activeTab === "cancelled" && "No cancelled orders"}
            </div>
          ) : (
            displayedOrders.map((order) => {
              const waitingMinutes = getWaitingTime(order);
              const showWarning = activeTab === "ready" && waitingMinutes > 10;

              return (
                <div key={order.id} className="order-card-wrapper">
                  <OrderCard
                    order={order}
                    isSelected={selectedOrderId === order.id}
                    onClick={() => onSelectOrder(order)}
                  />
                  {showWarning && (
                    <div className="waiting-warning">
                      Ready for {waitingMinutes} minutes — Consider nudging Kyte
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSections;
