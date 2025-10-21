#!/bin/bash
# Initial server setup script
# Run this ONCE on the EC2 instance after first SSH connection

set -e

echo "🔧 Starting initial server setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    git \
    curl \
    build-essential

# Install Node.js (for frontend build if needed on server)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create log directory
echo "📁 Creating log directory..."
sudo mkdir -p /var/log/restaurant-app
sudo chown ubuntu:ubuntu /var/log/restaurant-app

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/kyte-restaurant-app

# Setup Nginx
echo "🌐 Configuring Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp /home/ubuntu/kyte-restaurant-app/server-setup/nginx.conf /etc/nginx/sites-available/restaurant-app
sudo ln -sf /etc/nginx/sites-available/restaurant-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup systemd service
echo "⚙️  Configuring systemd service..."
sudo cp /home/ubuntu/kyte-restaurant-app/server-setup/restaurant-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable restaurant-backend
sudo systemctl start restaurant-backend

# Setup firewall (if needed)
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (for future)
# Don't enable ufw if it blocks your SSH - ALB handles this

echo "✅ Initial setup complete!"
echo ""
echo "Next steps:"
echo "1. Generate a Django SECRET_KEY and add it to /etc/systemd/system/restaurant-backend.service"
echo "2. Run: sudo systemctl daemon-reload"
echo "3. Run: sudo systemctl restart restaurant-backend"
echo "4. Deploy your application using the deploy.sh script from your local machine"

