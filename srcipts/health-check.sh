#!/bin/bash

# ============================================
# health-check.sh
# Provjera dostupnosti music-sharing-platform
# servisa na produkcijskom GCP okruženju
# ============================================

# Produkcijski URL-ovi
FRONTEND_URL="https://frontend-service-1024177687549.europe-west3.run.app"
BACKEND_URL="https://backend-service-1024177687549.europe-west3.run.app/songs"

# Log fajl
LOG_DIR="$(dirname "$0")/../logs"
LOG_FILE="$LOG_DIR/health-check.log"

# Kreiraj logs folder ako ne postoji
mkdir -p "$LOG_DIR"

# Timestamp funkcija
timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

# Funkcija za provjeru servisa
check_service() {
  local name=$1
  local url=$2

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo "[$(timestamp)] ERROR - $name nije dostupan (curl greška: $EXIT_CODE) - URL: $url" | tee -a "$LOG_FILE"
    return 1
  fi

  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "[$(timestamp)] OK - $name radi ispravno (HTTP $HTTP_STATUS) - URL: $url" | tee -a "$LOG_FILE"
    return 0
  else
    echo "[$(timestamp)] FAIL - $name vratio neočekivani status (HTTP $HTTP_STATUS) - URL: $url" | tee -a "$LOG_FILE"
    return 1
  fi
}

# ============================================
# Početak health checka
# ============================================
echo "[$(timestamp)] ========== Health Check Start ==========" | tee -a "$LOG_FILE"

ERRORS=0

check_service "Frontend (Cloud Run)" "$FRONTEND_URL"
[ $? -ne 0 ] && ERRORS=$((ERRORS + 1))

check_service "Backend (Cloud Run)" "$BACKEND_URL"
[ $? -ne 0 ] && ERRORS=$((ERRORS + 1))

echo "[$(timestamp)] ========== Health Check End (greške: $ERRORS) ==========" | tee -a "$LOG_FILE"
echo ""

# Exit kod
if [ $ERRORS -gt 0 ]; then
  exit 1
else
  exit 0
fi
