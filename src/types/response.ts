export interface ExecutionResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  duration_ms: number;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface UploadResponse {
  collection_id: number;
  message: string;
}
