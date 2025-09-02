import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  apiKey?: string;
  clientId?: string;
}

export class HttpClient {
  private readonly client: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Deutsche-Bahn-MCP/1.0.0',
        ...(config.apiKey && { 'DB-Api-Key': config.apiKey }),
        ...(config.clientId && { 'DB-Client-Id': config.clientId }),
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: config.maxRetries,
      retryDelay: (retryCount) => {
        return Math.min(config.retryDelay * Math.pow(2, retryCount - 1), 10000);
      },
      retryCondition: (error) => {
        // Retry on network errors and 5xx responses
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status ? error.response.status >= 500 : false);
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.warn(`Request retry attempt ${retryCount} for ${requestConfig.url}:`, error.message);
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.debug(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        console.debug(`Received ${response.status} response from ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const message = error.response?.data?.message || error.message;
        
        console.error(`HTTP ${status} error for ${url}:`, message);
        
        // Enhance error with additional context
        if (error.response) {
          error.dbApiError = {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          };
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }
}
