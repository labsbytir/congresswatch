"""
CongressWatch VPS Stealth Scraper for SAM.gov
Bypasses Akamai/PerimeterX bot detection using Playwright stealth,
extracts solicitation metadata, and streams public PDF/DOCX attachments directly
to Cloudflare R2 (/watchers/congresswatch/procurement/...).
"""

import os
import time
import json
import boto3
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright

# Cloudflare R2 S3-Compatible credentials
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.environ.get("R2_BUCKET", "watchers")
CLOUDFLARE_WORKER_WEBHOOK = os.environ.get("CLOUDFLARE_WORKER_WEBHOOK")

# Setup Boto3 client for Cloudflare R2
s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com" if R2_ACCOUNT_ID else None,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto"
)

def scrape_sam_gov_solicitations(keyword: str = "technology", max_items: int = 10):
    print(f"[*] Launching Playwright Stealth Browser for SAM.gov...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900}
        )
        page = context.new_page()

        search_url = f"https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&pageSize=25&sfm%5Bstatus%5D%5Bis_active%5D=true&q={keyword}"
        print(f"[*] Navigating to: {search_url}")
        page.goto(search_url, wait_until="networkidle", timeout=60000)
        time.sleep(3)

        # Extract search results cards
        cards = page.query_selector_all(".sds-card")
        print(f"[*] Found {len(cards)} opportunity cards on SAM.gov")

        ingested_count = 0
        for card in cards[:max_items]:
            try:
                title_elem = card.query_selector("h3 a")
                if not title_elem:
                    continue
                title = title_elem.inner_text().strip()
                detail_href = title_elem.get_attribute("href")
                detail_url = f"https://sam.gov{detail_href}"

                # Open opportunity detail page to find downloadable attachments
                detail_page = context.new_page()
                print(f"[*] Inspecting opportunity: {title[:40]}...")
                detail_page.goto(detail_url, wait_until="domcontentloaded", timeout=30000)
                time.sleep(2)

                # Look for attachments section
                attachments = detail_page.query_selector_all("a[download], a[href*='/api/prod/opps/v1/opportunities/resources/files/']")
                print(f"    -> Found {len(attachments)} downloadable attachments")

                for att in attachments:
                    att_name = att.inner_text().strip() or "document.pdf"
                    att_url = att.get_attribute("href")
                    if att_url and not att_url.startswith("http"):
                        att_url = f"https://sam.gov{att_url}"

                    # Download file via browser session
                    with detail_page.expect_download(timeout=15000) as download_info:
                        att.click()
                    download = download_info.value
                    temp_path = f"/tmp/{download.suggested_filename}"
                    download.save_as(temp_path)

                    # Stream upload to Cloudflare R2
                    r2_key = f"congresswatch/procurement/attachments/{download.suggested_filename}"
                    print(f"    -> Uploading to R2: /watchers/{r2_key}")
                    if R2_ACCOUNT_ID:
                        s3.upload_file(temp_path, R2_BUCKET, r2_key)
                        os.remove(temp_path)

                detail_page.close()
                ingested_count += 1
            except Exception as e:
                print(f"[-] Error processing card: {e}")

        browser.close()
        print(f"[+] Scraping complete. Processed {ingested_count} solicitations.")

if __name__ == "__main__":
    scrape_sam_gov_solicitations()

