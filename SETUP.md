# Deutschbahn Navigator Setup Guide

This guide will walk you through setting up the Deutschbahn Navigator extension for Claude Desktop.

## Step 1: Get Deutsche Bahn API Access

### 1.1 Register at Deutsche Bahn Developer Portal
1. Visit [https://developers.deutschebahn.com/](https://developers.deutschebahn.com/)
2. Click on "Anmelden" (Sign In) or "Registrieren" (Register)
3. Create a new developer account
4. Verify your email address

### 1.2 Subscribe to Required APIs
You need to subscribe to these APIs (they are typically free for basic usage):

1. **StaDa (Station Data) API**
   - Go to [StaDa API page](https://developers.deutschebahn.com/db-api-marketplace/apis/product/stada)
   - Click "Subscribe" and choose a plan (usually "Free" is available)

2. **Timetables API**
   - Go to [Timetables API page](https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables)
   - Click "Subscribe" and choose a plan

3. **FaSta (Station Facilities Status) API**
   - Go to [FaSta API page](https://developers.deutschebahn.com/db-api-marketplace/apis/product/fasta)
   - Click "Subscribe" and choose a plan

### 1.3 Get Your API Key
1. After subscribing to the APIs, go to your developer dashboard
2. Find your API key (it's usually displayed on the main dashboard)
3. Copy the API key - you'll need it for configuration

## Step 2: Install the Extension

### 2.1 Download and Build
```bash
# Download or clone the extension
cd deutschbahn-navigator

# Install dependencies
npm install

# Build the extension
npm run build
```

### 2.2 Test the Extension (Optional)
```bash
# Set your API key for testing
export DB_API_KEY="your_api_key_here"

# Run the demo
npm run demo
```

Open http://localhost:3001 to see the demo page and verify everything works.

## Step 3: Configure Claude Desktop

### 3.1 Find Claude Desktop Configuration File
The configuration file location depends on your operating system:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 3.2 Add Extension Configuration
Edit the configuration file and add the Deutschbahn Navigator:

```json
{
  "mcpServers": {
    "deutschbahn-navigator": {
      "command": "node",
      "args": ["/full/path/to/deutschbahn-navigator/dist/index.js"],
      "env": {
        "DB_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

**Important**: Replace `/full/path/to/deutschbahn-navigator` with the actual path where you installed the extension.

### 3.3 Restart Claude Desktop
Close and restart Claude Desktop for the changes to take effect.

## Step 4: Verify Installation

### 4.1 Check Extension Status
In Claude Desktop, you should be able to ask:
```
"What tools do you have available?"
```

You should see Deutsche Bahn tools listed, including:
- search_stations
- get_station_info
- get_departures
- get_arrivals
- get_facilities_status

### 4.2 Test Basic Functionality
Try these example queries:

```
"Search for train stations in Berlin"
"What is the EVA number for Munich Hauptbahnhof?"
"Show me departures from Frankfurt Hauptbahnhof"
```

## Step 5: Usage Examples

### Finding Stations
```
User: "I need to find the station ID for Cologne main station"
Claude: [Uses search_stations to find Köln Hauptbahnhof and provides EVA number]
```

### Getting Departure Information
```
User: "What trains are leaving Hamburg Hauptbahnhof in the next 2 hours?"
Claude: [Uses get_departures with 120-minute duration to show live departures]
```

### Checking Accessibility
```
User: "Are the elevators working at Stuttgart Hauptbahnhof?"
Claude: [Uses get_facilities_status to check elevator availability]
```

### Journey Planning
```
User: "Help me plan a trip from Berlin to Munich"
Claude: [Uses the journey planning prompt to provide interactive assistance]
```

## Troubleshooting

### Extension Not Loading
1. Check that the path in claude_desktop_config.json is correct
2. Verify the extension was built successfully (`npm run build`)
3. Ensure Node.js is installed and accessible
4. Check Claude Desktop logs for error messages

### API Errors
1. Verify your API key is correct and active
2. Check that you've subscribed to all required APIs
3. Ensure your API subscription hasn't expired
4. Test the API key with the demo mode

### No Data Returned
1. Some smaller stations may not have complete data
2. API services may occasionally be unavailable
3. Try searching for major stations first (Berlin, Munich, Hamburg)

### Permission Issues
1. Ensure the extension files have proper read permissions
2. On macOS/Linux, you might need to make the files executable:
   ```bash
   chmod +x dist/index.js
   ```

## Advanced Configuration

### Environment Variables
You can set additional configuration options:

```json
{
  "mcpServers": {
    "deutschbahn-navigator": {
      "command": "node",
      "args": ["/path/to/deutschbahn-navigator/dist/index.js"],
      "env": {
        "DB_API_KEY": "your_api_key",
        "DB_API_BASE_URL": "https://apis.deutschebahn.com",
        "DB_NAVIGATOR_LOG_LEVEL": "info",
        "DB_NAVIGATOR_TIMEOUT": "30000",
        "DB_NAVIGATOR_MAX_RETRIES": "3"
      }
    }
  }
}
```

### Development Mode
For development, you can run the extension in HTTP mode:

```json
{
  "env": {
    "DB_API_KEY": "your_api_key",
    "DB_NAVIGATOR_HTTP": "true",
    "DB_NAVIGATOR_HTTP_PORT": "3000"
  }
}
```

## Getting Help

1. **Extension Issues**: Check the README.md file and GitHub issues
2. **Deutsche Bahn API Issues**: Visit [Deutsche Bahn Developer Portal](https://developers.deutschebahn.com/)
3. **Claude Desktop Issues**: Check Claude Desktop documentation

## Next Steps

Once the extension is working:

1. Try the interactive journey planning prompts
2. Explore different types of stations (major cities vs. smaller towns)
3. Check real-time delay information
4. Use facility status checks for accessibility planning

Enjoy using the Deutschbahn Navigator with Claude Desktop! 🚆
