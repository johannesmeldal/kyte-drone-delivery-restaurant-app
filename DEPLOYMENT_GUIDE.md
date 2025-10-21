# 🚀 Deployment Guide - AWS EC2

Complete guide for deploying the Restaurant App to AWS EC2 at `https://johannes-case.sandbox.aviant.no`

---

## 📋 Server Information

- **Server**: AWS EC2 Ubuntu instance
- **IP**: `16.171.195.58`
- **Domain**: `johannes-case.sandbox.aviant.no`
- **Port**: 80 (HTTP, ALB terminates TLS)
- **SSH Key**: `~/.ssh/ided25519-aws-ec2`
- **User**: `ubuntu`

---

## 🏁 First-Time Setup (Run Once on Server)

### Step 1: SSH into the Server

```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
```

### Step 2: Clone the Repository

```bash
cd /home/ubuntu
git clone https://github.com/johannesmeldal/kyte-drone-delivery-restaurant-app.git kyte-restaurant-app
cd kyte-restaurant-app
```

### Step 3: Run Initial Setup Script

```bash
chmod +x server-setup/initial-setup.sh
./server-setup/initial-setup.sh
```

This script will:
- Update system packages
- Install Python, Node.js, Nginx, and dependencies
- Create log directories
- Configure Nginx
- Setup systemd service
- Configure firewall rules

### Step 4: Generate SECRET_KEY

```bash
# Generate a new Django SECRET_KEY
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and update the service file:

```bash
sudo nano /etc/systemd/system/restaurant-backend.service
```

Replace `CHANGE_THIS_IN_PRODUCTION` with your generated key.

### Step 5: Setup Python Environment

```bash
cd /home/ubuntu/kyte-restaurant-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install gunicorn
```

### Step 6: Initialize Database

```bash
cd backend
python manage.py migrate --settings=restaurant_app.settings_production
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
cd ..
```

### Step 7: Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start and enable backend service
sudo systemctl start restaurant-backend
sudo systemctl enable restaurant-backend

# Restart nginx
sudo systemctl restart nginx
```

### Step 8: Check Service Status

```bash
# Check backend service
sudo systemctl status restaurant-backend

# Check nginx
sudo systemctl status nginx

# View logs
sudo journalctl -u restaurant-backend -f
tail -f /var/log/restaurant-app/gunicorn-error.log
```

---

## 🔄 Regular Deployment (After Code Changes)

### From Your Local Machine:

#### Option 1: Automated Deployment Script (Recommended)

```bash
# Build frontend and deploy everything
./deploy.sh
```

#### Option 2: Manual Deployment

```bash
# 1. Build frontend locally
cd frontend
npm run build
cd ..

# 2. Sync files to server
rsync -avz --delete \
  -e "ssh -i ~/.ssh/ided25519-aws-ec2" \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  --exclude 'frontend/node_modules' \
  --exclude 'venv' \
  ./ ubuntu@16.171.195.58:/home/ubuntu/kyte-restaurant-app/

# 3. SSH to server and restart
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58

# 4. On the server:
cd /home/ubuntu/kyte-restaurant-app
source venv/bin/activate
cd backend
python manage.py migrate --settings=restaurant_app.settings_production
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
cd ..
sudo systemctl restart restaurant-backend
```

---

## 🛠️ Common Operations

### View Logs

```bash
# Backend application logs
sudo journalctl -u restaurant-backend -f

# Gunicorn logs
tail -f /var/log/restaurant-app/gunicorn-access.log
tail -f /var/log/restaurant-app/gunicorn-error.log

# Nginx logs
sudo tail -f /var/log/nginx/restaurant-app-access.log
sudo tail -f /var/log/nginx/restaurant-app-error.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart restaurant-backend

# Restart nginx
sudo systemctl restart nginx

# Reload nginx config (without restart)
sudo nginx -t && sudo systemctl reload nginx
```

### Update Code from Git

```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
cd /home/ubuntu/kyte-restaurant-app
git pull origin main
source venv/bin/activate
cd backend
python manage.py migrate --settings=restaurant_app.settings_production
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
cd ..
sudo systemctl restart restaurant-backend
```

### Database Operations

```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
cd /home/ubuntu/kyte-restaurant-app
source venv/bin/activate
cd backend

# Run migrations
python manage.py migrate --settings=restaurant_app.settings_production

# Create superuser (for admin access)
python manage.py createsuperuser --settings=restaurant_app.settings_production

# Django shell
python manage.py shell --settings=restaurant_app.settings_production

# View database
python manage.py dbshell --settings=restaurant_app.settings_production
```

