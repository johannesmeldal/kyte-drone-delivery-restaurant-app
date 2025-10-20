import React from 'react';
import OrderCard from './OrderCard';
import './OrderList.css';

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
  special_instructions?: string;
  items: OrderItem[];
}

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: string;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onSelectOrder, selectedOrderId }) => {
  const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'accepted'
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'cancelled'
  );

  return (
    <div className="order-list">
      <div className="order-section">
        <h3>Active Orders ({pendingOrders.length})</h3>
        <div className="order-cards">
          {pendingOrders.length === 0 ? (
            <div className="empty-state">
              <p>No active orders</p>
            </div>
          ) : (
            pendingOrders.map(order => (
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
      
      <div className="order-section">
        <h3>Recent Orders ({completedOrders.length})</h3>
        <div className="order-cards">
          {completedOrders.length === 0 ? (
            <div className="empty-state">
              <p>No recent orders</p>
            </div>
          ) : (
            completedOrders.slice(0, 5).map(order => (
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

export default OrderList;
