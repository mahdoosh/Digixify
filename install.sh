#!/usr/bin/env bash
set -euo pipefail

# Digixify one-command installer
# Works on any VPS with Docker. Pulls pre-built image from GHCR, falls back to building.

# Colors (optional)
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"
info() { echo -e "${GREEN}[INFO]${NC} $*"; }
err() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Determine compose command
if docker compose version &>/dev/null; then
  COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
else
  err "Docker Compose not found. Please install Docker Compose v2 or v1."
  exit 1
fi

# Create working directory
INSTALL_DIR="/opt/digixify"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download repository files if not present
if [ ! -f docker-compose.yml ]; then
  info "Downloading docker-compose.yml..."
  curl -sSL https://raw.githubusercontent.com/mahdoosh/Digixify/main/docker-compose.yml -o docker-compose.yml
fi
if [ ! -f docker-compose.build.yml ]; then
  info "Downloading docker-compose.build.yml..."
  curl -sSL https://raw.githubusercontent.com/mahdoosh/Digixify/main/docker-compose.build.yml -o docker-compose.build.yml
fi

# Gather configuration
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  read -p "Telegram Bot Token (from @BotFather): " TELEGRAM_BOT_TOKEN
fi
read -p "Your Telegram user ID (for admin alerts, press Enter to skip): " ADMIN_CHAT_ID
ADMIN_CHAT_ID=${ADMIN_CHAT_ID:-7446908876}

if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  read -s -p "OpenRouter API Key: " OPENROUTER_API_KEY
  echo
fi

# Create .env
cat > .env <<EOF
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
OPENAI_API_KEY=${OPENROUTER_API_KEY}
ADMIN_CHAT_ID=${ADMIN_CHAT_ID}
OPENAI_MODEL=stepfun/step-3.5-flash:free
DIGIXIFY_WORKSPACE=/workspace
AGENT_NAME=Digixify
AGENT_SOUL="You are a helpful, transparent AI colleague. You think step by step and use tools when needed. You explain your actions. You respect user privacy and safety."
EOF

info "Attempting to pull pre-built image from GitHub Container Registry..."
if docker pull ghcr.io/mahdoosh/digixify:latest 2>/dev/null; then
  info "Pull successful. Starting container..."
  $COMPOSE -f docker-compose.yml up -d
else
  info "Pre-built image not available. Building locally (this may take a few minutes)..."
  mkdir -p workspace
  $COMPOSE -f docker-compose.build.yml up -d
fi

info "Digixify is starting. Check logs with: docker logs -f digixify"
info "Send a message to your bot to test."
