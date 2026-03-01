#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VIKRAM PRESENCE — ONE-COMMAND DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════
# Builds, cleans, and deploys dist/apps/web/ to Hostinger via FTP
#
# USAGE:
#   chmod +x deploy.sh    (first time only)
#   ./deploy.sh
#
# CREDENTIALS (find in hPanel → Hosting → FTP Accounts):
#   FTP Host:     ftp.vikrampresence.shop  (or from hPanel)
#   FTP Username: u123456789               (your hPanel FTP username)
#   FTP Password: your_ftp_password
# ═══════════════════════════════════════════════════════════════

set -e

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── Configuration (EDIT THESE) ───
FTP_HOST="${FTP_HOST:-ftp.vikrampresence.shop}"
FTP_USER="${FTP_USER:-}"
FTP_PASS="${FTP_PASS:-}"
REMOTE_DIR="/public_html"

# Project paths
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$PROJECT_DIR/apps/web"
DIST_DIR="$PROJECT_DIR/dist/apps/web"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  VIKRAM PRESENCE — DEPLOY TO HOSTINGER${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

# ─── Check Credentials ───
if [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo -e "${YELLOW}⚠  FTP credentials not set.${NC}"
    echo ""
    echo "  Set them as environment variables before running:"
    echo ""
    echo -e "  ${GREEN}export FTP_HOST=ftp.vikrampresence.shop${NC}"
    echo -e "  ${GREEN}export FTP_USER=u123456789${NC}"
    echo -e "  ${GREEN}export FTP_PASS=your_password${NC}"
    echo -e "  ${GREEN}./deploy.sh${NC}"
    echo ""
    echo "  Or run inline:"
    echo -e "  ${GREEN}FTP_USER=u123456789 FTP_PASS=yourpass ./deploy.sh${NC}"
    echo ""
    echo -e "  Find your FTP credentials in: ${CYAN}hPanel → Hosting → FTP Accounts${NC}"
    exit 1
fi

# ─── Check lftp ───
if ! command -v lftp &> /dev/null; then
    echo -e "${YELLOW}📦 Installing lftp via Homebrew...${NC}"
    brew install lftp
fi

# ═══ STEP 1: BUILD ═══
echo -e "${CYAN}🔨 [1/4] Building production bundle...${NC}"
cd "$WEB_DIR"
npm run build
echo -e "${GREEN}✅ Build complete.${NC}"

# ═══ STEP 2: CLEAN STALE ASSETS ═══
echo -e "${CYAN}🧹 [2/4] Cleaning stale assets from dist...${NC}"
cd "$DIST_DIR"

# Remove any stale JS/CSS not referenced by index.html
STALE_COUNT=0
for f in assets/*; do
    basename="$(basename "$f")"
    if ! grep -q "$basename" index.html 2>/dev/null; then
        rm -f "$f"
        STALE_COUNT=$((STALE_COUNT + 1))
    fi
done

# Remove junk files
rm -f .DS_Store favicon.ico.bak send-email.php upload-image.php
find . -name '.DS_Store' -delete 2>/dev/null

# Ensure PHP files are in api/ folder
cp "$WEB_DIR/public/api/send-email.php" api/send-email.php
cp "$WEB_DIR/public/api/upload-image.php" api/upload-image.php

echo -e "${GREEN}✅ Cleaned $STALE_COUNT stale files. PHP files copied to api/.${NC}"

# ═══ STEP 3: SHOW WHAT WE'RE UPLOADING ═══
echo -e "${CYAN}📁 [3/4] Files to deploy:${NC}"
FILE_COUNT=$(find . -type f | wc -l | tr -d ' ')
echo -e "   ${YELLOW}$FILE_COUNT files${NC} in dist/apps/web/"
find . -type f -not -name '.DS_Store' | sort | while read f; do
    SIZE=$(du -h "$f" | cut -f1 | tr -d ' ')
    echo -e "   $f ${CYAN}($SIZE)${NC}"
done
echo ""

# ═══ STEP 4: DEPLOY VIA LFTP ═══
echo -e "${CYAN}🚀 [4/4] Deploying to $FTP_HOST:$REMOTE_DIR ...${NC}"

lftp -c "
set ssl:verify-certificate no;
set ftp:ssl-allow yes;
set mirror:use-pget-n 5;
open -u $FTP_USER,$FTP_PASS $FTP_HOST;
lcd $DIST_DIR;
cd $REMOTE_DIR;
mirror --reverse --delete --verbose --parallel=5 \
    --exclude-glob .DS_Store \
    --exclude-glob node_modules/ \
    --exclude-glob .git/ ;
bye;
"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Live: ${CYAN}https://vikrampresence.shop${NC}"
echo -e "  🔐 Admin: ${CYAN}https://vikrampresence.shop/admin-vikram${NC}"
echo ""
echo -e "  ${YELLOW}TIP: Purge Hostinger CDN cache in hPanel for instant update.${NC}"
echo ""
