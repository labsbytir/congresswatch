# CongressWatch VPS Deployment Guide

> **Target Machine**: Ubuntu 24.04 LTS (8 GB RAM, 120 GB NVMe Storage)  
> **Roles**: Standalone Orama Search Cluster & Playwright Stealth SAM.gov Scraper

---

## 1. Initial VPS Server Setup

SSH into your VPS as root:
```bash
ssh root@<YOUR_VPS_IP>
```

Update system and install dependencies:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw python3-pip python3-venv nginx certbot python3-certbot-nginx
```

Install Node.js 22 LTS:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

Configure Firewall:
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 2. Deploying Orama Search Cluster

Clone the repository to the VPS:
```bash
cd /opt
git clone https://github.com/labsbytir/congresswatch.git
cd /opt/congresswatch/services/search-engine
npm install
```

Create systemd service for Orama (`/etc/systemd/system/orama-search.service`):
```ini
[Unit]
Description=CongressWatch Orama Search Cluster
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/congresswatch/services/search-engine
ExecStart=/usr/bin/npx ts-node server.ts
Restart=always
Environment=PORT=8080
Environment=ORAMA_API_SECRET=your_custom_secret_key_here

[Install]
WantedBy=multi-user.target
```

Start and enable Orama:
```bash
systemctl daemon-reload
systemctl enable --now orama-search
systemctl status orama-search
```

Configure Nginx reverse proxy (`/etc/nginx/sites-available/search.congresswatch.org`):
```nginx
server {
    server_name search.congresswatch.org;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and acquire SSL:
```bash
ln -s /etc/nginx/sites-available/search.congresswatch.org /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d search.congresswatch.org
```

---

## 3. Deploying SAM.gov Stealth Scraper

Navigate to the scraper directory and set up Python virtual environment:
```bash
cd /opt/congresswatch/services/scraper-vps
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install --with-deps chromium
```

Set Cloudflare R2 Credentials in `/opt/congresswatch/services/scraper-vps/.env`:
```ini
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=watchers
```

Add a cron job to scrape SAM.gov every 6 hours (`crontab -e`):
```bash
0 */6 * * * cd /opt/congresswatch/services/scraper-vps && /opt/congresswatch/services/scraper-vps/venv/bin/python3 scraper.py >> /var/log/sam_scraper.log 2>&1
```

