import React from "react";
import "./OrderDetail.css";

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

interface OrderDetailProps {
  order: Order;
  onAction: (orderId: string, action: string) => void;
  onClose: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onAction,
  onClose,
}) => {
  const getActionButtons = () => {
    switch (order.status) {
      case "pending":
        return (
          <div className="action-buttons">
            <button
              className="btn btn-accept"
              onClick={() => onAction(order.id, "accepted")}
            >
              Accept Order
            </button>
            <button
              className="btn btn-reject"
              onClick={() => onAction(order.id, "rejected")}
            >
              Reject Order
            </button>
          </div>
        );
      case "accepted":
        return (
          <div className="action-buttons">
            <button
              className="btn btn-warning"
              onClick={() => onAction(order.id, "delayed")}
            >
              Mark as Delayed
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onAction(order.id, "cancelled")}
            >
              Cancel Preparation
            </button>
            <button
              className="btn btn-success"
              onClick={() => onAction(order.id, "completed")}
            >
              Mark as Done
            </button>
          </div>
        );
      case "delayed":
        return (
          <div className="action-buttons">
            <button
              className="btn btn-danger"
              onClick={() => onAction(order.id, "cancelled")}
            >
              Cancel Preparation
            </button>
            <button
              className="btn btn-success"
              onClick={() => onAction(order.id, "completed")}
            >
              Mark as Done
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <h2>Order #{order.id}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="order-detail-content">
        <div className="detail-section">
          <h3>Customer Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>{order.customer_name}</span>
            </div>
            <div className="detail-item">
              <label>Phone:</label>
              <span>{order.customer_phone}</span>
            </div>
            <div className="detail-item">
              <label>Delivery Address:</label>
              <span>{order.delivery_address}</span>
            </div>
            <div className="detail-item">
              <label>Order Time:</label>
              <span>{formatDateTime(order.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="item-detail">
                <div className="item-info">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                  {item.special_instructions && (
                    <span className="item-instructions">
                      Note: {item.special_instructions}
                    </span>
                  )}
                </div>
                <span className="item-price">${item.price}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ${order.total_amount}</strong>
          </div>
        </div>

        <div className="detail-section">
          <h3>Order Status</h3>
          <div className="status-timeline">
            <div
              className={`timeline-item ${
                order.status === "pending" ? "active" : "completed"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>Order Received</span>
            </div>
            <div
              className={`timeline-item ${
                order.status === "accepted"
                  ? "active"
                  : order.status === "pending"
                  ? "pending"
                  : "completed"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>Order Accepted</span>
            </div>
            <div
              className={`timeline-item ${
                order.status === "completed"
                  ? "active"
                  : order.status === "accepted"
                  ? "pending"
                  : "inactive"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>Preparation Complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-detail-footer">{getActionButtons()}</div>
    </div>
  );
};

export default OrderDetail;
