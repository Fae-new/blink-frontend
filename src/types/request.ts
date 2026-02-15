import type { ExtractionRule } from './environment';

export interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParamItem {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestDetails {
  id: number;
  collection_id: number;
  parent_id: number | null;
  name: string;
  item_type: 'folder' | 'request';
  sort_order: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: HeaderItem[];
  body: string;
  query_params?: ParamItem[];
  path_params?: ParamItem[];
  extraction_rules: ExtractionRule[];
  created_at: string;
  updated_at: string;
}

export interface WorkingRequest {
  id: number;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: HeaderItem[];
  body: string;
  query_params: ParamItem[];
  path_params: ParamItem[];
  extraction_rules: ExtractionRule[];
}

export interface UpdateRequestPayload {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: HeaderItem[];
  body: string;
  query_params: ParamItem[];
  path_params: ParamItem[];
  extraction_rules: ExtractionRule[];
}
