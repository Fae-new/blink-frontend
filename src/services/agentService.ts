import axios from 'axios';
import type { ExecutionResponse } from '../types/response';
import type { UpdateRequestPayload } from '../types/request';

const AGENT_URL = 'http://localhost:5555';

export interface AgentHealthResponse {
    status: string;
    version: string;
    message: string;
}

export interface AgentError {
    status: number;
    error: string;
}

export const agentService = {
    // Check if the agent is running
    async checkHealth(): Promise<boolean> {
        try {
            const response = await axios.get<AgentHealthResponse>(`${AGENT_URL}/health`, {
                timeout: 1000, // Short timeout for quick detection
            });
            return response.status === 200 && response.data.status === 'ok';
        } catch (error) {
            return false;
        }
    },

    // Execute a request via the agent
    async executeRequest(request: UpdateRequestPayload): Promise<ExecutionResponse> {
        try {
            // Transform the request payload to match what the agent expects
            // The agent expects: method, url, headers (object), body (string)
            const headersRecord: Record<string, string> = {};
            request.headers?.forEach((h) => {
                if (h.enabled && h.key) {
                    headersRecord[h.key] = h.value;
                }
            });

            const agentPayload = {
                method: request.method,
                url: request.url,
                headers: headersRecord,
                body: request.body || '',
            };

            const response = await axios.post<ExecutionResponse | AgentError>(
                `${AGENT_URL}/execute`,
                agentPayload
            );

            // Check if response is an error from the agent (status 0)
            if ('error' in response.data && response.data.status === 0) {
                throw new Error(response.data.error); // execution_error
            }

            return response.data as ExecutionResponse;
        } catch (error: any) {
            // If it's an Axios error interacting with the Agent itself (e.g. 500 from agent, or network error)
            if (axios.isAxiosError(error)) {
                if (error.code === 'ERR_NETWORK') {
                    throw new Error('Failed to connect to Local Agent');
                }
                throw new Error(error.response?.data?.error || error.message);
            }
            throw error;
        }
    },

    // Helper to check if a URL targets localhost/private IPs
    isLocalUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname;

            // Check for localhost
            if (hostname === 'localhost') return true;

            // Check for IPv4 loopback 127.0.0.0/8
            if (hostname.startsWith('127.')) return true;

            // Check for IPv6 loopback ::1
            if (hostname === '[::1]' || hostname === '::1') return true;

            // Check for private IPv4 ranges:
            // 10.0.0.0 - 10.255.255.255
            // 172.16.0.0 - 172.31.255.255
            // 192.168.0.0 - 192.168.255.255

            const parts = hostname.split('.').map(Number);
            if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
                // 10.x.x.x
                if (parts[0] === 10) return true;
                // 172.16.x.x - 172.31.x.x
                if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
                // 192.168.x.x
                if (parts[0] === 192 && parts[1] === 168) return true;
            }

            return false;
        } catch (e) {
            // Invalid URL, let backend handle validation
            return false;
        }
    }
};
