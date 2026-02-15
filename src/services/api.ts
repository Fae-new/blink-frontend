import axios, { AxiosError } from 'axios';
import type { Collection, CollectionTree, Item } from '../types/collection';
import type { RequestDetails, UpdateRequestPayload } from '../types/request';
import type { ExecutionResponse, ApiError, UploadResponse } from '../types/response';
import type { Environment, CreateEnvironmentPayload, UpdateEnvironmentPayload, EnvironmentVariable } from '../types/environment';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || 'An unexpected error occurred';

    // Error mapping for toast notifications
    const errorType = errorData?.error || 'unknown_error';
    const statusCode = error.response?.status || 500;

    // Create enhanced error object
    const enhancedError = {
      ...error,
      userMessage: getUserFriendlyMessage(errorType, statusCode, errorMessage),
      errorType,
      statusCode,
    };

    return Promise.reject(enhancedError);
  }
);

function getUserFriendlyMessage(errorType: string, statusCode: number, message: string): string {
  switch (errorType) {
    case 'validation_error':
      return `Validation Error: ${message}`;
    case 'ssrf_protection':
      return 'Security Error: This request is blocked to protect against server-side request forgery';
    case 'not_found':
      return 'Resource not found';
    case 'rate_limit_exceeded':
      return 'Rate limit exceeded. Please wait before making more requests';
    case 'execution_error':
      return `Request execution failed: ${message}`;
    case 'invalid_item_type':
      return 'Cannot execute folders. Please select a request';
    case 'invalid_request':
      return `Invalid request: ${message}`;
    case 'database_error':
      return 'A database error occurred. Please try again';
    case 'import_error':
      return `Failed to import collection: ${message}`;
    default:
      if (statusCode >= 500) {
        return 'Server error. Please try again later';
      }
      return message || 'An error occurred';
  }
}

// API methods
export const apiService = {
  // Health check
  async checkHealth(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
  },

  // Upload Postman collection
  async uploadCollection(collectionData: unknown): Promise<UploadResponse> {
    const response = await api.post<UploadResponse>('/api/v1/collections/upload', collectionData);
    return response.data;
  },

  // List all collections
  async getCollections(): Promise<Collection[]> {
    const response = await api.get<{ collections: Collection[] }>('/api/v1/collections');
    return response.data.collections;
  },

  // Get collection tree
  async getCollectionTree(collectionId: number): Promise<CollectionTree> {
    const response = await api.get<{ collection: Collection; items: Item[] }>(`/api/v1/collections/${collectionId}/tree`);
    // Transform backend response to frontend structure
    return {
      ...response.data.collection,
      children: response.data.items,
    };
  },

  // Get item details
  async getItemDetails(itemId: number): Promise<RequestDetails> {
    const response = await api.get<any>(`/api/v1/items/${itemId}`);
    const data = response.data;

    // Transform extraction_rules from backend snake_case to frontend camelCase
    const transformedRules = (data.extraction_rules || [])
      .map((rule: any) => ({
        id: rule.id || crypto.randomUUID(),
        enabled: rule.enabled ?? true,
        jsonPath: rule.json_path || rule.jsonPath || '',
        variableName: rule.variable_name || rule.variableName || '',
      }))
      // Filter out empty rules (both fields empty)
      .filter((rule: any) => rule.jsonPath || rule.variableName);

    return {
      ...data,
      extraction_rules: transformedRules,
    };
  },

  // Create new item (folder or request)
  async createItem(collectionId: number, data: {
    name: string;
    item_type: 'folder' | 'request';
    parent_id?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url?: string;
    headers?: Array<{ key: string; value: string; enabled?: boolean }>;
    body?: string;
  }): Promise<Item> {
    const response = await api.post<Item>(`/api/v1/collections/${collectionId}/items`, data);
    return response.data;
  },

  // Delete item (folder or request)
  async deleteItem(itemId: number): Promise<void> {
    await api.delete(`/api/v1/items/${itemId}`);
  },

  // Execute request
  async executeRequest(itemId: number, requestData?: UpdateRequestPayload): Promise<ExecutionResponse> {
    // If requestData is provided, transform extraction_rules to backend format
    let payload = requestData || {};
    if (requestData?.extraction_rules) {
      payload = {
        ...requestData,
        extraction_rules: requestData.extraction_rules.map(rule => ({
          id: rule.id,
          enabled: rule.enabled,
          json_path: rule.jsonPath,
          variable_name: rule.variableName,
        })),
      };
    }

    const response = await api.post<ExecutionResponse>(
      `/api/v1/items/${itemId}/execute`,
      payload
    );
    return response.data;
  },

  // Update request
  async updateRequest(itemId: number, data: UpdateRequestPayload): Promise<RequestDetails> {
    // Transform extraction_rules from frontend camelCase to backend snake_case
    const transformedData = {
      ...data,
      extraction_rules: data.extraction_rules.map(rule => ({
        id: rule.id,
        enabled: rule.enabled,
        json_path: rule.jsonPath,
        variable_name: rule.variableName,
      })),
    };

    const response = await api.put<any>(`/api/v1/items/${itemId}`, transformedData);
    const responseData = response.data;

    // Transform response back to frontend format
    const transformedRules = (responseData.extraction_rules || [])
      .map((rule: any) => ({
        id: rule.id || crypto.randomUUID(),
        enabled: rule.enabled ?? true,
        jsonPath: rule.json_path || rule.jsonPath || '',
        variableName: rule.variable_name || rule.variableName || '',
      }))
      .filter((rule: any) => rule.jsonPath || rule.variableName);

    return {
      ...responseData,
      extraction_rules: transformedRules,
    };
  },

  // Environment endpoints
  async getEnvironments(): Promise<Environment[]> {
    const response = await api.get<Environment[]>('/api/v1/environments');
    return response.data;
  },

  async getEnvironment(id: number): Promise<Environment> {
    const response = await api.get<Environment>(`/api/v1/environments/${id}`);
    return response.data;
  },

  async createEnvironment(data: CreateEnvironmentPayload): Promise<Environment> {
    const response = await api.post<Environment>('/api/v1/environments', data);
    return response.data;
  },

  async updateEnvironment(id: number, data: UpdateEnvironmentPayload): Promise<Environment> {
    const response = await api.put<Environment>(`/api/v1/environments/${id}`, data);
    return response.data;
  },

  async deleteEnvironment(id: number): Promise<void> {
    await api.delete(`/api/v1/environments/${id}`);
  },

  async updateEnvironmentVariables(id: number, variables: EnvironmentVariable): Promise<void> {
    await api.patch(`/api/v1/environments/${id}/variables`, { variables });
  },
};

export default apiService;
