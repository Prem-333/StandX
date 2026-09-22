#!/usr/bin/env sh
# Manual examples for an already-running local API; requires HTTPie.
# Export API_KEY from your private .env. Never commit or print the key.
set -eu
: "${API_KEY:?Export your local API key first}"
BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
http GET "$BASE_URL/v1/health" "X-API-Key:$API_KEY"
http GET "$BASE_URL/v1/standards/IS%209550:2024" "X-API-Key:$API_KEY"
http GET "$BASE_URL/v1/standards/IS%209550:2024/allied" "X-API-Key:$API_KEY" max_hops==2
http GET "$BASE_URL/v1/certifications/bright_steel_bars" "X-API-Key:$API_KEY" domestic_supply==true exemption_claimed==false
http GET "$BASE_URL/v1/certifications/laptop_notebook_tablet" "X-API-Key:$API_KEY"
http GET "$BASE_URL/v1/certifications/silver_jewellery_artefacts" "X-API-Key:$API_KEY"
http POST "$BASE_URL/v1/recommend" "X-API-Key:$API_KEY" text='IS 9550:2024' top_k:=5 product_category=bright_steel_bars 'certification_context:={"domestic_supply":true,"exemption_claimed":false}'
http POST "$BASE_URL/v1/recommend" "X-API-Key:$API_KEY" text='लकड़ी की बेडसाइड मेज' language_hint=hi
# Set TENDER_FILE to a PDF/DOCX path to exercise upload.
if [ -n "${TENDER_FILE:-}" ]; then
  http --form POST "$BASE_URL/v1/recommend" "X-API-Key:$API_KEY" "file@$TENDER_FILE"
fi
# Copy recommendation_id from the exact IS 9550 query above.
if [ -n "${RECOMMENDATION_ID:-}" ]; then
  http POST "$BASE_URL/v1/feedback" "X-API-Key:$API_KEY" "recommendation_id=$RECOMMENDATION_ID" decision=confirm record_id=bis-10 comment='Manual review'
fi
