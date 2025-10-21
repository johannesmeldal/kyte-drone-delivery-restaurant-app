import React, { useState } from "react";
import "./OrderDetail.css";
import { formatOrderNumber } from "../utils/orderUtils";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  display_number?: number;
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
  const [issueSummary, setIssueSummary] = useState("");
  const [showIssueReport, setShowIssueReport] = useState(false);

  const handleCallDrone = () => {
    // Mock function - in real implementation, this would trigger Kyte API
    alert(`Calling Kyte to pick up order ${order.id}...`);
    console.log("Call drone requested for order:", order.id);
  };

  const handleNudgeKyte = () => {
    // Mock function - send nudge to Kyte about delayed pickup
    alert(`Nudge sent to Kyte about order ${order.id} waiting for pickup`);
    console.log("Nudge sent for order:", order.id);
  };

  const handleReportIssue = () => {
    if (!issueSummary.trim()) {
      alert("Please describe the issue");
      return;
    }
    // Mock function - in real implementation, this would send issue to Kyte
    alert(`Issue reported for order ${order.id}: ${issueSummary}`);
    console.log("Issue reported:", { orderId: order.id, issue: issueSummary });
    setShowIssueReport(false);
    setIssueSummary("");
  };

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
              onClick={() => onAction(order.id, "ready")}
            >
              Mark as Ready
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
              onClick={() => onAction(order.id, "ready")}
            >
              Mark as Ready
            </button>
          </div>
        );

      case "ready":
        return (
          <div className="action-buttons ready-actions">
            <button className="btn btn-info" onClick={handleCallDrone}>
              Call Drone
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onAction(order.id, "completed")}
            >
              Confirm Pickup
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowIssueReport(!showIssueReport)}
            >
              Report Issue
            </button>

            {showIssueReport && (
              <div className="issue-report-form">
                <textarea
                  className="issue-textarea"
                  placeholder="Describe the issue (e.g., food damaged, wrong order, etc.)"
                  value={issueSummary}
                  onChange={(e) => setIssueSummary(e.target.value)}
                  rows={3}
                />
                <div className="issue-actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={handleReportIssue}
                  >
                    Submit Report
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setShowIssueReport(false);
                      setIssueSummary("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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

  const getWaitingTime = () => {
    if (!order.ready_at) return null;
    const readyTime = new Date(order.ready_at).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - readyTime) / 1000 / 60);
    return minutes;
  };

  const waitingMinutes = getWaitingTime();

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <h2>Order {formatOrderNumber(order)}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="order-detail-content">
        {order.status === "ready" && waitingMinutes && waitingMinutes > 10 && (
          <div className="alert-banner">
            <div>
              <strong>
                This order has been ready for {waitingMinutes} minutes
              </strong>
              <p>Consider nudging Kyte to speed up pickup</p>
            </div>
            <button
              className="btn btn-sm btn-warning"
              onClick={handleNudgeKyte}
            >
              Nudge Kyte
            </button>
          </div>
        )}

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
            {order.ready_at && (
              <div className="detail-item">
                <label>Ready Since:</label>
                <span>{formatDateTime(order.ready_at)}</span>
              </div>
            )}
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
                order.status === "pending"
                  ? "active"
                  : ["accepted", "delayed", "ready", "completed"].includes(
                      order.status
                    )
                  ? "completed"
                  : "inactive"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>Order Received</span>
            </div>
            <div
              className={`timeline-item ${
                order.status === "accepted" || order.status === "delayed"
                  ? "active"
                  : order.status === "pending" ||
                    order.status === "rejected" ||
                    order.status === "cancelled"
                  ? "inactive"
                  : "completed"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>
                {order.status === "delayed"
                  ? "In Progress (Delayed)"
                  : "In Progress"}
              </span>
            </div>
            <div
              className={`timeline-item ${
                order.status === "ready"
                  ? "active"
                  : ["accepted", "delayed"].includes(order.status)
                  ? "inactive"
                  : order.status === "completed"
                  ? "completed"
                  : "inactive"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>Ready for Pickup</span>
            </div>
            <div
              className={`timeline-item ${
                order.status === "completed"
                  ? "active"
                  : order.status === "ready"
                  ? "inactive"
                  : "inactive"
              }`}
            >
              <div className="timeline-dot"></div>
              <span>Picked Up</span>
            </div>
          </div>
          {(order.status === "rejected" || order.status === "cancelled") && (
            <div className="status-message cancelled">
              <strong>
                {order.status === "rejected"
                  ? "Order Rejected"
                  : "Order Cancelled"}
              </strong>
            </div>
          )}
        </div>
      </div>

      <div className="order-detail-footer">{getActionButtons()}</div>
    </div>
  );
};

export default OrderDetail;
