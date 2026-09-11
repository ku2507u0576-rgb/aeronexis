#!/bin/bash
# ============================================================
# APIx Platform Startup Script
# Starts backend API + frontend dashboard with auto-restart
# Usage: bash start.sh
# ============================================================

set -e

PROJECT_DIR="/Users/findoliyaparthiv/dharma fab/airfare price prediction project"
cd "$PROJECT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "🇮🇳 ============================================="
echo "   Real-Time Airfare Price Index (APIx)"
echo "   Government-Grade Analytics Platform"
echo "================================================="
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# ---- Check DB exists, seed if needed ----
if [ ! -f "airfare_index.db" ]; then
  echo -e "${YELLOW}⚙️  Database not found. Seeding with 32 days of synthetic data...${NC}"
  python3 -m backend.seed.seed_database
  echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
  echo -e "${GREEN}✅ Database found (airfare_index.db)${NC}"
fi

# ---- Kill any existing servers on ports 8000 & 3000 ----
echo ""
echo -e "${BLUE}🛑 Cleaning up old processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# ---- Start Backend API (with auto-restart loop) ----
echo ""
echo -e "${GREEN}🚀 Starting Backend API on http://localhost:8000${NC}"
(
  while true; do
    python3 -m uvicorn backend.main:app \
      --host 0.0.0.0 \
      --port 8000 \
      --log-level info \
      2>&1 | sed 's/^/  [API] /'
    echo -e "${RED}  [API] ❌ Server crashed! Restarting in 3s...${NC}"
    sleep 3
  done
) &
BACKEND_PID=$!

# Wait for backend to be ready
echo -n "  Waiting for API to be ready"
for i in {1..20}; do
  if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e " ${GREEN}✅${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

# ---- Install frontend deps if needed ----
if [ ! -f "frontend/node_modules/.bin/react-scripts" ]; then
  echo ""
  echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
  cd frontend && npm install --silent && cd ..
fi

# ---- Start Frontend (with auto-restart loop) ----
echo ""
echo -e "${GREEN}🌐 Starting Frontend Dashboard on http://localhost:3000${NC}"
(
  cd "$PROJECT_DIR/frontend"
  while true; do
    BROWSER=none PORT=3000 npm start 2>&1 | sed 's/^/  [UI]  /'
    echo -e "${RED}  [UI]  ❌ Frontend crashed! Restarting in 3s...${NC}"
    sleep 3
  done
) &
FRONTEND_PID=$!

# ---- Wait for frontend ----
echo -n "  Waiting for Dashboard to compile"
for i in {1..60}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e " ${GREEN}✅${NC}"
    break
  fi
  echo -n "."
  sleep 2
done

echo ""
echo "============================================="
echo -e "${GREEN}✅ ALL SYSTEMS RUNNING!${NC}"
echo "============================================="
echo ""
echo -e "  📊 Dashboard:   ${BLUE}http://localhost:3000${NC}"
echo -e "  🔗 API:         ${BLUE}http://localhost:8000${NC}"
echo -e "  📖 API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
echo -e "  ❤️  Health:     ${BLUE}http://localhost:8000/health${NC}"
echo ""
echo -e "  🔑 API Key:     ${YELLOW}apix-demo-key-2026${NC}"
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop all servers"
echo "============================================="
echo ""

# ---- Trap Ctrl+C to kill both servers cleanly ----
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; lsof -ti:8000 | xargs kill -9 2>/dev/null; lsof -ti:3000 | xargs kill -9 2>/dev/null; echo 'Done.'; exit 0" INT TERM

# Keep alive
wait
