#!/bin/bash


FRONTEND_URL="https://shnare-frontend-XXXXXXXX-ew.a.run.app"
BACKEND_URL="https://shnare-backend-XXXXXXXX-ew.a.run.app/songs"

LOG_DIR="$(dirname "$0")/../logs"
LOG_FILE="$LOG_DIR/health-check.log"


mkdir -p "$LOG_DIR"


timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}


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

echo "[$(timestamp)] ========== Health Check Start ==========" | tee -a "$LOG_FILE"

ERRORS=0

check_service "Frontend (Cloud Run)" "$FRONTEND_URL"
[ $? -ne 0 ] && ERRORS=$((ERRORS + 1))

check_service "Backend (Cloud Run)" "$BACKEND_URL"
[ $? -ne 0 ] && ERRORS=$((ERRORS + 1))

echo "[$(timestamp)] ========== Health Check End (greške: $ERRORS) ==========" | tee -a "$LOG_FILE"
echo ""

if [ $ERRORS -gt 0 ]; then
  exit 1
else
  exit 0
fi
