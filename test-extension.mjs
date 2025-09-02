#!/usr/bin/env node

/**
 * Simple test script for the Deutsche Bahn DXT extension
 * This script validates that the MCP server responds correctly to tool calls
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_TIMEOUT = 10000; // 10 seconds
const SERVER_PATH = join(__dirname, 'dist', 'index.js');

class MCPTester {
  constructor() {
    this.server = null;
    this.requestId = 1;
  }

  async startServer() {
    console.log('🚀 Starting Deutsche Bahn MCP server...');
    
    this.server = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        NODE_ENV: 'test',
        DB_API_KEY: 'test-key',
        DB_CLIENT_ID: 'test-client'
      }
    });

    this.server.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Deutsche Bahn MCP Server started')) {
        console.log('📋 Server log:', output);
      }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (this.server.killed) {
      throw new Error('Server failed to start');
    }
    
    console.log('✅ Server started successfully');
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params
      };

      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout after ${TEST_TIMEOUT}ms`));
      }, TEST_TIMEOUT);

      let responseData = '';
      
      const onData = (data) => {
        responseData += data.toString();
        
        // Check if we have a complete JSON response
        try {
          const lines = responseData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              this.server.stdout.off('data', onData);
              resolve(response);
              return;
            }
          }
        } catch (e) {
          // Not a complete JSON yet, continue waiting
        }
      };

      this.server.stdout.on('data', onData);
      
      console.log(`📤 Sending request: ${method}`);
      this.server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testListTools() {
    console.log('\n🔧 Testing list_tools...');
    
    try {
      const response = await this.sendRequest('tools/list');
      
      if (response.error) {
        throw new Error(`Server error: ${response.error.message}`);
      }

      const tools = response.result?.tools || [];
      console.log(`✅ Found ${tools.length} tools:`);
      
      tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });

      // Validate expected tools
      const expectedTools = [
        'deutschbahn.searchStations',
        'deutschbahn.stationInfo', 
        'deutschbahn.departures',
        'deutschbahn.arrivals',
        'deutschbahn.facilityStatus',
        'deutschbahn.planJourney'
      ];
      const foundTools = tools.map(t => t.name);
      
      for (const expectedTool of expectedTools) {
        if (!foundTools.includes(expectedTool)) {
          throw new Error(`Missing expected tool: ${expectedTool}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ list_tools test failed:', error.message);
      return false;
    }
  }

  async testSearchStations() {
    console.log('\n🔍 Testing deutschbahn.searchStations tool...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'deutschbahn.searchStations',
        arguments: {
          query: 'Berlin',
          limit: 5
        }
      });
      
      if (response.error) {
        throw new Error(`Server error: ${response.error.message}`);
      }
      
      const result = response.result;
      if (!result || !result.content || !result.content[0]) {
        throw new Error('Invalid response format');
      }
      
      const content = JSON.parse(result.content[0].text);
      
      if (content.error) {
        console.log('⚠️  Search returned error (expected without API key):', content.error);
        return true; // This is expected behavior without real API key
      }
      
      if (content.stations) {
        console.log(`✅ Search successful, found ${content.stations.length} stations`);
        if (content.stations.length > 0) {
          console.log(`   First station: ${content.stations[0].name}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ deutschbahn.searchStations test failed:', error.message);
      return false;
    }
  }

  async stopServer() {
    if (this.server && !this.server.killed) {
      console.log('\n🛑 Stopping server...');
      this.server.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => {
        this.server.on('exit', resolve);
        setTimeout(() => {
          if (!this.server.killed) {
            this.server.kill('SIGKILL');
          }
          resolve();
        }, 3000);
      });
      
      console.log('✅ Server stopped');
    }
  }

  async runTests() {
    let allPassed = true;
    
    try {
      await this.startServer();
      
      // Run all tests
      const tests = [
        () => this.testListTools(),
        () => this.testSearchStations()
      ];
      
      for (const test of tests) {
        const passed = await test();
        allPassed = allPassed && passed;
      }
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      allPassed = false;
    } finally {
      await this.stopServer();
    }
    
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎉 All tests passed! Extension is ready for use.');
    } else {
      console.log('❌ Some tests failed. Please check the issues above.');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPTester();
  tester.runTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

export default MCPTester;
