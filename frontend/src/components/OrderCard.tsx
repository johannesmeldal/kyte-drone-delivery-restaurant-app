import React from 'react';
import './OrderCard.css';
import { formatOrderNumber } from '../utils/orderUtils';

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
  special_instructions?: string;
  items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isSelected, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'delayed': return '#f97316';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`order-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="order-header">
        <div className="order-info">
          <span className="order-id">{formatOrderNumber(order)}</span>
          <span className="order-time">{formatTime(order.created_at)}</span>
        </div>
        <div 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status.toUpperCase()}
        </div>
      </div>
      
      <div className="order-details">
        <div className="customer-info">
          <strong>{order.customer_name}</strong>
          <span className="customer-address">{order.delivery_address}</span>
        </div>
        
        <div className="order-items">
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-quantity">{item.quantity}x</span>
              <span className="item-name">{item.name}</span>
            </div>
          ))}
        </div>
        
        <div className="order-total">
          Total: ${order.total_amount}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
