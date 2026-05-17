#!/bin/bash

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3001/songs"

echo "=========================================="
echo "  Music Sharing Platform - Health Check"
echo "=========================================="


echo ""
echo "Provjera backenda ($BACKEND_URL)..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)

if [ "$BACKEND_STATUS" -eq 200 ]; then
  echo "✓ Backend radi ispravno (status: $BACKEND_STATUS)"
else
  echo "✗ Backend nije dostupan (status: $BACKEND_STATUS)"
fi


echo ""
echo "Provjera frontenda ($FRONTEND_URL)..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)

if [ "$FRONTEND_STATUS" -eq 200 ]; then
  echo "✓ Frontend radi ispravno (status: $FRONTEND_STATUS)"
else
  echo "✗ Frontend nije dostupan (status: $FRONTEND_STATUS)"
fi

echo ""
echo "=========================================="
echo "  Health Check završen"
echo "=========================================="
