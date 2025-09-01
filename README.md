# Deutschbahn Navigator

A Claude Desktop Extension that provides comprehensive Deutsche Bahn train search and listing functionality, bringing the power of https://www.bahn.de/ directly to your Claude Desktop experience.

## Features

🚆 **Station Search** - Find Deutsche Bahn stations by name or location  
📍 **Station Information** - Get detailed station data including facilities and services  
🚇 **Real-time Departures** - Live departure boards with delays and platform information  
🚆 **Real-time Arrivals** - Live arrival boards with current status  
🔧 **Facility Status** - Check elevator and escalator availability  
📋 **Journey Planning** - Interactive travel planning assistance  

## Installation

⚠️ **Important**: Claude Desktop doesn't support double-click installation for .dxt files. Use manual installation below.

### 🚀 Quick Setup Script
```bash
# After downloading deutschbahn-navigator-1.3.3.dxt:
./quick-setup.sh
# Follow the on-screen instructions for Claude Desktop configuration
```

### 🔧 Manual Installation Steps
1. **Extract the extension**:
   ```bash
   unzip deutschbahn-navigator-1.3.3.dxt -d deutschbahn-navigator
   cd deutschbahn-navigator
   npm install --production
   ```

2. **Configure Claude Desktop** (see [MANUAL_INSTALLATION.md](MANUAL_INSTALLATION.md) for details)

### Prerequisites
1. **Deutsche Bahn API Access**
   - Visit [Deutsche Bahn Developer Portal](https://developers.deutschebahn.com/)
   - Register for a developer account
   - Subscribe to the required APIs:
     - **StaDa** (Station Data) - for station information
     - **Timetables** - for departure/arrival information  
     - **FaSta** (Facilities Status) - for elevator/escalator status
   - Get your API key from the developer dashboard

2. **Environment Setup**
   ```bash
   export DB_API_KEY="your_api_key_here"
   ```

### Building the Extension
```bash
# Clone or download the extension
cd deutschbahn-navigator

# Install dependencies
npm install

# Build the extension
npm run build

# Package as .dxt file (when DXT tooling is available)
# dxt pack
```

### Manual Installation in Claude Desktop
1. Build the extension using the steps above
2. Add to your Claude Desktop configuration:
   ```json
   {
     "mcpServers": {
       "deutschbahn-navigator": {
         "command": "node",
         "args": ["/path/to/deutschbahn-navigator/dist/index.js"],
         "env": {
           "DB_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

## Usage

### Basic Station Search
```
Ask Claude: "Search for train stations in Berlin"
```
This will use the `search_stations` tool to find all stations matching "Berlin".

### Get Station Details
```
Ask Claude: "Get information about Berlin Hauptbahnhof"
```
Claude will first search for the station, then provide detailed information including EVA number, address, and facilities.

### Check Departures
```
Ask Claude: "What trains are leaving Munich Hauptbahnhof in the next hour?"
```
This will show real-time departure information with delays and platform assignments.

### Plan a Journey
```
Ask Claude: "Help me plan a trip from Hamburg to Frankfurt"
```
Use the journey planning prompt for interactive travel assistance.

### Check Accessibility
```
Ask Claude: "Are the elevators working at Köln Hauptbahnhof?"
```
Get real-time status of accessibility facilities at any station.

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `search_stations` | Search stations by name | `query`, `limit` |
| `get_station_info` | Get detailed station data | `station_id` |
| `get_departures` | Live departure board | `station_id`, `datetime`, `duration` |
| `get_arrivals` | Live arrival board | `station_id`, `datetime`, `duration` |
| `search_connections` | Find train connections | `from_station`, `to_station`, `departure_time` |
| `get_facilities_status` | Check facility status | `station_id` |

## Configuration

### Environment Variables
- `DB_API_KEY` - Your Deutsche Bahn API key (required)
- `DB_API_BASE_URL` - API base URL (default: https://apis.deutschebahn.com)
- `DB_NAVIGATOR_HTTP` - Enable HTTP mode for testing (default: false)
- `DB_NAVIGATOR_HTTP_PORT` - HTTP port when in HTTP mode (default: 3000)
- `DB_NAVIGATOR_LOG_LEVEL` - Logging level (debug, info, warn, error)

### Development Mode
For development and testing, you can run the extension in HTTP mode:
```bash
export DB_NAVIGATOR_HTTP=true
npm start
```
This starts an HTTP server on port 3000 with health check at `/health`.

## API Dependencies

This extension integrates with these Deutsche Bahn APIs:

### StaDa (Station Data) API
- **Purpose**: Station search and information
- **Endpoint**: `/stada/v2/stations`
- **Documentation**: [StaDa API](https://developers.deutschebahn.com/db-api-marketplace/apis/product/stada)

### Timetables API  
- **Purpose**: Departure and arrival information
- **Endpoint**: `/timetables/v1`
- **Documentation**: [Timetables API](https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables)

### FaSta (Facilities Status) API
- **Purpose**: Elevator and escalator status
- **Endpoint**: `/fasta/v2/facilities`  
- **Documentation**: [FaSta API](https://developers.deutschebahn.com/db-api-marketplace/apis/product/fasta)

## Common Station IDs

For quick reference, here are EVA numbers for major German stations:

| Station | EVA Number |
|---------|------------|
| Berlin Hauptbahnhof | 8000105 |
| München Hauptbahnhof | 8000261 |
| Hamburg Hauptbahnhof | 8002549 |
| Köln Hauptbahnhof | 8000207 |
| Frankfurt (Main) Hauptbahnhof | 8000105 |
| Düsseldorf Hauptbahnhof | 8000085 |
| Stuttgart Hauptbahnhof | 8000096 |

## Troubleshooting

### API Key Issues
- Ensure your API key is valid and active
- Check that you've subscribed to the required APIs
- Verify the key is properly set in environment variables

### No Data Returned
- Some stations may not have all types of information available
- Rural or smaller stations may have limited data
- API services may occasionally be unavailable

### Connection Errors
- Check your internet connection
- Verify the API endpoints are accessible
- Some corporate networks may block external API calls

## Development

### Project Structure
```
src/
├── index.ts          # Main entry point
├── server.ts         # MCP server setup
├── tools/            # Tool implementations
│   └── db-tools.ts   # Deutsche Bahn API tools
├── resources/        # Resource handlers
│   └── db-resources.ts
├── prompts/          # Prompt templates
│   └── db-prompts.ts
└── utils/            # Utilities
    ├── config.ts     # Configuration management
    └── logger.ts     # Logging utility
```

### Building & Packaging
```bash
# Development
npm run build              # Compile TypeScript
npm run dev               # Watch mode for development

# Packaging with Version Management
npm run pack              # Package with current version
npm run pack:patch        # Bug fix version (1.0.0 → 1.0.1)
npm run pack:minor        # Feature version (1.0.0 → 1.1.0)  
npm run pack:major        # Breaking version (1.0.0 → 2.0.0)
npm run pack:timestamp    # Add timestamp (1.0.0 → 1.0.0-20250901-150906)
```

The packaging system automatically:
- Updates both `package.json` and `manifest.json`
- Creates versioned `.dxt` files
- Maintains semantic versioning
- Provides build timestamps for development

> 📖 **See [VERSION_MANAGEMENT.md](VERSION_MANAGEMENT.md) for complete version control guide**

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues related to:
- **Extension functionality**: Open an issue in this repository
- **Deutsche Bahn APIs**: Check the [DB Developer Portal](https://developers.deutschebahn.com/)
- **Claude Desktop**: Refer to Claude Desktop documentation
