# Kyte Restaurant Order Management App

A web application for restaurants to manage orders received from the Kyte drone delivery backend.

## Features

- **Real-time Order Management**: Handle incoming orders from Kyte backend
- **Order Status Updates**: Accept, reject, delay, or complete orders
- **Webhook Notifications**: Automatically notify Kyte backend of status changes
- **Bidirectional Communication**: Receive order cancellations from Kyte
- **Tablet-Optimized Interface**: Designed for restaurant staff on tablets
- **Live Demonstration**: Mock Kyte backend for testing and demos

## Architecture

- **Frontend**: React.js with responsive design
- **Backend**: Django REST API
- **Mock Backend**: FastAPI server simulating Kyte backend

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- pip

### Installation

1. **Clone and setup**:

```bash
git clone <repository>
cd kyte-restaurant-app
```

2. **Start the backend**:

```bash
cd backend
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver
```

3. **Start the mock Kyte backend** (in another terminal):

```bash
cd mock_kyte_backend
pip install -r requirements.txt
python3 mock_server.py
```

4. **Start the frontend** (in another terminal):

```bash
cd frontend
npm install
npm start
```

### Access Points

- **Restaurant Dashboard**: http://localhost:3000
- **Django API**: http://localhost:8000/api
- **Mock Kyte Backend**: http://localhost:8001

### Demo Features

Visit the mock backend at http://localhost:8001/docs to:

- Simulate new orders: `POST /simulate-order`
- Generate bulk orders: `POST /simulate-bulk-orders?count=5`
- View all orders: `GET /orders`

## Order Flow

1. **Order Created**: Customer places order through Kyte app
2. **Restaurant Receives**: Order appears in restaurant dashboard (webhook: `order_created`)
3. **Restaurant Responds**: Accept or reject the order (webhook: `preparation_accepted` or `preparation_rejected`)
4. **Preparation Updates**: Mark as delayed, cancelled, or done (webhooks: `preparation_delayed`, `preparation_cancelled`, `preparation_done`)
5. **Order Complete**: Ready for drone pickup
6. **Kyte Cancellation**: Kyte can cancel orders at any time (webhook: `order_cancelled`)

## API Endpoints

### Restaurant API (Django)

- `GET /api/orders/` - List all orders
- `POST /api/orders/` - Create new order
- `PATCH /api/orders/{id}/` - Update order status

### Mock Kyte Backend (FastAPI)

- `POST /simulate-order` - Generate random order
- `POST /simulate-bulk-orders` - Generate multiple orders
- `GET /orders` - View all orders
- `POST /webhook/order-status` - Receive status updates from restaurant
- `POST /webhook/cancel-order` - Cancel an order from Kyte side

## Production Deployment

**Live URL**: https://johannes-case.sandbox.aviant.no

### Quick Deploy

```bash
./deploy.sh
```

### Full Instructions

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions including:

- Initial server setup
- SSH configuration
- Nginx and Gunicorn setup
- Deployment workflow
- Troubleshooting guide

**Server Details:**
- Platform: AWS EC2 Ubuntu
- IP: 16.171.195.58
- Port: 80 (TLS terminated by ALB)
- SSH: `ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58`

## Technologies Used

- **Frontend**: React, Axios, CSS Grid/Flexbox
- **Backend**: Django, Django REST Framework
- **Mock Backend**: FastAPI, Uvicorn
- **Database**: SQLite (development), PostgreSQL (production)