---

## 🧪 Testing the Deployment

### 1. Check Health Endpoint

```bash
curl http://16.171.195.58/health
# Should return: healthy
```

### 2. Test Backend API

```bash
curl https://johannes-case.sandbox.aviant.no/api/orders/
# Should return JSON with orders
```

### 3. Access Frontend

Open browser: `https://johannes-case.sandbox.aviant.no`

### 4. Test Full Workflow

1. Open dashboard at `https://johannes-case.sandbox.aviant.no`
2. Should see the restaurant dashboard
3. Test accepting/rejecting orders
4. Check all tabs (Incoming, Active, Ready, History)
5. Verify touch interactions work

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check service status
sudo systemctl status restaurant-backend

# View detailed logs
sudo journalctl -u restaurant-backend -n 100 --no-pager

# Check if port is in use
sudo netstat -tlnp | grep 8000
```

### Nginx Issues

```bash
# Test nginx config
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/restaurant-app-error.log
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R ubuntu:ubuntu /home/ubuntu/kyte-restaurant-app
sudo chown -R ubuntu:ubuntu /var/log/restaurant-app

# Fix log directory
sudo mkdir -p /var/log/restaurant-app
sudo chown ubuntu:ubuntu /var/log/restaurant-app
```

### Static Files Not Loading

```bash
cd /home/ubuntu/kyte-restaurant-app
source venv/bin/activate
cd backend
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
sudo systemctl restart restaurant-backend
sudo systemctl restart nginx
```

### Database Issues

```bash
# Reset database (CAUTION: Deletes all data!)
cd /home/ubuntu/kyte-restaurant-app/backend
rm db.sqlite3
python manage.py migrate --settings=restaurant_app.settings_production
```

---

## 🔐 Security Checklist

- [x] DEBUG = False in production settings
- [x] SECRET_KEY is unique and not in git
- [x] ALLOWED_HOSTS configured correctly
- [x] CSRF protection enabled
- [x] SSL handled by ALB
- [ ] Regular security updates (`sudo apt update && sudo apt upgrade`)
- [ ] Firewall configured (if needed)
- [ ] Backup strategy in place

---

## 📊 Monitoring

### Check Resource Usage

```bash
# CPU and memory
htop

# Disk usage
df -h

# Check processes
ps aux | grep gunicorn
ps aux | grep nginx
```

### Service Health

```bash
# All services status
sudo systemctl status restaurant-backend nginx

# Check if services are enabled
sudo systemctl is-enabled restaurant-backend
sudo systemctl is-enabled nginx
```

---

## 🚨 Emergency Procedures

### Quick Rollback

```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
cd /home/ubuntu/kyte-restaurant-app
git log --oneline -n 5  # See recent commits
git reset --hard <previous-commit-hash>
sudo systemctl restart restaurant-backend
```

### Stop All Services

```bash
sudo systemctl stop restaurant-backend
sudo systemctl stop nginx
```

### Restart All Services

```bash
sudo systemctl restart restaurant-backend
sudo systemctl restart nginx
```

---

## 📞 Quick Reference

**SSH Access:**
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
```

**Deploy:**
```bash
./deploy.sh
```

**Restart:**
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58 "sudo systemctl restart restaurant-backend"
```

**Logs:**
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58 "sudo journalctl -u restaurant-backend -f"
```

**URL:**
```
https://johannes-case.sandbox.aviant.no
```

---

## ✅ Post-Deployment Checklist

After each deployment:

- [ ] Services are running (`systemctl status`)
- [ ] Health endpoint responds (`curl /health`)
- [ ] API returns data (`curl /api/orders/`)
- [ ] Frontend loads in browser
- [ ] All tabs functional
- [ ] Touch interactions work
- [ ] Orders can be created/updated
- [ ] Check error logs
- [ ] Test on mobile/tablet

---

## 🎯 Next Steps After Deployment

1. Test the live application thoroughly
2. Monitor logs for any errors
3. Set up automated backups
4. Configure monitoring/alerting (optional)
5. Document any custom configurations
6. Test with real orders from mock backend

---

**Need Help?** Check logs first, then review troubleshooting section above.

**All Good?** 🎉 Your application is live at `https://johannes-case.sandbox.aviant.no`!

