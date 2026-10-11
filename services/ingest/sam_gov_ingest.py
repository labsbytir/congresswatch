"""
CongressWatch SAM.gov & USASpending.gov Ingestion Pipeline
Extracts active federal contract solicitations and award notices,
then links them to Congressional bills via statutory authority regex,
agency cross-referencing, and NAICS-to-Committee mapping.
"""

import os
import re
import requests
import json
from datetime import datetime, timedelta

DATA_GOV_API_KEY = os.environ.get("DATA_GOV_API_KEY", "DEMO_KEY")
SAM_BASE_URL = "https://api.sam.gov/opportunities/v2/search"

# Regex patterns for identifying statutory authority in solicitation descriptions
PL_REGEX = re.compile(r'P.?L.?s*(d{2,3})-(d+)', re.IGNORECASE)
BILL_REGEX = re.compile(r'(H.?R.?|S.?|H.?J.?Res.?|S.?J.?Res.?)s*(d+)', re.IGNORECASE)

def extract_statutory_links(description_text: str):
    """Scan text for Public Law and Bill references."""
    if not description_text:
        return None, None
    pl_match = PL_REGEX.search(description_text)
    bill_match = BILL_REGEX.search(description_text)
    
    pl_ref = f"P.L. {pl_match.group(1)}-{pl_match.group(2)}" if pl_match else None
    bill_ref = f"{bill_match.group(1).replace('.', '').upper()} {bill_match.group(2)}" if bill_match else None
    return pl_ref, bill_ref

def fetch_sam_opportunities(days_back: int = 1, limit: int = 100):
    """
    Query SAM.gov Public API using mandatory MM/dd/yyyy date parameters.
    """
    today = datetime.now().strftime("%m/%d/%Y")
    start_date = (datetime.now() - timedelta(days=days_back)).strftime("%m/%d/%Y")

    params = {
        "api_key": DATA_GOV_API_KEY,
        "postedFrom": start_date,
        "postedTo": today,
        "ptype": "o,a", # o = Active Solicitations, a = Award Notices
        "limit": limit
    }

    try:
        response = requests.get(SAM_BASE_URL, params=params, timeout=30)
        if response.status_code == 200:
            payload = response.json()
            opportunities = payload.get("opportunitiesData", [])
            print(f"Fetched {len(opportunities)} opportunities from SAM.gov")
            return process_opportunities(opportunities)
        else:
            print(f"SAM.gov API Error [{response.status_code}]: {response.text}")
            return []
    except Exception as e:
        print(f"Failed to fetch SAM.gov opportunities: {e}")
        return []

def process_opportunities(opportunities):
    records = []
    for opp in opportunities:
        desc = opp.get("description", "")
        pl_ref, bill_ref = extract_statutory_links(desc)
        
        record = {
            "id": opp.get("noticeId") or opp.get("solicitationNumber"),
            "solicitation_number": opp.get("solicitationNumber") or opp.get("noticeId"),
            "title": opp.get("title"),
            "notice_type": opp.get("type"),
            "department_name": opp.get("department", {}).get("name") if isinstance(opp.get("department"), dict) else opp.get("department"),
            "sub_tier_agency": opp.get("subTier", {}).get("name") if isinstance(opp.get("subTier"), dict) else opp.get("subTier"),
            "posted_date": opp.get("postedDate"),
            "response_deadline": opp.get("responseDeadLine"),
            "naics_code": opp.get("naicsCode"),
            "description": desc[:2000] if desc else None,
            "ui_link": opp.get("uiLink"),
            "linked_public_law": pl_ref,
            "linked_bill_id": bill_ref
        }
        records.append(record)
    return records

if __name__ == "__main__":
    records = fetch_sam_opportunities()
    print(f"Processed {len(records)} SAM.gov procurement records with statutory linking.")

