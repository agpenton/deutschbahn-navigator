# 🔧 Claude Desktop Extension Installation Guide

## ⚠️ Manual Installation Required

Since Claude Desktop doesn't support double-click installation for .dxt files, you'll need to install manually.

## 📋 Manual Installation Steps

### Method 1: Direct MCP Server Configuration (Recommended)

1. **Extract the extension**:
   ```bash
   unzip deutschbahn-navigator-1.3.3.dxt -d deutschbahn-navigator
   cd deutschbahn-navigator
   ```

2. **Install dependencies**:
   ```bash
   npm install --production
   ```

3. **Get your Deutsche Bahn API key**:
   - Visit: https://developers.deutschebahn.com/
   - Register and subscribe to: StaDa, Timetables, and FaSta APIs
   - Copy your API key

4. **Configure Claude Desktop**:
   - Open Claude Desktop configuration file:
     - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
     - **Linux**: `~/.config/Claude/claude_desktop_config.json`

5. **Add this configuration**:
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

6. **Update the path**: Replace `/full/path/to/deutschbahn-navigator` with the actual full path where you extracted the extension

7. **Restart Claude Desktop**

### Method 2: Using Installation Scripts

1. **Extract and run the installer**:
   ```bash
   unzip deutschbahn-navigator-1.3.3.dxt -d deutschbahn-navigator
   cd deutschbahn-navigator
   ```

2. **Run the installation script**:
   - **macOS/Linux**: `./install.sh`
   - **Windows**: `install.bat`

3. **Follow the script instructions** for API key configuration

## 🧪 Testing Installation

After installation and restart:

1. **Check if tools are available**:
   Ask Claude: *"What tools do you have available?"*

2. **Test with a simple query**:
   Ask Claude: *"Search for train stations in Berlin"*

3. **Verify real-time data**:
   Ask Claude: *"What trains are leaving Berlin Hauptbahnhof?"*

## 🔍 Troubleshooting

### Extension Not Loading
- ✅ Check that the path in Claude Desktop config is correct and absolute
- ✅ Verify Node.js 18+ is installed: `node --version`
- ✅ Ensure npm dependencies were installed: `npm list` in the extension folder

### API Errors
- ✅ Verify your Deutsche Bahn API key is correct
- ✅ Check you've subscribed to all required APIs (StaDa, Timetables, FaSta)
- ✅ Test API key at: https://developers.deutschebahn.com/

### No Tools Showing
- ✅ Restart Claude Desktop completely
- ✅ Check Claude Desktop console/logs for errors
- ✅ Try with a major station like "Berlin Hauptbahnhof"

## 📁 Alternative: Direct Folder Installation

If you prefer to work with the source directly:

1. **Copy the project folder** to your preferred location
2. **Run**: `npm install` and `npm run build`
3. **Configure Claude Desktop** to point to `dist/index.js`
4. **Add your API key** to the environment configuration

## 🎯 Success Indicators

You'll know it's working when:
- ✅ Claude responds to "What tools do you have?" with Deutsche Bahn tools listed
- ✅ Station searches return real German train stations
- ✅ Departure/arrival queries show live train data
- ✅ No errors appear in Claude Desktop logs

## 📞 Support

If you encounter issues:
1. **Check the installation logs** for specific error messages
2. **Verify API credentials** at the Deutsche Bahn developer portal  
3. **Test Node.js execution** manually: `node dist/index.js`
4. **Review Claude Desktop documentation** for MCP server configuration

---

**🚆 Once configured, you'll have powerful German train information at your fingertips through natural language queries! ✨**
