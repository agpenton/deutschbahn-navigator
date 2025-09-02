# Deutsche Bahn MCP Claude Desktop Extension

A Claude Desktop extension for accessing Deutsche Bahn (German Railway) information through the Model Context Protocol (MCP).

## Features

✅ **Station Search** - Find railway stations by name or location
✅ **Station Information** - Get detailed information about stations  
✅ **Real-time Departures** - Check departure times and delays
✅ **Real-time Arrivals** - Check arrival times and delays
✅ **Facility Status** - Check elevator, escalator, and accessibility status
✅ **Journey Planning** - Plan trips between stations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Package for Claude Desktop:
```bash
npm run package-dxt
```

## Configuration

The extension supports the following environment variables:

- `DB_API_KEY` - Deutsche Bahn API key (optional)
- `DB_CLIENT_ID` - Deutsche Bahn client ID (optional)
- `REQUEST_TIMEOUT` - HTTP request timeout in milliseconds (default: 30000)
- `MAX_RETRIES` - Maximum number of retry attempts (default: 3)

## Available Tools

### 1. Station Search
Find railway stations by name or coordinates.

**Parameters:**
- `query` (required): Search term
- `limit` (optional): Number of results (default: 10)
- `coordinates` (optional): Latitude/longitude for location-based search
- `radius` (optional): Search radius in meters

### 2. Station Information
Get detailed information about a specific station.

**Parameters:**
- `stationId` (required): Station ID

### 3. Real-time Departures
Get departure information for a station.

**Parameters:**
- `stationId` (required): Station ID
- `date` (optional): Date in YYYY-MM-DD format
- `hour` (optional): Hour filter (0-23)
- `limit` (optional): Number of results (default: 20)

### 4. Real-time Arrivals
Get arrival information for a station.

**Parameters:**
- `stationId` (required): Station ID
- `date` (optional): Date in YYYY-MM-DD format
- `hour` (optional): Hour filter (0-23)
- `limit` (optional): Number of results (default: 20)

### 5. Facility Status
Check the status of station facilities (elevators, escalators, etc.).

**Parameters:**
- `stationId` (required): Station ID
- `type` (optional): Facility type filter
- `status` (optional): Status filter

### 6. Journey Planning
Plan trips between stations.

**Parameters:**
- `origin` (required): Origin station name or ID
- `destination` (required): Destination station name or ID
- `departureTime` (optional): Preferred departure time
- `arrivalTime` (optional): Preferred arrival time
- `transportTypes` (optional): Array of transport types
- `accessibleOnly` (optional): Only accessible connections

## Architecture

```
src/
├── types/           # Zod schemas and TypeScript types
├── services/        # Business logic layer
│   ├── http-client.ts      # HTTP client with retry logic
│   ├── station-service.ts  # Station search and info
│   ├── timetable-service.ts # Departures and arrivals
│   ├── facility-service.ts # Facility status
│   └── journey-service.ts  # Journey planning
├── mcp/            # MCP server implementation
│   └── server.ts   # Main MCP server
└── index.ts        # CLI entry point
```

## Development

### Running Tests
```bash
npm test
npm run test:coverage
```

### Code Quality
```bash
npm run lint
npm run format
npm run typecheck
```

### Development Mode
```bash
npm run dev
```

## License

MIT License - see LICENSE file for details.

## Author

agpenton (https://github.com/agpenton)
