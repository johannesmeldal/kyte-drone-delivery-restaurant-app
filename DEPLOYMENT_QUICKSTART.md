# 🚀 Quick Deployment Guide

**Super quick reference for deploying to AWS EC2**

---

## 📝 Before You Start

✅ You've sent your SSH key  
✅ You have access: `ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58`  
✅ Code is pushed to GitHub

---

## 🎯 First Time Setup (Do Once)

### 1. SSH to Server
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
```

### 2. Clone & Setup
```bash
cd /home/ubuntu
git clone https://github.com/johannesmeldal/kyte-drone-delivery-restaurant-app.git kyte-restaurant-app
cd kyte-restaurant-app
./server-setup/initial-setup.sh
```

### 3. Generate SECRET_KEY
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output, then:
```bash
sudo nano /etc/systemd/system/restaurant-backend.service
```

Replace `CHANGE_THIS_IN_PRODUCTION` with your key. Save and exit (Ctrl+X, Y, Enter).

### 4. Setup Python & Database
```bash
cd /home/ubuntu/kyte-restaurant-app
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
pip install gunicorn
cd backend
python manage.py migrate --settings=restaurant_app.settings_production
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
cd ..
```

### 5. Start Everything
```bash
sudo systemctl daemon-reload
sudo systemctl start restaurant-backend
sudo systemctl enable restaurant-backend
sudo systemctl restart nginx
```

### 6. Check Status
```bash
sudo systemctl status restaurant-backend
sudo systemctl status nginx
```

✅ **First-time setup complete!**

---

## 🔄 Regular Deployments (After Code Changes)

### Option A: Automated (Recommended)

From your **local machine**:

```bash
cd /Users/johannesmeldal/kyte-restaurant-app
./deploy.sh
```

Done! 🎉

### Option B: Manual

```bash
# 1. Build frontend locally
cd /Users/johannesmeldal/kyte-restaurant-app/frontend
npm run build
cd ..

# 2. Push to GitHub
git add -A
git commit -m "Your changes"
git push origin main

# 3. SSH to server
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58

# 4. Update on server
cd /home/ubuntu/kyte-restaurant-app
git pull origin main
source venv/bin/activate
cd backend
python manage.py migrate --settings=restaurant_app.settings_production
python manage.py collectstatic --noinput --settings=restaurant_app.settings_production
cd ..
sudo systemctl restart restaurant-backend
```

---

## 🧪 Test Deployment

```bash
# Health check
curl http://16.171.195.58/health

# API check
curl https://johannes-case.sandbox.aviant.no/api/orders/

# Browser check
open https://johannes-case.sandbox.aviant.no
```

---

## 🐛 Quick Troubleshooting

### View Logs
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
sudo journalctl -u restaurant-backend -f
```

### Restart Services
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
sudo systemctl restart restaurant-backend
sudo systemctl restart nginx
```

### Check What's Running
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
sudo systemctl status restaurant-backend
sudo systemctl status nginx
ps aux | grep gunicorn
```

---

## 📋 Common Commands

**Quick SSH:**
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58
```

**Quick Deploy:**
```bash
./deploy.sh
```

**Quick Restart:**
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58 "sudo systemctl restart restaurant-backend"
```

**View Logs:**
```bash
ssh -i ~/.ssh/ided25519-aws-ec2 ubuntu@16.171.195.58 "sudo journalctl -u restaurant-backend -n 50"
```

---

## 🎯 Your URLs

- **Production**: https://johannes-case.sandbox.aviant.no
- **Direct IP**: http://16.171.195.58
- **Health Check**: http://16.171.195.58/health
- **API**: https://johannes-case.sandbox.aviant.no/api/orders/

---

## ✅ Deployment Checklist

- [ ] First-time setup completed
- [ ] SECRET_KEY generated and set
- [ ] Services running (`systemctl status`)
- [ ] Health check works
- [ ] Frontend loads in browser
- [ ] API returns data
- [ ] Can create/update orders
- [ ] Touch interactions work
- [ ] Mobile responsive

---

## 📚 Need More Help?

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for:
- Detailed explanations
- Troubleshooting steps
- Security checklist
- Monitoring setup
- Emergency procedures

---

**Quick Status Check:**
```bash
curl http://16.171.195.58/health && echo " ✅ Server is up!"
```

**All Good?** 🎉 Your app is live at https://johannes-case.sandbox.aviant.no

