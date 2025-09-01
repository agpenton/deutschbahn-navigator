#!/bin/bash

# Quick Setup Script for Deutschbahn Navigator
# This script extracts and sets up the extension for manual Claude Desktop configuration

echo "🚆 Deutschbahn Navigator - Quick Setup"
echo "======================================"

# Check if .dxt file exists
DXT_FILE="deutschbahn-navigator-1.3.3.dxt"
if [ ! -f "$DXT_FILE" ]; then
    echo "❌ Error: $DXT_FILE not found in current directory"
    echo "Please ensure the .dxt file is in the same directory as this script"
    exit 1
fi

# Extract the extension
echo "📦 Extracting extension..."
if [ -d "deutschbahn-navigator-setup" ]; then
    echo "🔄 Removing existing setup directory..."
    rm -rf deutschbahn-navigator-setup
fi

unzip -q "$DXT_FILE" -d deutschbahn-navigator-setup
cd deutschbahn-navigator-setup

echo "✅ Extension extracted to: $(pwd)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Get full path
FULL_PATH="$(pwd)"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Get your Deutsche Bahn API key:"
echo "   - Visit: https://developers.deutschebahn.com/"
echo "   - Register and subscribe to: StaDa, Timetables, FaSta APIs"
echo ""
echo "2. Configure Claude Desktop:"
echo "   - Open: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   - Add this configuration:"
echo ""
echo '{'
echo '  "mcpServers": {'
echo '    "deutschbahn-navigator": {'
echo '      "command": "node",'
echo "      \"args\": [\"$FULL_PATH/dist/index.js\"],"
echo '      "env": {'
echo '        "DB_API_KEY": "your_actual_api_key_here"'
echo '      }'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "4. Test with: 'Search for train stations in Berlin'"
echo ""
echo "📁 Extension location: $FULL_PATH"
echo "🚆 Happy train searching!"
