#!/usr/bin/env bash
set -e

echo "=========================================="
echo "CongressWatch Cloudflare Provisioning Tool"
echo "=========================================="

echo "Step 1: Checking Wrangler Authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "[-] You are not logged into Cloudflare Wrangler."
  echo "[-] Please run: npx wrangler login"
  exit 1
fi

echo "[+] Authenticated! Provisioning resources..."

echo "1. Creating Cloudflare D1 Database (congresswatch-db)..."
npx wrangler d1 create congresswatch-db || true

echo "2. Creating Cloudflare R2 Bucket (watchers)..."
npx wrangler r2 bucket create watchers || true

echo "3. Creating Cloudflare KV Namespace (congresswatch-api-cache)..."
npx wrangler kv namespace create API_CACHE_KV || true

echo "4. Creating Cloudflare Vectorize Index (congresswatch-vectors, 768 dims)..."
npx wrangler vectorize create congresswatch-vectors --dimensions=768 --metric=cosine || true

echo "5. Creating Cloudflare Queues (congresswatch-ingestion, congresswatch-ocr)..."
npx wrangler queues create congresswatch-ingestion || true
npx wrangler queues create congresswatch-ocr || true

echo "6. Applying D1 Database Migrations..."
npx wrangler d1 migrations apply congresswatch-db --remote

echo "=========================================="
echo "[+] All Cloudflare resources successfully provisioned!"
echo "=========================================="

EOF && chmod +x scripts/provision-cloudflare.sh