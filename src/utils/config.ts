/**
 * Configuration management for Deutschbahn Navigator
 */

interface Config {
  dbApiKey: string;
  dbApiBaseUrl: string;
  httpPort: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  requestTimeout: number;
  maxRetries: number;
}

// Load configuration from environment variables
export const config: Config = {
  dbApiKey: process.env.DB_API_KEY || '',
  dbApiBaseUrl: process.env.DB_API_BASE_URL || 'https://apis.deutschebahn.com',
  httpPort: parseInt(process.env.DB_NAVIGATOR_HTTP_PORT || '3000', 10),
  logLevel: (process.env.DB_NAVIGATOR_LOG_LEVEL as Config['logLevel']) || 'info',
  requestTimeout: parseInt(process.env.DB_NAVIGATOR_TIMEOUT || '30000', 10),
  maxRetries: parseInt(process.env.DB_NAVIGATOR_MAX_RETRIES || '3', 10),
};

// Validate required configuration
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.dbApiKey) {
    errors.push('DB_API_KEY environment variable is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Deutsche Bahn API endpoints
export const DB_API_ENDPOINTS = {
  stations: '/stada/v2/stations',
  timetables: '/timetables/v1',
  facilities: '/fasta/v2/facilities',
  // Note: These are example endpoints - actual endpoints may vary
  // Users will need to check Deutsche Bahn API documentation for correct endpoints
} as const;
