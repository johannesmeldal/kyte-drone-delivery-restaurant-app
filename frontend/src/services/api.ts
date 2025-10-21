import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOrders = () => {
  return api.get('/orders/');
};

export const getOrdersConditional = (etag?: string, lastModified?: string) => {
  const headers: any = {};
  if (etag) headers['If-None-Match'] = etag;
  if (lastModified) headers['If-Modified-Since'] = lastModified;
  
  return api.get('/orders/', { 
    headers,
    validateStatus: (status) => status === 200 || status === 304
  });
};

export const getOrdersSince = (timestamp: string) => {
  return api.get(`/orders/?since=${timestamp}`);
};

export const getOrder = (id: string) => {
  return api.get(`/orders/${id}/`);
};

export const updateOrderStatus = (id: string, status: string) => {
  return api.patch(`/orders/${id}/`, { status });
};

export const createOrder = (orderData: any) => {
  return api.post('/orders/', orderData);
};

export default api;
