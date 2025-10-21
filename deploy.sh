#!/bin/bash
set -e

echo "🚀 Starting deployment to AWS EC2..."

# Configuration
REMOTE_USER="ubuntu"
REMOTE_HOST="16.171.195.58"
REMOTE_PATH="/home/ubuntu/kyte-restaurant-app"
SSH_KEY="~/.ssh/id_rsa"

echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

echo "📤 Syncing files to remote server..."
rsync -avz --delete \
  -e "ssh -i $SSH_KEY" \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  --exclude 'frontend/node_modules' \
  --exclude 'venv' \
  --exclude 'db.sqlite3' \
  ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

echo "🔧 Running deployment commands on remote server..."
ssh -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd /home/ubuntu/kyte-restaurant-app

# Backend setup
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install gunicorn

echo "Running Django migrations..."
cd backend
python manage.py migrate --settings=restaurant_app.settings_production
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
cd ..

echo "Restarting services..."
sudo systemctl restart restaurant-backend
sudo systemctl restart nginx

echo "✅ Deployment complete!"
ENDSSH

echo "🎉 Deployment finished successfully!"
echo "🌐 Visit: https://johannes-case.sandbox.aviant.no"

