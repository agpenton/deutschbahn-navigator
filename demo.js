#!/usr/bin/env node

/**
 * Deutschbahn Navigator Demo Script
 * This script demonstrates how to use the extension in HTTP mode for testing
 */

import { createMCPServer } from './dist/server.js';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3001;

async function startDemo() {
  console.log('🚆 Starting Deutschbahn Navigator Demo...');
  
  // Set demo environment
  process.env.DB_NAVIGATOR_HTTP = 'true';
  process.env.DB_NAVIGATOR_LOG_LEVEL = 'info';
  
  // Create MCP server
  const mcpServer = createMCPServer();
  
  // Create Express app
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Demo page
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Deutschbahn Navigator Demo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #d30c0d; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .api-key-warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚆 Deutschbahn Navigator</h1>
        <p>Claude Desktop Extension for Deutsche Bahn train information</p>
    </div>
    
    <div class="api-key-warning">
        <h3>⚠️ API Key Required</h3>
        <p>To use this extension, you need a Deutsche Bahn API key:</p>
        <ol>
            <li>Visit <a href="https://developers.deutschebahn.com/" target="_blank">Deutsche Bahn Developer Portal</a></li>
            <li>Register for an account</li>
            <li>Subscribe to StaDa, Timetables, and FaSta APIs</li>
            <li>Set your API key: <code>export DB_API_KEY="your_key_here"</code></li>
        </ol>
    </div>
    
    <div class="section">
        <h2>🔧 Available Tools</h2>
        <ul>
            <li><strong>search_stations</strong> - Find stations by name</li>
            <li><strong>get_station_info</strong> - Get detailed station information</li>
            <li><strong>get_departures</strong> - Live departure boards</li>
            <li><strong>get_arrivals</strong> - Live arrival boards</li>
            <li><strong>get_facilities_status</strong> - Check elevator/escalator status</li>
            <li><strong>search_connections</strong> - Find train connections (limited)</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>📋 Example Usage in Claude</h2>
        <pre>
User: "Search for train stations in Berlin"
Claude: Uses search_stations tool to find Berlin stations

User: "What trains are leaving Munich Hauptbahnhof in the next hour?"
Claude: Uses get_departures tool for real-time information

User: "Are the elevators working at Köln Hauptbahnhof?"
Claude: Uses get_facilities_status tool for accessibility info
        </pre>
    </div>
    
    <div class="section">
        <h2>🚀 Integration with Claude Desktop</h2>
        <p>Add this to your Claude Desktop configuration:</p>
        <pre>{
  "mcpServers": {
    "deutschbahn-navigator": {
      "command": "node",
      "args": ["/path/to/deutschbahn-navigator/dist/index.js"],
      "env": {
        "DB_API_KEY": "your_api_key_here"
      }
    }
  }
}</pre>
    </div>
    
    <div class="section">
        <h2>📊 Health Check</h2>
        <p>Extension status: <span style="color: green;">✅ Running</span></p>
        <p>API Key configured: <span style="color: ${process.env.DB_API_KEY ? 'green">✅ Yes' : 'red">❌ No'}</span></p>
        <p>Health endpoint: <a href="/health">/health</a></p>
    </div>
</body>
</html>
    `);
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'deutschbahn-navigator',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.DB_API_KEY,
      tools: [
        'search_stations',
        'get_station_info', 
        'get_departures',
        'get_arrivals',
        'search_connections',
        'get_facilities_status'
      ]
    });
  });
  
  app.listen(PORT, () => {
    console.log(`🌐 Demo server running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Get your Deutsche Bahn API key from https://developers.deutschebahn.com/');
    console.log('2. Set DB_API_KEY environment variable');
    console.log('3. Add this extension to your Claude Desktop configuration');
    console.log('');
    console.log('🔧 Claude Desktop Configuration:');
    console.log(JSON.stringify({
      mcpServers: {
        "deutschbahn-navigator": {
          command: "node",
          args: [process.cwd() + "/dist/index.js"],
          env: {
            DB_API_KEY: "your_api_key_here"
          }
        }
      }
    }, null, 2));
  });
}

startDemo().catch(console.error);
