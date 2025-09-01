import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

/**
 * Register Deutsche Bahn prompts with the MCP server
 */
export function registerDBPrompts(server: McpServer): void {
  // Prompt: Journey planning assistant
  server.prompt(
    'plan_journey',
    'Interactive journey planning assistant for Deutsche Bahn',
    {
      travel_type: z.string().optional().describe('Type of travel (business, leisure, accessibility_needs)'),
    },
    async ({ travel_type }): Promise<GetPromptResult> => {
      try {
        logger.info('Generating journey planning prompt');

        const basePrompt = `# Deutsche Bahn Journey Planning Assistant

I'll help you plan your train journey in Germany using the Deutsche Bahn network. I can assist with:

## Available Services
🔍 **Station Search** - Find stations by name or location
📍 **Station Information** - Get details about facilities and services  
🚆 **Departure Boards** - Real-time departure information
🚇 **Arrival Boards** - Real-time arrival information
🔧 **Facility Status** - Check elevator/escalator availability
🗺️ **Connection Search** - Find routes between stations

## How to Get Started
1. **Tell me your travel plans**: Where are you going from and to?
2. **Specify your preferences**: Travel time, specific requirements
3. **I'll help you find**: Stations, schedules, and connections

## What I can help with:
- Finding station names and IDs
- Checking departure/arrival times  
- Verifying platform information
- Checking accessibility features
- Real-time delay information

## Example Requests:
- "I need to travel from Berlin to Munich tomorrow morning"
- "What trains leave Frankfurt Hauptbahnhof in the next hour?"
- "Are the elevators working at Köln Hauptbahnhof?"
- "Find me all stations in Hamburg"

`;

        let specificGuidance = '';
        
        if (travel_type) {
          switch (travel_type.toLowerCase()) {
            case 'business':
              specificGuidance = `
## Business Travel Optimization
For your business trip, I'll focus on:
- Fast connections with minimal transfers
- Stations with good business facilities
- Real-time updates for schedule management
- Platform information for quick boarding

**Tip**: ICE trains offer the fastest connections between major cities.
`;
              break;
            case 'leisure':
              specificGuidance = `
## Leisure Travel Planning  
For your leisure trip, I'll help with:
- Scenic route options when available
- Regional train connections
- Tourist-friendly stations
- Cost-effective travel times

**Tip**: Regional trains often provide beautiful countryside views.
`;
              break;
            case 'accessibility_needs':
              specificGuidance = `
## Accessibility-Focused Planning
For accessible travel, I'll prioritize:
- Stations with working elevators
- Platform accessibility information
- Step-free access routes
- Facility status updates

**Important**: I'll check elevator status at your departure and arrival stations.
`;
              break;
          }
        }

        const fullPrompt = basePrompt + specificGuidance + `
## Let's Start Planning!
What's your travel destination and any specific requirements?
`;

        return {
          description: 'Journey planning assistant for Deutsche Bahn travel',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: fullPrompt,
              },
            },
          ],
        };
      } catch (error) {
        logger.error('Error generating journey planning prompt:', error);
        throw error;
      }
    }
  );

  // Prompt: Station guide
  server.prompt(
    'station_guide',
    'Comprehensive station information guide',
    {
      station_name: z.string().describe('Name of the station to get information about'),
    },
    async ({ station_name }): Promise<GetPromptResult> => {
      try {
        logger.info(`Generating station guide for: ${station_name}`);

        const prompt = `# ${station_name} - Station Information Guide

I'll provide comprehensive information about **${station_name}** using the Deutsche Bahn Navigator tools.

## Information I'll gather:

### 🏢 Basic Station Details
- Official station name and category
- EVA number and location  
- Address and federal state
- RIL100 identifier

### 🚆 Current Train Information  
- Live departure board
- Live arrival board
- Platform assignments
- Real-time delays

### 🔧 Facility Status
- Elevator availability and status
- Escalator functionality  
- Accessibility features
- Service disruptions

### 📍 Additional Context
- Station category and importance
- Regional connections
- Nearby transport options

## Let me start by searching for "${station_name}" and gathering all available information...

*Note: I'll use the search_stations tool first to find the exact station, then get detailed information using the station's EVA number.*

Would you like me to proceed with gathering this information, or do you have specific questions about ${station_name}?
`;

        return {
          description: `Comprehensive information guide for ${station_name} station`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      } catch (error) {
        logger.error('Error generating station guide prompt:', error);
        throw error;
      }
    }
  );
}
