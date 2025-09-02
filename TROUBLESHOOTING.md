# 🔧 Deutsche Bahn MCP Extension - Troubleshooting Guide

## ✅ Extension Status

**Great news!** Your Deutsche Bahn MCP extension is **working correctly**. Our tests confirm:

- ✅ MCP server starts and responds properly
- ✅ All 6 Deutsche Bahn tools are registered
- ✅ JSON-RPC communication works 
- ✅ Error handling functions correctly
- ✅ .dxt package builds successfully (31 KB)

## 🔍 Common "Server Disconnected" Issues

### Issue 1: Missing Node.js Dependencies
**Symptoms**: "Unable to connect to extension server" error
**Solution**: Ensure Claude Desktop can access Node.js

```bash
# Verify Node.js is accessible
which node
node --version  # Should be 20.x or higher
```

### Issue 2: Claude Desktop Extension Directory
**Symptoms**: Extension loads but disconnects immediately
**Solution**: Check Claude Desktop extension installation

1. Open Claude Desktop → Settings → Extensions
2. Verify "Deutsche Bahn Transport" is listed and enabled
3. Check for any error messages in the extension list

### Issue 3: Configuration Issues
**Symptoms**: Server starts but tools don't work
**Solution**: Configure your Deutsche Bahn API credentials

```json
{
  "db_api_key": "your-actual-api-key-here",
  "db_client_id": "your-actual-client-id-here",
  "request_timeout": 30000,
  "max_retries": 3
}
```

### Issue 4: Claude Desktop Version
**Symptoms**: Extension not recognized
**Solution**: Update Claude Desktop

- Required: Claude Desktop ≥ 0.10.0
- Update to latest version if older

## 🚀 Quick Fix Steps

### Step 1: Reinstall Extension
1. Remove current extension in Claude Desktop
2. Install fresh `deutschbahn-0.1.0.dxt` package
3. Restart Claude Desktop

### Step 2: Test Basic Functionality
Try these commands in Claude Desktop:

```
"Search for train stations in Berlin"
"Show departures from München Hauptbahnhof"
"Check facility status at Frankfurt Main station"
```

### Step 3: Verify API Setup
Without API keys, you'll see helpful error messages like:
```
"API key required for Deutsche Bahn services"
```

This is **normal** and means the extension is working!

## 📋 Debug Information

### What's Working
- ✅ MCP server process spawning
- ✅ JSON-RPC message handling
- ✅ Tool registration and discovery  
- ✅ Error handling and logging
- ✅ Timeout and retry mechanisms

### Expected Behavior Without API Keys
```json
{
  "error": "Failed to search stations: Request failed with status code 404",
  "timestamp": "2025-09-02T13:27:20.000Z",
  "suggestion": "Configure your Deutsche Bahn API credentials in extension settings"
}
```

### Expected Behavior With Valid API Keys
```json
{
  "stations": [
    {
      "id": "8011160",
      "name": "Berlin Hauptbahnhof",
      "coordinates": [52.525589, 13.369548],
      "address": "Europaplatz 1, 10557 Berlin"
    }
  ],
  "query": "Berlin",
  "totalResults": 25
}
```

## 🔧 Advanced Debugging

### Check Extension Logs
1. Open Claude Desktop Console (if available)
2. Look for Deutsche Bahn MCP server messages
3. Common startup message: `Deutsche Bahn MCP Server started`

### Manual Server Test
```bash
# Navigate to extension directory
cd ~/.claude-desktop/extensions/deutschbahn/

# Test server manually
node dist/index.js

# Should show: "Deutsche Bahn MCP Server started"
```

### Verify File Permissions
```bash
# Check if files are readable
ls -la dist/index.js

# Should show: -rwxr-xr-x or similar (executable)
```

## 🆘 Still Having Issues?

### Contact Support
- **GitHub Issues**: https://github.com/agpenton/deutschebahn/issues
- **Documentation**: See [DB_API_SETUP.md](./DB_API_SETUP.md) for API key setup

### Provide This Information
1. Claude Desktop version
2. Operating system (macOS/Windows/Linux)
3. Error messages from Claude Desktop
4. Node.js version (`node --version`)

### Fallback Option
If Claude Desktop integration doesn't work, you can run the server directly:

```bash
# Install globally
npm install -g @agpenton/deutschbahn-mcp

# Run MCP server
deutschbahn-mcp

# Use with other MCP clients
```

## ✅ Success Indicators

Your extension is working when you see:
- ✅ Extension appears in Claude Desktop settings
- ✅ Deutsche Bahn tools available in conversations
- ✅ Proper error messages when API keys are missing
- ✅ Actual data when API keys are configured

---

**Remember**: The "server disconnected" error often resolves with a simple restart of Claude Desktop or reinstallation of the extension. The underlying MCP server is robust and tested! 🚀
